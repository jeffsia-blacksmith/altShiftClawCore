// commands/version.js — /version 命令
// 行为对齐旧 bundle Ko.command("version")（L12139-12142）。
// 注意：硬编码字符串，无 i18n key，无 parse_mode，无 octokit/D1。

export function registerVersion(composer) {
  composer.command("version", async (ctx) => {
    const { config } = ctx.services;
    await ctx.reply(`🦞 altShiftClawCore v${config.version}`);
  });
}