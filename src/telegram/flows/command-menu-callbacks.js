// telegram/flows/command-menu-callbacks.js — reply-keyboard 菜单按钮回调
// 行为对齐旧 bundle Ri composer（L16517-16534）。
// command_menu_skills → answer + 调用 /skills 处理逻辑（Il）；
// 其余 command_menu_* → answer + 回复 "请使用 /<command> 指令"（menu.useCommand）。

import { t, glang } from "../../i18n/index.js";
import { handleSkillsCommand } from "../commands/skills.js";

const MENU_CALLBACKS = {
  command_menu_list: { command: "/list", labelKey: "menu.list" },
  command_menu_current: { command: "/current", labelKey: "menu.current" },
  command_menu_new: { command: "/new", labelKey: "menu.new" },
  command_menu_close: { command: "/close", labelKey: "menu.close" },
  command_menu_schedules: { command: "/schedules", labelKey: "menu.schedules" },
  command_menu_help: { command: "/help", labelKey: "menu.help" },
  command_menu_workflow: { command: "/workflow", labelKey: "menu.workflow" },
};

export function registerCommandMenuCallbacks(composer) {
  // command_menu_skills → 调用 /skills 处理逻辑（对齐 Il(e)）
  composer.callbackQuery("command_menu_skills", async (ctx) => {
    const lang = ctx.language ?? glang();
    await ctx.answerCallbackQuery(t("kb.skillsManage", {}, lang));
    await handleSkillsCommand(ctx);
  });

  // 其余菜单按钮 → answer + 提示使用对应命令
  for (const [cbName, { command, labelKey }] of Object.entries(MENU_CALLBACKS)) {
    composer.callbackQuery(cbName, async (ctx) => {
      const lang = ctx.language ?? glang();
      await ctx.answerCallbackQuery(t(labelKey, {}, lang));
      await ctx.reply(t("menu.useCommand", { command }, lang));
    });
  }
}