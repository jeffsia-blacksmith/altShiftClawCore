// i18n/../lib/polyfill-buffer.js — Cloudflare Workers Buffer polyfill
// Workers 运行时默认没有 Node.js 的 Buffer 全局；需 `compatibility_flags = ["nodejs_compat"]`
// 或注入本 polyfill。为不依赖部署配置，Worker 入口注入轻量 Buffer 实现，
// 覆盖代码库用到的场景（base64 编解码、UTF-8 ↔ base64、bytes ↔ base64）。
// 若运行环境已提供原生 Buffer（nodejs_compat 已启用），本 polyfill 不覆盖之。

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

class MiniBuffer {
  constructor(arr) {
    this._arr = arr instanceof Uint8Array ? arr : new Uint8Array(arr);
  }

  // MiniBuffer.from(input, encoding?)
  static from(input, encoding) {
    if (typeof input === "string") {
      if (encoding === "base64") return new MiniBuffer(base64ToBytes(input));
      // default: utf-8
      return new MiniBuffer(encoder.encode(input));
    }
    if (input instanceof Uint8Array) return new MiniBuffer(input);
    if (input instanceof ArrayBuffer) return new MiniBuffer(new Uint8Array(input));
    if (ArrayBuffer.isView(input)) return new MiniBuffer(new Uint8Array(input.buffer, input.byteOffset, input.byteLength));
    // fallback: stringify
    return new MiniBuffer(encoder.encode(String(input)));
  }

  // buffer.toString(encoding?)
  toString(encoding) {
    if (encoding === "base64") return bytesToBase64(this._arr);
    return decoder.decode(this._arr);
  }

  get length() {
    return this._arr.length;
  }

  [Symbol.iterator]() {
    return this._arr[Symbol.iterator]();
  }
}

// 仅当全局没有 Buffer 时才注入（nodejs_compat 提供原生 Buffer 时保留原生）
if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = MiniBuffer;
}
