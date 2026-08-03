// github/secrets.js — repo secret 加密写入（行为对齐旧 bundle vi/sk/tk/rk/nk/ek/pf L14650-14708）
// libsodium sealed box 在 tweetnacl 之上需要 BLAKE2b 派生 nonce（GitHub secret 公钥用 sealed box）。
// 旧 bundle 自带 BLAKE2b 实现（mf/Rr/pf）+ 自带 sealedBox（tk）——这里原样移植，避免新增依赖。

import nacl from "tweetnacl/nacl-fast.js";

// BLAKE2b IV（mf）
const BLAKE2B_IV = new Uint32Array([
  4089235720, 1779033703, 2227873595, 3144134277, 4271175723, 1013904242, 1595750129, 2773480762,
  2917565137, 1359893119, 725511199, 2600822924, 4215389547, 528734635, 327033209, 1541459225,
]);

// SIGMA（lt）
const SIGMA = new Uint8Array([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2,
  11, 7, 5, 3, 11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4, 7, 9, 3, 1, 13, 12, 11, 14,
  2, 6, 5, 10, 4, 0, 15, 8, 9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13, 2, 12, 6, 10, 0,
  11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9, 12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11, 13,
  11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10, 6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4,
  10, 5, 10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
]);

const B = new Uint32Array(32);
const zs = new Uint32Array(32);

// G function（Rr）
function G(a, b, c, d, x, y) {
  const i = a * 2, j = b * 2, k = c * 2, l = d * 2;
  let v0, v1, t0, t1;
  v0 = B[i] + B[j]; v1 = B[i + 1] + B[j + 1];
  if (v0 >= 4294967296) v1++;
  B[i] = v0; B[i + 1] = v1;
  v0 = B[i] + zs[x]; v1 = B[i + 1] + zs[x + 1];
  if (v0 >= 4294967296) v1++;
  B[i] = v0; B[i + 1] = v1;
  t0 = B[l] ^ B[i]; t1 = B[l + 1] ^ B[i + 1];
  B[l] = t1; B[l + 1] = t0;
  v0 = B[k] + B[l]; v1 = B[k + 1] + B[l + 1];
  if (v0 >= 4294967296) v1++;
  B[k] = v0; B[k + 1] = v1;
  t0 = B[j] ^ B[k]; t1 = B[j + 1] ^ B[k + 1];
  B[j] = (t0 >>> 24) | (t1 << 8); B[j + 1] = (t1 >>> 24) | (t0 << 8);
  v0 = B[i] + B[j]; v1 = B[i + 1] + B[j + 1];
  if (v0 >= 4294967296) v1++;
  B[i] = v0; B[i + 1] = v1;
  v0 = B[i] + zs[y]; v1 = B[i + 1] + zs[y + 1];
  if (v0 >= 4294967296) v1++;
  B[i] = v0; B[i + 1] = v1;
  t0 = B[l] ^ B[i]; t1 = B[l + 1] ^ B[i + 1];
  B[l] = (t0 >>> 16) | (t1 << 16); B[l + 1] = (t1 >>> 16) | (t0 << 16);
  v0 = B[k] + B[l]; v1 = B[k + 1] + B[l + 1];
  if (v0 >= 4294967296) v1++;
  B[k] = v0; B[k + 1] = v1;
  t0 = B[j] ^ B[k]; t1 = B[j + 1] ^ B[k + 1];
  B[j] = (t0 << 1) | (t1 >>> 31); B[j + 1] = (t1 << 1) | (t0 >>> 31);
}

// BLAKE2b compress（pf）
function compress(ctx, last) {
  for (let i = 0; i < 16; i++) { B[i] = ctx.h[i]; B[16 + i] = BLAKE2B_IV[i]; }
  B[24] = B[24] ^ ctx.t;
  B[25] = B[25] ^ ((ctx.t / 4294967296) | 0);
  if (last) { B[28] = ~B[28]; B[29] = ~B[29]; }
  for (let i = 0; i < 32; i++) {
    const o = i * 4;
    zs[i] = ctx.b[o] | (ctx.b[o + 1] << 8) | (ctx.b[o + 2] << 16) | (ctx.b[o + 3] << 24);
  }
  for (let r = 0; r < 12; r++) {
    const o = r * 16;
    G(0, 4, 8, 12, SIGMA[o] * 2, SIGMA[o + 1] * 2);
    G(1, 5, 9, 13, SIGMA[o + 2] * 2, SIGMA[o + 3] * 2);
    G(2, 6, 10, 14, SIGMA[o + 4] * 2, SIGMA[o + 5] * 2);
    G(3, 7, 11, 15, SIGMA[o + 6] * 2, SIGMA[o + 7] * 2);
    G(0, 5, 10, 15, SIGMA[o + 8] * 2, SIGMA[o + 9] * 2);
    G(1, 6, 11, 12, SIGMA[o + 10] * 2, SIGMA[o + 11] * 2);
    G(2, 7, 8, 13, SIGMA[o + 12] * 2, SIGMA[o + 13] * 2);
    G(3, 4, 9, 14, SIGMA[o + 14] * 2, SIGMA[o + 15] * 2);
  }
  for (let i = 0; i < 16; i++) ctx.h[i] = ctx.h[i] ^ B[i] ^ B[16 + i];
}

// BLAKE2b hash（ek）—— outlen 24 用于 sealed box nonce
function blake2b(input, outlen) {
  const ctx = {
    h: new Uint32Array(BLAKE2B_IV),
    b: new Uint8Array(128),
    c: 0,
    t: 0,
    outlen,
  };
  ctx.h[0] = ctx.h[0] ^ (16842752 ^ outlen);
  for (let i = 0; i < input.length; i++) {
    if (ctx.c === 128) { ctx.t += ctx.c; compress(ctx, false); ctx.c = 0; }
    ctx.b[ctx.c++] = input[i];
  }
  ctx.t += ctx.c;
  for (; ctx.c < 128;) ctx.b[ctx.c++] = 0;
  compress(ctx, true);
  const out = new Uint8Array(outlen);
  for (let i = 0; i < outlen; i++) out[i] = (ctx.h[i >> 2] >>> (8 * (i & 3))) & 255;
  return out;
}

// sealed box（tk）：ephemeral keypair + box(message, nonce=blake2b(epk||pk,24), pk, esk)
function sealedBox(message, publicKey) {
  const kp = nacl.box.keyPair();
  const nonceInput = new Uint8Array(64);
  nonceInput.set(kp.publicKey, 0);
  nonceInput.set(publicKey, 32);
  const nonce = blake2b(nonceInput, 24);
  const boxed = nacl.box(message, nonce, publicKey, kp.secretKey);
  const out = new Uint8Array(32 + boxed.length);
  out.set(kp.publicKey, 0);
  out.set(boxed, 32);
  return out;
}

// base64 编/解码（rk/nk）——atob/btoa 在 Workers 不可用，用 Buffer
function base64ToBytes(b64) {
  const s = Buffer.from(b64, "base64");
  const u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s[i];
  return u;
}
function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

// sk —— fetch repo public key
async function getRepoPublicKey(octokit, owner, repo) {
  const { data } = await octokit.rest.actions.getRepoPublicKey({ owner, repo });
  return { key: data.key, key_id: data.key_id };
}

// vi —— fetch public key, encrypt with libsodium sealed box, write secret
export async function setRepoSecret(octokit, owner, repo, name, value) {
  const { key, key_id } = await getRepoPublicKey(octokit, owner, repo);
  const keyBytes = base64ToBytes(key);
  const msgBytes = new TextEncoder().encode(value);
  const encryptedBytes = sealedBox(msgBytes, keyBytes);
  const encryptedValue = bytesToBase64(encryptedBytes);
  await octokit.rest.actions.createOrUpdateRepoSecret({
    owner,
    repo,
    secret_name: name.toUpperCase(),
    encrypted_value: encryptedValue,
    key_id,
  });
}