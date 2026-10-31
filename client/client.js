window.__ModuleLoader__.load({ id: "dsh-asidenote", factory: (require) => {

var module = { exports: {} }; var exports = module.exports;
// \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
		}
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

let react = require("react");
react = __toESM(react, 1);
let react_dom_client = require("react-dom/client");
react_dom_client = __toESM(react_dom_client, 1);
let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
_deepseek_ai_dsh_client_ui_primitives = __toESM(_deepseek_ai_dsh_client_ui_primitives, 1);
let react_dom = require("react-dom");
react_dom = __toESM(react_dom, 1);

// \0dsh-css:src/client/styles/panel.css.mjs
var panel_css_default = "/*\n * Panel, composer dock, header entry and toast styles.\n *\n * Only DSH semantic aliases and the shared scale are used here — no palette of\n * its own. The entry point injects this sheet once for the whole frame, because\n * the dock mounts outside the panel tree.\n */\n/* ── 1 令牌 · 只映射 DSH 语义别名与共享尺度，不新建调色板 ─────────── */\nbody{--an-space-1:4px;--an-space-2:8px;--an-space-3:12px;--an-space-4:16px;--an-space-5:24px;--an-space-6:32px;--an-radius-pill:999px;--an-fs-caption:12px;--an-lh-caption:20px;--an-fs-row:13px;--an-lh-row:20px;--an-fs-title:14px;--an-lh-title:20px;--an-hover:var(--dsw-alias-interactive-bg-hover);--an-active:var(--dsw-alias-interactive-bg-active);--an-field:var(--dsw-alias-bg-layer-1);--an-field-line:var(--dsw-alias-border-l4);--an-divider:var(--dsw-alias-border-l2);--an-dur-fast:var(--ds-transition-duration-fast);--an-dur-base:var(--ds-transition-duration);--an-dur-spin:700ms;--an-ease:var(--ds-ease-in-out);--an-transition:background-color var(--an-dur-fast) var(--an-ease),border-color var(--an-dur-fast) var(--an-ease),color var(--an-dur-fast) var(--an-ease),opacity var(--an-dur-fast) var(--an-ease),transform var(--an-dur-fast) var(--an-ease),box-shadow var(--an-dur-fast) var(--an-ease)}\n\n/* ── 2 浮层 · 菜单材质 + 三层阴影，边框为 0（发丝线在阴影第一层） ── */\n.dsh-an-popover{position:fixed;z-index:1000;box-sizing:border-box;display:flex;flex-direction:column;gap:var(--an-space-3);min-height:0;padding:var(--an-space-4);border:0;border-radius:var(--dsw-radius-panel);background:var(--dsh-an-panelSurface);box-shadow:var(--dsw-elevation-panel);color:var(--dsw-alias-label-primary);font-size:var(--an-fs-row);line-height:var(--an-lh-row);--dsw-elevation-stroke-color:var(--dsw-alias-border-l2);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2,var(--an-divider));--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2,var(--dsw-alias-scrollbar-bg-l2,var(--an-divider)));--dsh-an-panelSurface:var(--dsw-alias-bg-layer-2);--dsh-an-listGutter:var(--an-space-4);--dsh-an-scrollRail:9px;--dsh-an-scrollInset:2px;overflow:hidden;animation:dsh-an-pop-in var(--an-dur-base) var(--an-ease) both}\n.dsh-an-popoverRight{padding-left:var(--an-space-4)}\n\n/* ── 3 面板头 · 标题与计数同一行，动作收在右侧 ───────────────────── */\n.dsh-an-popHead{display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-3);min-width:0}\n.dsh-an-popTitleLine{display:flex;align-items:center;gap:var(--an-space-3);flex:1 1 auto;min-width:0}\n.dsh-an-popTitle{min-width:0;overflow:hidden;font-size:var(--an-fs-title);line-height:var(--an-lh-title);font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap;text-overflow:ellipsis}\n.dsh-an-popMeta{min-width:0;margin:0;overflow:hidden;font-size:var(--an-fs-caption);line-height:16px;color:var(--dsw-alias-label-secondary);font-weight:400;font-variant-numeric:tabular-nums;white-space:nowrap;text-overflow:ellipsis}\n.dsh-an-popActions{display:flex;align-items:center;flex:none;gap:var(--an-space-2)}\n.dsh-an-popClose,.dsh-an-settingsBtn{display:grid;place-items:center;flex:none;width:24px;height:24px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-popClose:active,.dsh-an-settingsBtn:active{background:var(--an-active)}\n.dsh-an-settingsBtn[data-active=\"true\"]{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-settingsBtn{position:relative}\n.dsh-an-updateDot{position:absolute;top:3px;right:3px;width:6px;height:6px;border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-brand-primary);box-shadow:0 0 0 2px var(--dsh-an-panelSurface)}\n\n/* ── 4 添加区 · 嵌套表单组 R16，字段 0.5px 发丝线 ──────────────────── */\n.dsh-an-add{display:flex;flex-direction:column;gap:var(--an-space-2);padding:var(--an-space-3);border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill);transition:var(--an-transition)}\n.dsh-an-add:focus-within{border-color:var(--dsw-alias-state-business-primary)}\n.dsh-an-input{display:block;flex:0 0 auto;width:100%;min-width:0;box-sizing:border-box;min-height:var(--an-lh-row);max-height:120px;padding:0;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-row);line-height:var(--an-lh-row);resize:none;overflow-y:auto;overflow-x:hidden}\n.dsh-an-input::placeholder{color:var(--dsw-alias-label-secondary)}\n.dsh-an-addFoot{display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-2);width:100%;min-width:0}\n.dsh-an-addShortcut{min-width:0;overflow:hidden;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);white-space:nowrap;text-overflow:ellipsis}\n.dsh-an-addBtn{display:inline-flex;align-items:center;justify-content:center;flex:none;height:28px;padding:0 var(--an-space-2);border:0;border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-addBtn:active{background:var(--dsw-alias-button-primary-dimmed);transform:scale(.97)}\n.dsh-an-addBtn[disabled]{background:transparent;color:var(--dsw-alias-label-secondary);box-shadow:inset 0 0 0 0.5px var(--an-field-line);cursor:not-allowed}\n\n/* ── 5 分区与列表 · 9px 轨道内嵌 2px，底部羽化只盖内容不盖滚动条 ──── */\n/* The viewport grows into the popover padding so the 9px rail does not steal from the cards; the list pays the padding back minus the rail, so cards and the add field keep one content width at every panel size. */\n.dsh-an-listViewport{position:relative;display:flex;flex-direction:column;flex:1 1 auto;min-height:0;margin-right:calc(var(--dsh-an-listGutter) * -1)}\n/* Bottom edge treatment: a viewport-fixed alpha mask over the scroller itself, exactly like the DSH scroll areas. The first gradient fades the last 48px to transparent; the second keeps the 9px scrollbar rail opaque so the thumb stays crisp. There is no backdrop-filter layer, so there is no hard compositing edge to see. */\n.dsh-an-listViewport[data-bottom=\"true\"] .dsh-an-listArea{--dsh-an-fadeHeight:calc(var(--an-space-6) + var(--an-space-4));-webkit-mask-image:linear-gradient(to bottom,currentColor 0,currentColor calc(100% - var(--dsh-an-fadeHeight)),transparent 100%),linear-gradient(to right,transparent calc(100% - var(--dsh-an-scrollRail)),currentColor calc(100% - var(--dsh-an-scrollRail)));mask-image:linear-gradient(to bottom,currentColor 0,currentColor calc(100% - var(--dsh-an-fadeHeight)),transparent 100%),linear-gradient(to right,transparent calc(100% - var(--dsh-an-scrollRail)),currentColor calc(100% - var(--dsh-an-scrollRail)));-webkit-mask-composite:source-over;mask-composite:add}\n/* Geometry only: the shared DSH skin paints the thumb, so the plugin declares no scrollbar pseudo-elements. The popover already binds the l2 thumb pair for the menu material. */\n.dsh-an-listArea{--dsh-scrollbar-width:var(--dsh-an-scrollRail);--dsh-scrollbar-thumb-border:var(--dsh-an-scrollInset);display:flex;flex-direction:column;flex:1 1 auto;min-height:0;padding-right:calc(var(--dsh-an-listGutter) - var(--dsh-an-scrollRail));overflow-x:hidden;overflow-y:auto;scrollbar-gutter:stable}\n.dsh-an-listSection{display:flex;flex-direction:column;gap:var(--an-space-2);min-width:0}\n.dsh-an-listSection+.dsh-an-listSection{margin-top:var(--an-space-2)}\n.dsh-an-sectionHead,.dsh-an-doneHead{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-3);min-height:28px;margin:0;padding:var(--an-space-1) 0;background:transparent;transition:background-color var(--an-dur-fast) var(--an-ease)}\n.dsh-an-sectionHead[data-stuck],.dsh-an-doneHead[data-stuck]{background:var(--dsh-an-panelSurface,var(--dsw-alias-bg-layer-2))}\n.dsh-an-doneToggle{display:flex;align-items:center;gap:var(--an-space-2);flex:none;min-width:0;margin:0;padding:var(--an-space-1) var(--an-space-2) var(--an-space-1) 0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;text-align:left;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-doneToggle:active{background:var(--an-active)}\n.dsh-an-doneToggle[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-chevron{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:var(--dsw-alias-label-secondary);transition:transform var(--an-dur-fast) var(--an-ease)}\n.dsh-an-chevron[data-open=\"true\"]{transform:rotate(90deg)}\n.dsh-an-sectionCount{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 var(--an-space-1);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary);font-size:var(--an-fs-caption);line-height:16px;font-weight:500;font-variant-numeric:tabular-nums}\n.dsh-an-clear{display:inline-flex;align-items:center;flex:none;height:24px;margin-left:auto;padding:0 var(--an-space-2);border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-clear:active{background:var(--an-active);color:var(--dsw-alias-label-primary)}\n.dsh-an-clearConfirm{display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-2);min-width:0;margin-top:var(--an-space-1);padding:var(--an-space-2);border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill)}\n.dsh-an-clearConfirmText{flex:1 1 auto;min-width:0;margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}\n.dsh-an-clearConfirmActions{display:flex;align-items:center;flex:none;gap:var(--an-space-1)}\n.dsh-an-doneRows{margin-top:var(--an-space-2)}\n.dsh-an-rows{list-style:none;margin:0;padding:0;border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill);overflow:hidden}\n.dsh-an-row{display:flex;align-items:flex-start;gap:var(--an-space-2);padding:var(--an-space-2);border-top:0.5px solid var(--an-divider);transition:var(--an-transition)}\n.dsh-an-row:first-child{border-top:0}\n\n/* ── 6 一行便笺 · 勾选圈 14px，命中区 24px ─────────────────────────── */\n.dsh-an-check{display:flex;align-items:center;justify-content:center;flex:none;width:24px;height:24px;margin:-2px 0 0;padding:0;border:0;border-radius:var(--an-radius-pill);corner-shape:round;background:transparent;color:transparent;font:inherit;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-checkCircle{display:flex;align-items:center;justify-content:center;width:14px;height:14px;box-sizing:border-box;border:0.5px solid var(--dsw-alias-label-tertiary);border-radius:var(--an-radius-pill);corner-shape:round;background:transparent;color:transparent;transition:border-color var(--an-dur-fast) var(--an-ease),background-color var(--an-dur-fast) var(--an-ease),color var(--an-dur-fast) var(--an-ease),transform var(--an-dur-fast) var(--an-ease)}\n.dsh-an-check:active .dsh-an-checkCircle{transform:scale(.9)}\n.dsh-an-check[aria-checked=\"true\"] .dsh-an-checkCircle{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground)}\n.dsh-an-itemBody{display:flex;flex:1;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-text{display:block;width:100%;margin:0;padding:0;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-row);line-height:var(--an-lh-row);text-align:left;white-space:pre-wrap;overflow-wrap:anywhere;cursor:text;user-select:text;-webkit-user-select:text}\n.dsh-an-rowDone .dsh-an-text{color:var(--dsw-alias-label-secondary);text-decoration:line-through;text-decoration-thickness:1px;text-decoration-color:var(--dsw-alias-label-tertiary)}\n.dsh-an-rowFoot{display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-2);min-height:24px}\n.dsh-an-meta{flex:0 1 auto;min-width:0;overflow:hidden;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap;text-overflow:ellipsis}\n\n/* ── 7 行操作 · 图标按钮 H24/R8，触摸端常显 ────────────────────────── */\n.dsh-an-actions{display:flex;flex:none;gap:var(--an-space-1)}\n.dsh-an-iconBtn{position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-iconBtn:active{background:var(--an-active);color:var(--dsw-alias-label-primary);transform:scale(.94)}\n.dsh-an-iconBtn:disabled,.dsh-an-iconBtn[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-forwardMark{position:absolute;right:0;bottom:0;display:flex;align-items:center;justify-content:center;width:10px;height:10px;border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-label-secondary);color:var(--dsw-alias-label-primary-foreground);pointer-events:none}\n\n/* ── 8 就地编辑 · 保存/取消为紧凑描边按钮 ──────────────────────────── */\n.dsh-an-edit{display:flex;flex-direction:column;gap:var(--an-space-1);width:100%}\n.dsh-an-editInput{display:block;width:100%;box-sizing:border-box;min-height:var(--an-lh-row);max-height:160px;padding:var(--an-space-1) var(--an-space-2);border:0.5px solid var(--an-field-line);border-radius:var(--dsw-radius-sm);background:var(--an-field);color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-row);line-height:var(--an-lh-row);outline:0;resize:none;overflow-y:auto;overflow-x:hidden;transition:var(--an-transition)}\n.dsh-an-editInput:focus{border-color:var(--dsw-alias-state-business-primary)}\n.dsh-an-editActions{display:flex;align-items:center;gap:var(--an-space-1)}\n.dsh-an-editHint{flex:1 1 auto;min-width:0;margin-left:auto;overflow:hidden;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);text-align:right;color:var(--dsw-alias-label-secondary);white-space:nowrap;text-overflow:ellipsis}\n.dsh-an-mini{display:inline-flex;align-items:center;justify-content:center;flex:none;height:24px;padding:0 var(--an-space-2);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-mini:active{background:var(--an-active)}\n.dsh-an-mini[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-miniPrimary{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}\n.dsh-an-miniPrimary:active{background:var(--dsw-alias-button-primary-dimmed)}\n.dsh-an-miniDanger{border-color:transparent;background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-foreground)}\n.dsh-an-miniDanger:active{background:var(--dsw-alias-state-error-primary)}\n\n/* ── 9 空态 · 虚线 1px，说明 12/次级墨色 ──────────────────────────── */\n.dsh-an-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--an-space-2);padding:var(--an-space-5) var(--an-space-4);border:1px dashed var(--an-divider);border-radius:var(--dsw-radius-lg);text-align:center}\n.dsh-an-emptyIcon{display:flex;align-items:center;justify-content:center;width:32px;height:32px;margin:0 0 var(--an-space-1);border-radius:var(--dsw-radius-md);background:var(--an-hover);color:var(--dsw-alias-label-secondary)}\n.dsh-an-emptyTitle{font-size:var(--an-fs-row);line-height:var(--an-lh-row);font-weight:500;color:var(--dsw-alias-label-primary)}\n.dsh-an-emptyBody{max-width:36ch;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}\n\n/* ── 10 设置 · 分组 R16，项间 0.5px 分隔线，链接走 --dsw-alias-link ── */\n.dsh-an-settings{--dsh-an-settingIndent:var(--an-space-3);display:flex;flex-direction:column;gap:var(--an-space-2);margin:0;padding:var(--an-space-3);border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill)}\n.dsh-an-settingsHead{font-size:var(--an-fs-row);line-height:var(--an-lh-row);font-weight:500;color:var(--dsw-alias-label-primary)}\n.dsh-an-settingGroup{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-settingGroup+.dsh-an-settingGroup{margin-top:var(--an-space-2);padding-top:var(--an-space-2);border-top:0.5px solid var(--an-divider)}\n.dsh-an-settingLabel{font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;color:var(--dsw-alias-label-secondary)}\n.dsh-an-settingBody{display:flex;flex-direction:column;gap:var(--an-space-1);padding-left:var(--dsh-an-settingIndent)}\n.dsh-an-settingItem{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-settingItem+.dsh-an-settingItem{margin-top:var(--an-space-2);padding-top:var(--an-space-2);border-top:0.5px solid var(--an-divider)}\n.dsh-an-settingChoices{display:flex;flex-direction:column;gap:var(--an-space-1)}\n.dsh-an-settingChoice{display:flex;align-items:flex-start;gap:var(--an-space-2);font-size:var(--an-fs-row);line-height:var(--an-lh-row);color:var(--dsw-alias-label-primary);cursor:pointer}\n.dsh-an-settingChoice input{appearance:none;flex:none;width:14px;height:14px;margin:calc((var(--an-lh-row) - 14px) / 2) 0 0;box-sizing:border-box;border:0.5px solid var(--dsw-alias-label-tertiary);border-radius:var(--an-radius-pill);corner-shape:round;background:transparent;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-settingChoice input:checked{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);box-shadow:inset 0 0 0 3px var(--an-field)}\n.dsh-an-settingInput{box-sizing:border-box;width:100%;height:28px;padding:0 var(--an-space-2);border:0.5px solid var(--an-field-line);border-radius:var(--dsw-radius-sm);background:var(--an-field);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:var(--an-fs-row);line-height:var(--an-lh-row);font-weight:500;outline:0;transition:var(--an-transition)}\n.dsh-an-settingItem>.dsh-an-settingInput{font-family:inherit;font-size:var(--an-fs-row);line-height:var(--an-lh-row);font-weight:500}\n.dsh-an-settingInput:focus{border-color:var(--dsw-alias-state-business-primary)}\n/* 前缀提示词改为文本域：min-height 兜住三行，空态也不会被内联高度压扁 */\n.dsh-an-settingTextarea{display:block;height:auto;min-height:calc(var(--an-lh-row) + var(--an-space-4) + 2px);padding:var(--an-space-2);resize:none;overflow-y:auto;white-space:pre-wrap;overflow-wrap:anywhere}\n.dsh-an-settingHint{margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary)}\n.dsh-an-settingHintNote{margin-top:var(--an-space-1)}\n.dsh-an-settingAbout{display:flex;align-items:center;gap:var(--an-space-2);flex-wrap:wrap;min-width:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary)}\n.dsh-an-settingAbout>span{flex:none}\n.dsh-an-settingAuthor{flex:none;margin-left:auto;white-space:nowrap}\n.dsh-an-settingAbout .dsh-an-updateHint{flex:0 1 auto;min-width:0}\n.dsh-an-settingProject{display:flex;align-items:baseline;gap:var(--an-space-1);min-width:0;overflow:hidden;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);white-space:nowrap}\n.dsh-an-settingProject>span{flex:none}\n.dsh-an-settingLink{flex:0 1 auto;min-width:0;overflow:hidden;color:var(--dsw-alias-link);font-weight:500;text-decoration:none;text-overflow:ellipsis;transition:var(--an-transition)}\n.dsh-an-settingLink:focus-visible{text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px}\n/* 更新中心：检查入口、可展开的更新说明与更新动作，全部走共享令牌 */\n.dsh-an-updateCheck{flex:none;height:24px;padding:0 var(--an-space-2);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--an-radius-pill);corner-shape:round;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-updateCheck:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}\n.dsh-an-updateHint{margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}\n.dsh-an-updateHintError{color:var(--dsw-alias-state-error-primary)}\n.dsh-an-updateCard{display:flex;flex-direction:column;gap:var(--an-space-2);margin-top:var(--an-space-1);padding:var(--an-space-2);border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1)}\n.dsh-an-updateTitle{font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;color:var(--dsw-alias-label-primary)}\n.dsh-an-updateLinks{display:flex;align-items:center;gap:var(--an-space-3);flex-wrap:wrap;min-width:0}\n.dsh-an-updateToggle{flex:none;padding:0;border:0;background:transparent;color:var(--dsw-alias-link);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;text-align:left;transition:var(--an-transition)}\n.dsh-an-updateToggle:focus-visible,.dsh-an-updateFull:focus-visible,.dsh-an-updateLinkBtn:focus-visible{text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px}\n.dsh-an-updateFull{flex:none;color:var(--dsw-alias-link);font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;text-decoration:none;transition:var(--an-transition)}\n.dsh-an-updateNotes{display:flex;flex-direction:column;gap:var(--an-space-2);max-height:220px;overflow-y:auto;padding-right:var(--an-space-1);overscroll-behavior:contain}\n.dsh-an-updateVersions{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-updateVersion{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-updateVersion+.dsh-an-updateVersion{padding-top:var(--an-space-1);border-top:0.5px solid var(--an-divider)}\n.dsh-an-updateVersionHead{display:flex;align-items:center;gap:var(--an-space-1);width:100%;padding:2px 0;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;text-align:left;cursor:pointer}\n.dsh-an-updateVersionHead:focus-visible{text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px}\n.dsh-an-updateChevron{flex:none;width:10px;color:var(--dsw-alias-label-tertiary);font-size:var(--an-fs-caption);transition:transform var(--an-dur-fast) var(--an-ease)}\n.dsh-an-updateChevron[data-open=\"true\"]{transform:rotate(90deg)}\n.dsh-an-updateVersionLabel{font-variant-numeric:tabular-nums}\n.dsh-an-updateLatest{flex:none;padding:0 var(--an-space-1);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-secondary);font-size:var(--an-fs-caption);line-height:16px;font-weight:500}\n.dsh-an-updateVersionBody{display:flex;flex-direction:column;gap:var(--an-space-2);padding-left:var(--an-space-4);min-width:0}\n.dsh-an-updateGroup{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-updateGroupTitle{font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;color:var(--dsw-alias-label-secondary)}\n.dsh-an-updateItems{display:flex;flex-direction:column;gap:var(--an-space-1);margin:0;padding-left:var(--an-space-4);color:var(--dsw-alias-label-primary)}\n.dsh-an-updateItem{font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);overflow-wrap:anywhere}\n.dsh-an-updateItem strong{font-weight:500}\n.dsh-an-updateActions{display:flex;align-items:center;gap:var(--an-space-2);flex-wrap:wrap;min-width:0}\n.dsh-an-updatePrimary{display:inline-flex;align-items:center;justify-content:center;flex:none;height:26px;padding:0 var(--an-space-3);border:0;border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-updatePrimary:disabled{opacity:.55;cursor:default}\n.dsh-an-updateDone{display:flex;align-items:center;gap:var(--an-space-2);flex-wrap:wrap;min-width:0}\n.dsh-an-updateError{display:flex;align-items:baseline;gap:var(--an-space-2);flex-wrap:wrap;margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-state-error-primary);overflow-wrap:anywhere}\n.dsh-an-updateLinkBtn{padding:0;border:0;background:transparent;color:var(--dsw-alias-link);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer}\n\n/* ── 11 面板脚注 · 存储状态就地提示，错误用状态色 ─────────────────── */\n.dsh-an-popFoot{margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary)}\n.dsh-an-error{color:var(--dsw-alias-state-error-primary)}\n\n/* ── 12 会话顶部入口 · H28/R8，计数徽标为胶囊 ──────────────────────── */\n.dsh-an-headerBtn{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-headerBtn:active{background:var(--an-active);color:var(--dsw-alias-label-primary)}\n.dsh-an-headerBtn[data-active=\"true\"]{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-headerBtn[data-disabled=\"true\"]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-headerIcon{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:currentColor}\n.dsh-an-headerCount{position:absolute;top:-2px;right:-2px;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 var(--an-space-1);border:0.5px solid var(--dsw-alias-bg-base);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-secondary);font-size:var(--an-fs-caption);line-height:14px;font-weight:500;font-variant-numeric:tabular-nums}\n\n/* ── 13 拖拽把手 · 8px 命中带，3px 视觉条 ─────────────────────────── */\n.dsh-an-resizeHandle{position:absolute;left:0;top:0;bottom:0;z-index:2;display:flex;align-items:center;justify-content:center;width:var(--an-space-2);cursor:ew-resize;touch-action:none;outline:0}\n.dsh-an-resizeHandle::before{content:\"\";width:3px;height:var(--an-space-6);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-border-l4);transition:transform var(--an-dur-fast) var(--an-ease),background-color var(--an-dur-fast) var(--an-ease)}\n.dsh-an-resizeHandle:focus-visible::before{background:var(--dsw-alias-label-secondary)}\n.dsh-an-resizeHandle:focus-visible{outline-offset:-2px;border-radius:var(--dsw-radius-sm)}\n.dsh-an-resizeHandleBottom{position:absolute;left:50%;bottom:0;z-index:2;display:flex;align-items:center;justify-content:center;width:var(--an-space-6);height:var(--an-space-3);transform:translateX(-50%);cursor:ns-resize;touch-action:none;outline:0}\n.dsh-an-resizeHandleBottom::before{content:\"\";width:var(--an-space-5);height:3px;border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-border-l4);transition:transform var(--an-dur-fast) var(--an-ease),background-color var(--an-dur-fast) var(--an-ease)}\n.dsh-an-resizeHandleBottom:focus-visible::before{background:var(--dsw-alias-label-secondary)}\n.dsh-an-resizeHandleBottom:focus-visible{outline-offset:-2px;border-radius:var(--dsw-radius-sm)}\n\n/* ── 14 加载 · 控件内 12px 环，文字隐藏，不报\"进行中\" ──────────────── */\n[data-loading=\"true\"]{position:relative;color:transparent!important;pointer-events:none;cursor:progress}\n[data-loading=\"true\"]>*{visibility:hidden}\n[data-loading=\"true\"]::after{content:\"\";position:absolute;left:50%;top:50%;box-sizing:border-box;width:12px;height:12px;margin:-6px 0 0 -6px;border:1.5px solid var(--dsw-alias-label-secondary);border-top-color:transparent;border-radius:var(--an-radius-pill);corner-shape:round;animation:dsh-an-spin var(--an-dur-spin) linear infinite}\n\n/* ── 15 悬停 · 只在支持 hover 的设备上启用（触摸端常显操作） ────────── */\n@media (hover:hover){\n.dsh-an-row:hover{background:var(--an-hover)}\n.dsh-an-actions{opacity:0;pointer-events:none}\n.dsh-an-row:hover .dsh-an-actions,.dsh-an-row:focus-within .dsh-an-actions{opacity:1;pointer-events:auto}\n.dsh-an-iconBtn:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-iconBtnDanger:hover{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}\n.dsh-an-popClose:hover,.dsh-an-settingsBtn:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-addBtn:hover:not([disabled]){background:var(--dsw-alias-button-primary-hover)}\n.dsh-an-mini:hover:not([disabled]){background:var(--an-hover)}\n.dsh-an-miniPrimary:hover:not([disabled]){background:var(--dsw-alias-button-primary-hover);color:var(--dsw-alias-label-primary-foreground)}\n.dsh-an-miniDanger:hover:not([disabled]){background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}\n.dsh-an-clear:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-doneToggle:hover{background:var(--an-hover)}\n.dsh-an-check:hover .dsh-an-checkCircle{border-color:var(--dsw-alias-label-primary)}\n.dsh-an-settingChoice:hover input{border-color:var(--dsw-alias-label-primary)}\n.dsh-an-settingLink:hover{text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px}\n.dsh-an-updatePrimary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}\n.dsh-an-headerBtn:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-resizeHandle:hover::before{transform:scaleY(1.4);background:var(--dsw-alias-label-secondary)}\n.dsh-an-resizeHandleBottom:hover::before{transform:scaleX(1.4);background:var(--dsw-alias-label-secondary)}\n}\n\n/* ── 16 动效 · 只动 opacity/transform，错峰出场封顶 ─────────────────── */\n@media (prefers-reduced-motion:no-preference){\n.dsh-an-rows>.dsh-an-row{animation:dsh-an-row-in var(--an-dur-base) var(--an-ease) both}\n.dsh-an-rows>.dsh-an-row:nth-child(2){animation-delay:var(--an-space-1)}\n.dsh-an-rows>.dsh-an-row:nth-child(3){animation-delay:var(--an-space-2)}\n.dsh-an-rows>.dsh-an-row:nth-child(4){animation-delay:calc(var(--an-space-2) + var(--an-space-1))}\n.dsh-an-rows>.dsh-an-row:nth-child(n+5){animation-delay:var(--an-space-3)}\n}\n@keyframes dsh-an-pop-in{from{opacity:0}to{opacity:1}}\n@keyframes dsh-an-row-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}\n@keyframes dsh-an-spin{to{transform:rotate(360deg)}}\n@media (prefers-reduced-motion:reduce){\n.dsh-an-popover,.dsh-an-rows>.dsh-an-row,.dsh-an-chevron,[data-loading=\"true\"]::after{animation:none}\n.dsh-an-popover,.dsh-an-row,.dsh-an-actions,.dsh-an-iconBtn{transition-duration:1ms}\n}\n\n/* ── 17 窄视口 · 390 基准下收紧内边距，主操作全部可达 ──────────────── */\n@media (max-width:480px){\n.dsh-an-popover{padding:var(--an-space-3);--dsh-an-listGutter:var(--an-space-3)}\n.dsh-an-popoverRight{padding-left:var(--an-space-4)}\n.dsh-an-popHead{gap:var(--an-space-2)}\n.dsh-an-add{padding:var(--an-space-2) var(--an-space-3)}\n.dsh-an-sectionHead,.dsh-an-doneHead{min-height:24px}\n}\n\n";

// src/client/constants.ts
/**
* Plugin identity, storage keys, limits and platform helpers.
*
* Everything whose value is part of the on-disk contract lives here; the
* storage modules and the panel import it instead of repeating literals.
*/
/** Locale namespace of this plugin's copy (also binds the renderer's `t` prop). */
const NS = "dsh-asidenote";
/** Sidebar launcher id and the main panel key it addresses. */
const PANEL_ID = "dsh-asidenote";
/** Session-scoped memo store used by the popover and the session-header entry. */
const SESSION_STORAGE_KEY = "dsh.aside-notes.v2";
/** Unsaved add/edit drafts, restored when the panel is reopened. */
const DRAFT_STORAGE_KEY = "dsh.aside-notes.drafts.v2";
/** Notes already forwarded to the composer, per session; marks the forward button. */
const FORWARDED_STORAGE_KEY = "dsh.aside-notes.forwarded.v2";
/** Shown in the in-panel settings; keep in sync with package.json. */
const PLUGIN_VERSION = "2.1.0";
const PLUGIN_AUTHOR = "阿三石";
const PLUGIN_REPO_URL = "https://github.com/Rayle8/dsh-asidenote";
const PLUGIN_REPO_LABEL = "github.com/Rayle8/dsh-asidenote";
/** Send preference; persisted across panel openings. Enter sends by default. */
const SEND_SHORTCUT_KEY = "dsh.aside-notes.send-shortcut.v2";
/** Lead-in written before a forwarded note; empty means no prefix. */
const FORWARD_PREFIX_STORAGE_KEY = "dsh.aside-notes.forward-prefix.v2";
const SEND_SHORTCUT_DEFAULT = "enter";
/** macOS names the command modifier with a symbol; other platforms say Ctrl. */
const IS_MAC = (() => {
	try {
		const platform = navigator.userAgentData && navigator.userAgentData.platform || navigator.platform || "";
		return /mac/i.test(String(platform));
	} catch {
		return false;
	}
})();
const MOD_LABEL = IS_MAC ? "⌘" : "Ctrl";
/** Whether the key event carries this platform's command modifier. */
function isSendModifier(event) {
	return IS_MAC ? event.metaKey === true : event.ctrlKey === true;
}
/** Remembered expand/collapse state of the open/completed sections. */
const SECTION_STATE_KEY = "dsh.aside-notes.sections.v2";
const SECTION_STATE_DEFAULT = {
	open: true,
	done: false
};
/** How long the inline clear-completed confirmation waits before it dismisses itself. */
const CLEAR_CONFIRM_MS = 5e3;
/** Persisted width of the experimental right-side panel. */
const PANEL_WIDTH_KEY = "dsh.aside-notes.panel-width.v2";
/** Persisted height of the experimental right-side panel; 0 means content-sized. */
const PANEL_HEIGHT_KEY = "dsh.aside-notes.panel-height.v2";

// src/client/i18n/en.ts
/** English copy; a missing key fails the typecheck rather than falling back at runtime. */
const en = {
	"nav.label": "Notes",
	"title": "Notes",
	"popover.title": "Notes",
	"popover.close": "Close notes",
	"popover.count": "{open} open · {total} total",
	"popover.completed": "Completed",
	"popover.clearCancel": "Cancel",
	"popover.clearConfirm": "Clear {n} completed notes?",
	"popover.clearConfirmAction": "Clear",
	"popover.clearDone": "Clear completed",
	"popover.storage": "Separate per session · saved only on this device",
	"popover.empty.title": "No notes yet",
	"popover.empty.body": "Write down one follow-up for this session",
	"settings.open": "Settings",
	"settings.title": "Settings",
	"settings.about": "About",
	"settings.version": "Version",
	"settings.author": "Author",
	"settings.project": "Project",
	"settings.shortcut": "Send shortcut",
	"settings.shortcutCtrlEnter": "{mod}+Enter sends, Enter for a new line",
	"settings.shortcutEnter": "Enter sends, {mod}+Enter for a new line",
	"settings.forward": "One-click forward",
	"settings.forwardPrefixItem": "Prefix prompt",
	"settings.forwardPrefixHint": "When forwarding into an empty composer, this prompt is written before the note; leave it empty to forward the note on its own",
	"add.placeholder": "Write a note",
	"add.shortcut": "{mod}+Enter sends · Enter for a new line",
	"add.shortcutEnter": "Enter sends · {mod}+Enter for a new line",
	"add.action": "Add",
	"list.open": "Open",
	"list.allDone.title": "Nothing left open",
	"list.allDone.body": "Add another note, or expand completed below to look back",
	"item.markDone": "Mark as done",
	"item.markOpen": "Mark as open",
	"item.copy": "Copy",
	"item.forward": "Forward to chat",
	"item.forwarded": "Forwarded to chat — click to remove the mark",
	"item.edit": "Edit",
	"item.delete": "Delete",
	"item.editHint": "Double-click to edit",
	"edit.save": "Save",
	"edit.cancel": "Cancel",
	"edit.hintCtrlEnter": "{mod}+Enter saves · Enter for a new line",
	"edit.hintEnter": "Enter saves · {mod}+Enter for a new line",
	"time.now": "just now",
	"time.minutes": "{n} min ago",
	"time.hours": "{n} hr ago",
	"time.days": "{n} d ago",
	"time.createdDone": "Created {created} · Completed {completed}",
	"storage.failed": "Local storage is unavailable; changes may not persist",
	"forward.prefix": "Complete this task:",
	"resize.width": "Resize notes width",
	"resize.height": "Resize notes height",
	"resize.hint": "Drag to resize, double-click to reset",
	"dock.open": "Open notes",
	"dock.count": "{n} open",
	"header.tooltip": "Session notes {n}",
	"header.tooltipEmpty": "Session notes",
	"toast.copied": "Copied",
	"toast.copyFailed": "Copy failed — try again",
	"toast.forwarded": "Forwarded to chat",
	"toast.unforwarded": "Forward mark removed",
	"toast.forwardFailed": "No composer found — nothing was forwarded",
	"toast.deleted": "Deleted",
	"toast.cleared": "Cleared completed",
	"toast.saveFailed": "Save failed — nothing changed",
	"update.label": "Update available",
	"update.tip": "Version {version} is now available — open the release notes",
	"update.check": "Check for updates",
	"update.checking": "Checking…",
	"update.retryCheck": "Retry check",
	"update.current": "You're up to date",
	"update.checkFailed": "Check failed — try again later",
	"update.available": "Version {version} is available",
	"update.notesShow": "What's new",
	"update.notesHide": "Hide what's new",
	"update.notesLoading": "Loading release notes…",
	"update.notesMissing": "No release notes to show for this version yet",
	"update.historyCount": "{n} releases included",
	"update.latest": "Latest",
	"update.olderNotes": "Earlier releases are in the full release notes",
	"update.notesFailed": "Could not load the release notes — open the full notes",
	"update.full": "Full release notes",
	"update.now": "Update now",
	"update.starting": "Preparing the update…",
	"update.updating": "Updating…",
	"update.updatingPercent": "Updating… {percent}%",
	"update.updated": "Updated to {version}",
	"update.refresh": "Refresh page",
	"update.restart": "Restart DSH",
	"update.restartHint": "Restart DSH manually to finish the update",
	"update.failed": "Update failed: {reason}",
	"update.force": "Update anyway",
	"update.noMarket": "No plugin market detected, so the update cannot run in-app; update from Plugins or run pnpm update dsh-asidenote",
	"update.tooFresh": "This release is too new for the market right now — retry later or update anyway",
	"update.unchanged": "The market answered with the same version — retry later or update anyway",
	"update.notInstalled": "This plugin is not installed in the current profile, so it cannot be updated in-app",
	"update.forbidden": "The market refused this update request",
	"update.rejected": "The market did not run this update; a linked checkout updates from its own directory",
	"update.busy": "Another update is already running in the market — try again shortly",
	"update.timeout": "Timed out waiting for the update result — try again later"
};

// src/client/i18n/zh.ts
/** Chinese copy — the single source of truth for the message keys. */
const zh = {
	"nav.label": "便笺",
	"title": "便笺",
	"popover.title": "便笺",
	"popover.close": "关闭便笺",
	"popover.count": "{open} 未完成 · {total} 条",
	"popover.completed": "已完成",
	"popover.clearCancel": "取消",
	"popover.clearConfirm": "清除 {n} 项已完成便笺？",
	"popover.clearConfirmAction": "确认清除",
	"popover.clearDone": "清除已完成",
	"popover.storage": "按会话隔离 · 数据仅保存在本地",
	"popover.empty.title": "还没有便笺",
	"popover.empty.body": "记下这个会话要跟进的一件事",
	"settings.open": "设置",
	"settings.title": "设置",
	"settings.about": "关于",
	"settings.version": "版本",
	"settings.author": "作者",
	"settings.project": "项目地址",
	"settings.shortcut": "发送快捷键",
	"settings.shortcutCtrlEnter": "{mod}+Enter 发送，Enter 换行",
	"settings.shortcutEnter": "Enter 发送，{mod}+Enter 换行",
	"settings.forward": "一键转发",
	"settings.forwardPrefixItem": "前缀提示词",
	"settings.forwardPrefixHint": "转发到会话时，若输入框为空，会先写入这段提示词，再追加便笺正文；留空则只转发便笺正文",
	"add.placeholder": "记一条便笺",
	"add.shortcut": "{mod}+Enter 发送 · Enter 换行",
	"add.shortcutEnter": "Enter 发送 · {mod}+Enter 换行",
	"add.action": "添加",
	"list.open": "未完成",
	"list.allDone.title": "未完成的都清空了",
	"list.allDone.body": "可以继续添加，或展开下方回看已完成",
	"item.markDone": "标记为完成",
	"item.markOpen": "标记为未完成",
	"item.copy": "复制",
	"item.forward": "转发到会话",
	"item.forwarded": "已转发到会话，点击可移除标识",
	"item.edit": "编辑",
	"item.delete": "删除",
	"item.editHint": "双击编辑",
	"edit.save": "保存",
	"edit.cancel": "取消",
	"edit.hintCtrlEnter": "{mod}+Enter 保存 · Enter 换行",
	"edit.hintEnter": "Enter 保存 · {mod}+Enter 换行",
	"time.now": "刚刚",
	"time.minutes": "{n} 分钟前",
	"time.hours": "{n} 小时前",
	"time.days": "{n} 天前",
	"time.createdDone": "{created}创建，{completed}完成",
	"storage.failed": "本地存储不可用，改动不会保留",
	"forward.prefix": "完成以下任务：",
	"resize.width": "调整便笺宽度",
	"resize.height": "调整便笺高度",
	"resize.hint": "拖动调整，双击复位",
	"dock.open": "打开便笺",
	"dock.count": "{n} 项未完成",
	"header.tooltip": "会话便笺 {n}",
	"header.tooltipEmpty": "会话便笺",
	"toast.copied": "已复制",
	"toast.copyFailed": "复制失败，请重试",
	"toast.forwarded": "已转发到会话",
	"toast.unforwarded": "已取消转发标识",
	"toast.forwardFailed": "没有找到输入框，转发失败",
	"toast.deleted": "已删除",
	"toast.cleared": "已清除已完成",
	"toast.saveFailed": "保存失败，内容没有改动",
	"update.label": "有新版本",
	"update.tip": "新版本 {version} 已发布，点击查看更新说明",
	"update.check": "检查更新",
	"update.checking": "正在检查…",
	"update.retryCheck": "重试检查",
	"update.current": "已是最新版本",
	"update.checkFailed": "检查失败，请稍后重试",
	"update.available": "有新版本 {version}",
	"update.notesShow": "查看更新内容",
	"update.notesHide": "收起更新内容",
	"update.notesLoading": "正在读取更新说明…",
	"update.notesMissing": "这个版本还没有可显示的更新说明",
	"update.historyCount": "本次更新包含 {n} 个版本",
	"update.latest": "最新",
	"update.olderNotes": "更早的版本请见完整更新说明",
	"update.notesFailed": "更新说明读取失败，可打开完整更新说明查看",
	"update.full": "完整更新说明",
	"update.now": "立即更新",
	"update.starting": "正在准备更新…",
	"update.updating": "正在更新…",
	"update.updatingPercent": "正在更新… {percent}%",
	"update.updated": "已更新到 {version}",
	"update.refresh": "刷新页面",
	"update.restart": "重启 DSH",
	"update.restartHint": "请手动重启 DSH 以完成更新",
	"update.failed": "更新失败：{reason}",
	"update.force": "仍要更新",
	"update.noMarket": "未检测到插件市场，暂时无法在应用内更新；可在「插件」页或终端执行 pnpm update dsh-asidenote",
	"update.tooFresh": "新版本刚发布，市场暂缓安装；可稍后重试，或选择仍要更新",
	"update.unchanged": "市场返回的版本没有变化；可稍后重试，或选择仍要更新",
	"update.notInstalled": "当前 profile 中没有安装这个插件，无法在应用内更新",
	"update.forbidden": "市场拒绝了这次更新请求",
	"update.rejected": "市场没有执行这次更新；link 安装的插件需要在 checkout 中更新后刷新",
	"update.busy": "市场正在执行另一个更新，请稍后再试",
	"update.timeout": "等待更新结果超时，请稍后再试"
};

// src/client/i18n/index.ts
/** Both locales, in the shape `locale.register` expects. */
const DICT = {
	zh,
	en
};
/** Interpolate `{name}` placeholders; an absent value leaves the placeholder alone. */
function fill(template, vars) {
	return String(template).replace(/\{(\w+)\}/g, (match, name) => {
		return vars && vars[name] !== void 0 && vars[name] !== null ? String(vars[name]) : match;
	});
}
/**
* Translate through the locale service, falling back to the bundled copy.
*
* `say` stays string-keyed for now: the panel passes keys through props and
* literal objects, so a stricter key type waits until those call sites settle.
*/
function makeSay(ctx, getLocaleId) {
	const locale = ctx.get("locale");
	const bound = locale && typeof locale.bind === "function" ? locale.bind(NS) : null;
	return (key) => {
		if (bound) try {
			const value = bound(key);
			if (typeof value === "string" && value && value !== key) return value;
		} catch {}
		const language = String(getLocaleId()).split("-")[0];
		return (DICT[language] || DICT.zh)[key] || DICT.zh[key] || key;
	};
}

// src/client/ui/primitives.ts
/**
* Shared glyphs and the tooltip wrapper.
*
* Glyphs come from the product icon set; this plugin draws none of its own, so
* stroke weight, optical size and currentColor stay consistent with the shell.
* Tooltip and Toast are the seeded primitives — the bundle keeps them external.
*/
const h$11 = react.default.createElement;
const PRIMITIVES = _deepseek_ai_dsh_client_ui_primitives;
const Tooltip = typeof PRIMITIVES.Tooltip === "function" ? PRIMITIVES.Tooltip : null;
const Toast = typeof PRIMITIVES.Toast === "function" ? PRIMITIVES.Toast : null;
const icon = (name) => typeof PRIMITIVES[name] === "function" ? PRIMITIVES[name] : null;
/**
* Glyphs come from the shared product icon set; this plugin draws none of
* its own, so stroke weight, optical size and currentColor stay consistent
* with the surrounding shell.
*/
function Glyph(props) {
	const Component = icon(props.name);
	if (!Component) return null;
	return h$11(Component, { size: props.size });
}
const IconCheck = (props) => h$11(Glyph, {
	name: "IconCheckOutlineMedium",
	size: props && props.size ? props.size : 12
});
const IconCopy = () => h$11(Glyph, {
	name: "IconCopyOutlineRegular",
	size: 14
});
const IconForward = () => h$11(Glyph, {
	name: "IconShareOutlineRegular",
	size: 14
});
const IconGear = () => h$11(Glyph, {
	name: "IconSettingsOutlineRegular",
	size: 14
});
const IconPencil = () => h$11(Glyph, {
	name: "IconEditOutlineRegular",
	size: 14
});
const IconTrash = () => h$11(Glyph, {
	name: "IconTrashOutlineRegular",
	size: 14
});
const IconChevron = () => h$11(Glyph, {
	name: "IconChevronRightOutlineRegular",
	size: 12
});
const IconEmpty = () => h$11(Glyph, {
	name: "IconChecklistOutlineRegular",
	size: 18
});
const IconClose = () => h$11(Glyph, {
	name: "IconCloseOutlineRegular",
	size: 14
});
/** Wrap one icon-only control in the shared tooltip; a bare button when absent. */
function withTooltip(label, node) {
	if (!Tooltip) return node;
	return h$11(Tooltip, {
		label,
		side: "top",
		portal: true,
		gap: 6
	}, node);
}

// src/client/ui/toastSeat.ts
/** Frame-wide toast seat: one notice at a time, dismissed when it fades. */
const h$10 = react.default.createElement;
const TOAST_COPY = {
	copied: {
		key: "toast.copied",
		tone: "success"
	},
	forwarded: {
		key: "toast.forwarded",
		tone: "success"
	},
	unforwarded: {
		key: "toast.unforwarded",
		tone: "success"
	},
	deleted: {
		key: "toast.deleted",
		tone: "success"
	},
	cleared: {
		key: "toast.cleared",
		tone: "success"
	},
	copyFailed: { key: "toast.copyFailed" },
	forwardFailed: { key: "toast.forwardFailed" },
	saveFailed: { key: "toast.saveFailed" }
};
const WarningIcon = icon("IconWarningOutlineRegular");
/**
* Settled outcomes (copy, forward, delete, write failure) live in the frame,
* not inside the panel: the panel unmounts on close, the banner must not.
*/
function createToastSeat(tr) {
	const source = (() => {
		let notice = null;
		let sequence = 0;
		const listeners = /* @__PURE__ */ new Set();
		const publish = (next) => {
			notice = next;
			for (const listener of listeners) listener();
		};
		return {
			hooks: { notice: {
				getSnapshot: () => notice,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				}
			} },
			show(kind) {
				sequence += 1;
				publish({
					kind,
					sequence
				});
			},
			dismiss() {
				publish(null);
			}
		};
	})();
	/** The slot the layout mounts once; it owns the only visible notice. */
	function ToastHost(props) {
		const notice = react.default.useSyncExternalStore(source.hooks.notice.subscribe, source.hooks.notice.getSnapshot);
		if (!notice || !Toast) return null;
		const copy = TOAST_COPY[notice.kind] || TOAST_COPY.saveFailed;
		const bound = props && typeof props.t === "function" ? props.t(copy.key) : "";
		const text = bound && bound !== copy.key ? bound : tr(copy.key);
		return h$10(Toast, {
			key: notice.sequence,
			text,
			tone: copy.tone,
			icon: copy.tone ? void 0 : WarningIcon ? h$10(WarningIcon, { size: 16 }) : void 0,
			onDone: source.dismiss
		});
	}
	return {
		show: source.show,
		ToastHost
	};
}

// src/client/domain/id.ts
/** Stable ids for notes and drafts. */
function uid() {
	try {
		if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") return globalThis.crypto.randomUUID();
	} catch {}
	return `todo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// src/client/domain/items.ts
/** Note shape, ordering and relative time copy. */
/**
* Sanitize one session's notes. The store is user-editable, so treat
* every field defensively and preserve the authored order.
*/
function normalizeItems(items) {
	if (!Array.isArray(items)) return [];
	const seen = /* @__PURE__ */ new Set();
	const normalized = [];
	for (const raw of items) {
		if (!raw || typeof raw !== "object") continue;
		const text = String(raw.text || "").trim().slice(0, 280);
		if (!text) continue;
		let id = typeof raw.id === "string" && raw.id ? raw.id : uid();
		if (seen.has(id)) id = uid();
		seen.add(id);
		const done = raw.done === true;
		const createdAt = Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now();
		const updatedAt = Number.isFinite(raw.updatedAt) ? raw.updatedAt : createdAt;
		normalized.push({
			id,
			text,
			done,
			createdAt,
			updatedAt,
			...done && Number.isFinite(raw.completedAt) ? { completedAt: raw.completedAt } : {}
		});
		if (normalized.length >= 300) break;
	}
	return normalized;
}
/** Relative age copy for a note's creation stamp. */
function ageLabel(time, say, localeId) {
	const stamp = Number.isFinite(time) ? time : Date.now();
	const elapsed = Math.max(0, Date.now() - stamp);
	if (elapsed < 6e4) return say("time.now");
	const minutes = Math.floor(elapsed / 6e4);
	if (minutes < 60) return say("time.minutes", { n: minutes });
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return say("time.hours", { n: hours });
	const days = Math.floor(hours / 24);
	if (days < 7) return say("time.days", { n: days });
	try {
		return new Intl.DateTimeFormat(localeId, {
			month: "short",
			day: "numeric"
		}).format(stamp);
	} catch {
		return "";
	}
}
/**
* Best-known completion stamp for a done note. Newer records carry
* `completedAt`; older ones only have `updatedAt`, so fall back in order
* until a finite time is found. Returns 0 when the item has no usable stamp.
*/
function completedStamp(item) {
	if (!item) return 0;
	const candidates = [
		item.completedAt,
		item.updatedAt,
		item.createdAt
	];
	for (const time of candidates) if (Number.isFinite(time)) return time;
	return 0;
}
/** Newest completion first; updatedAt then createdAt keep equal stamps stable. */
function compareDoneItems(a, b) {
	const byCompletion = completedStamp(b) - completedStamp(a);
	if (byCompletion) return byCompletion;
	const aUpdated = Number.isFinite(a && a.updatedAt) ? a.updatedAt : 0;
	const bUpdated = Number.isFinite(b && b.updatedAt) ? b.updatedAt : 0;
	if (aUpdated !== bUpdated) return bUpdated - aUpdated;
	const aCreated = Number.isFinite(a && a.createdAt) ? a.createdAt : 0;
	return (Number.isFinite(b && b.createdAt) ? b.createdAt : 0) - aCreated;
}
/** Done notes show creation and completion age; open ones show creation age only. */
function metaLabel(item, say, localeId) {
	const created = ageLabel(item && item.createdAt, say, localeId);
	if (!item || item.done !== true) return created;
	return say("time.createdDone", {
		created,
		completed: ageLabel(completedStamp(item) || (item ? item.createdAt : 0), say, localeId)
	});
}

// src/client/storage/codec.ts
/** The browser store, or null when storage is blocked. */
/** The browser store, or null when storage is blocked. */
function storage() {
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}

// src/client/storage/events.ts
/**
* Same-tab change bus.
*
* The `storage` event only crosses tabs, so a write here wakes the readers in
* this tab — the header count and an open panel.
*/
/** Same-tab subscribers, so the composer dock's count follows panel edits. */
const TODO_LISTENERS = /* @__PURE__ */ new Set();
/** Notify same-tab readers after a successful write (storage events only cross tabs). */
function notifyTodoChange() {
	for (const listener of TODO_LISTENERS) try {
		listener();
	} catch (error) {
		console.error("dsh-asidenote: listener failed", error);
	}
}

// src/client/storage/session.ts
/** Session-scoped notes: the only store the panel renders. */
/** Empty session-scoped store. */
function emptySessionStore() {
	return {
		version: 1,
		sessions: {}
	};
}
/** Read the whole session memo store; corrupt or unavailable reads as empty. */
function readSessionStore() {
	const ls = storage();
	if (!ls) return emptySessionStore();
	try {
		const raw = ls.getItem(SESSION_STORAGE_KEY);
		if (!raw) return emptySessionStore();
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return emptySessionStore();
		const sessions = parsed.sessions;
		if (!sessions || typeof sessions !== "object" || Array.isArray(sessions)) return emptySessionStore();
		return {
			version: 1,
			sessions
		};
	} catch {
		return emptySessionStore();
	}
}
/** Read one session's memo record. */
function readSessionRecord(sessionId) {
	const key = sessionId ? String(sessionId) : "";
	if (!key) return {
		items: [],
		updatedAt: 0
	};
	const record = readSessionStore().sessions[key];
	return {
		items: normalizeItems(record && record.items),
		updatedAt: record && Number.isFinite(record.updatedAt) ? record.updatedAt : 0
	};
}
/** Persist one session's memo record. */
function writeSessionRecord(sessionId, record) {
	const ls = storage();
	const key = sessionId ? String(sessionId) : "";
	if (!ls || !key) return false;
	const store = readSessionStore();
	store.sessions[key] = {
		sessionId: key,
		updatedAt: record.updatedAt || Date.now(),
		items: normalizeItems(record.items)
	};
	try {
		ls.setItem(SESSION_STORAGE_KEY, JSON.stringify(store));
		notifyTodoChange();
		return true;
	} catch {
		return false;
	}
}

// src/client/ui/headerEntry.ts
/**
* The host-owned notes button in the conversation header.
*
* It is a plain DOM node beside the shell's utilities row: a React portal there
* would be reconciled away. The glyph is inlined for the same reason.
*/
const HEADER_ICON = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.25 2.75h6.5l3 3v7.5c0 .55-.45 1-1 1H3.25c-.55 0-1-.45-1-1V3.75c0-.55.45-1 1-1Z\"/><path d=\"M9.75 2.75v3h3\"/><path d=\"M4.9 7.6h5.4M4.9 9.9h3.6\" stroke-linecap=\"round\"/></svg>";
function createHeaderEntry({ getSessionId, getActiveAnchor, getLocaleId, tr, onOpen }) {
	const refresh = () => {
		const sessionId = getSessionId();
		const host = document.querySelector("[class*=\"_headerUtilities\"]");
		let button = host ? host.querySelector(":scope > .dsh-an-headerBtn") : null;
		if (!host || !sessionId) {
			if (button) button.remove();
			return;
		}
		const store = readSessionStore();
		const open = normalizeItems(store.sessions[sessionId] && store.sessions[sessionId].items).filter((item) => !item.done).length;
		if (!button) {
			button = document.createElement("button");
			button.type = "button";
			button.className = "dsh-an-headerBtn";
			button.addEventListener("pointerdown", (event) => event.stopPropagation());
			button.addEventListener("click", (event) => {
				event.preventDefault();
				event.stopPropagation();
				onOpen(sessionId, button);
			});
			host.appendChild(button);
		}
		button.dataset.active = getActiveAnchor() === button ? "true" : "false";
		const signature = `${getLocaleId()}:${sessionId}:${open}`;
		if (button.dataset.signature !== signature) {
			const icon = document.createElement("span");
			icon.className = "dsh-an-headerIcon";
			icon.innerHTML = HEADER_ICON;
			button.replaceChildren(icon);
			if (open > 0) {
				const count = document.createElement("span");
				count.className = "dsh-an-headerCount";
				count.textContent = open > 99 ? "99+" : String(open);
				button.appendChild(count);
			}
			button.dataset.signature = signature;
		}
		button.dataset.sessionId = sessionId;
		button.title = open > 0 ? tr("header.tooltip", { n: open }) : tr("header.tooltipEmpty");
		button.setAttribute("aria-label", open > 0 ? `${tr("dock.open")}, ${tr("dock.count", { n: open })}` : tr("dock.open"));
	};
	/** Watch the store, the DOM and the viewport; returns the cleanup. */
	const attach = (onDispose) => {
		let scheduled = false;
		const schedule = () => {
			if (scheduled) return;
			scheduled = true;
			requestAnimationFrame(() => {
				scheduled = false;
				refresh();
			});
		};
		const onStorage = (event) => {
			if (event.key === "dsh.aside-notes.v2") schedule();
		};
		TODO_LISTENERS.add(schedule);
		window.addEventListener("storage", onStorage);
		const observer = new MutationObserver(schedule);
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
		refresh();
		return () => {
			TODO_LISTENERS.delete(schedule);
			window.removeEventListener("storage", onStorage);
			observer.disconnect();
			onDispose();
			for (const button of document.querySelectorAll(".dsh-an-headerBtn")) button.remove();
		};
	};
	return {
		refresh,
		attach
	};
}

// src/client/ui/useSessionMemoStore.ts
/** Per-session notes plus a synchronous writer that never invents state. */
/** Per-session memos plus a synchronous writer that never invents state. */
function useSessionMemoStore(sessionId) {
	const sessionKey = sessionId ? String(sessionId) : "";
	const sessionRef = react.default.useRef(sessionKey);
	sessionRef.current = sessionKey;
	const [record, setRecord] = react.default.useState(() => readSessionRecord(sessionKey));
	const [syncError, setSyncError] = react.default.useState(false);
	const recordRef = react.default.useRef(record);
	recordRef.current = record;
	react.default.useEffect(() => {
		setRecord(readSessionRecord(sessionRef.current));
		setSyncError(false);
	}, [sessionKey]);
	react.default.useEffect(() => {
		const onStorage = (event) => {
			if (event.key !== "dsh.aside-notes.v2") return;
			setRecord(readSessionRecord(sessionRef.current));
		};
		const onLocal = () => setRecord(readSessionRecord(sessionRef.current));
		TODO_LISTENERS.add(onLocal);
		window.addEventListener("storage", onStorage);
		return () => {
			TODO_LISTENERS.delete(onLocal);
			window.removeEventListener("storage", onStorage);
		};
	}, []);
	return {
		record,
		syncError,
		commit: react.default.useCallback((updater) => {
			const current = recordRef.current || {
				items: [],
				updatedAt: 0
			};
			const next = {
				items: normalizeItems(updater(current.items || [])),
				updatedAt: Date.now()
			};
			const ok = writeSessionRecord(sessionRef.current, next);
			setSyncError(!ok);
			if (!ok) return false;
			recordRef.current = next;
			setRecord(next);
			return true;
		}, [])
	};
}

// src/client/storage/prefs.ts
/** Panel geometry, send shortcut, forward prefix and section state. */
/** Read the persisted right-panel width, clamped for the current viewport. */
function readPanelWidth() {
	const ls = storage();
	const max = Math.min(720, Math.max(280, window.innerWidth - 32));
	try {
		const saved = ls && Number(ls.getItem("dsh.aside-notes.panel-width.v2"));
		if (Number.isFinite(saved) && saved > 0) return Math.max(280, Math.min(max, saved));
	} catch {}
	return Math.max(280, Math.min(max, 360));
}
/** Persist the right-panel width so it survives reopening the popover. */
function writePanelWidth(width) {
	const ls = storage();
	if (!ls) return;
	try {
		ls.setItem(PANEL_WIDTH_KEY, String(Math.round(width)));
	} catch {}
}
/** Read the persisted right-panel height; 0 means content-sized. */
function readPanelHeight() {
	const ls = storage();
	try {
		const saved = ls && Number(ls.getItem("dsh.aside-notes.panel-height.v2"));
		if (Number.isFinite(saved) && saved > 0) return saved;
	} catch {}
	return 0;
}
/** Persist the right-panel height; 0 restores content sizing. */
function writePanelHeight(height) {
	const ls = storage();
	if (!ls) return;
	try {
		if (height > 0) ls.setItem(PANEL_HEIGHT_KEY, String(Math.round(height)));
		else ls.removeItem(PANEL_HEIGHT_KEY);
	} catch {}
}
/** Read the Enter-to-send preference. */
function readSendShortcut() {
	try {
		const saved = storage() && storage().getItem("dsh.aside-notes.send-shortcut.v2");
		return saved === "enter" || saved === "ctrl-enter" ? saved : SEND_SHORTCUT_DEFAULT;
	} catch {
		return SEND_SHORTCUT_DEFAULT;
	}
}
function writeSendShortcut(value) {
	try {
		const ls = storage();
		if (ls) ls.setItem(SEND_SHORTCUT_KEY, value === "enter" ? "enter" : "ctrl-enter");
	} catch {}
}
/** Read the user's forward lead-in; an empty string means no prefix. */
function readForwardPrefix() {
	try {
		const raw = storage() && storage().getItem("dsh.aside-notes.forward-prefix.v2");
		return typeof raw === "string" ? raw.slice(0, 80) : "";
	} catch {
		return "";
	}
}
function writeForwardPrefix(value) {
	try {
		const ls = storage();
		if (ls) ls.setItem(FORWARD_PREFIX_STORAGE_KEY, String(value || "").slice(0, 80));
	} catch {}
}
/** Remembered section state; corrupt or missing storage falls back to defaults. */
function readSectionState() {
	const fallback = {
		open: SECTION_STATE_DEFAULT.open,
		done: SECTION_STATE_DEFAULT.done
	};
	const ls = storage();
	if (!ls) return fallback;
	try {
		const raw = ls.getItem(SECTION_STATE_KEY);
		if (!raw) return fallback;
		const saved = JSON.parse(raw);
		if (!saved || typeof saved !== "object") return fallback;
		return {
			open: typeof saved.open === "boolean" ? saved.open : fallback.open,
			done: typeof saved.done === "boolean" ? saved.done : fallback.done
		};
	} catch {
		return fallback;
	}
}
/** Persist the section state immediately; storage failures are ignored. */
function writeSectionState(state) {
	const ls = storage();
	if (!ls) return;
	try {
		ls.setItem(SECTION_STATE_KEY, JSON.stringify({
			open: state.open === true,
			done: state.done === true
		}));
	} catch {}
}

// src/client/ui/position.ts
/**
* Mark the section head that is actually pinned to the scroller's top edge.
* Sticky heads stay transparent in flow; only the pinned one takes the menu
* group-header fill, so no full-width layer sits over the list at rest.
*/
function syncStickyHeads(node) {
	const areaTop = node.getBoundingClientRect().top;
	for (const head of node.querySelectorAll(".dsh-an-sectionHead, .dsh-an-doneHead")) {
		const section = head.parentElement;
		if (!section) continue;
		const rect = section.getBoundingClientRect();
		head.toggleAttribute("data-stuck", rect.top < areaTop && rect.bottom > areaTop);
	}
}
/**
* Frame-owned top safety margin for floating surfaces. Read from the layout
* rather than baked in, so macOS window chrome and the Windows titlebar both
* keep their clearance without this page touching the global variable.
*/
function overlayTopFloor(margin) {
	try {
		const raw = getComputedStyle(document.body).getPropertyValue("--dsh-frame-overlay-top").trim();
		const value = Number.parseFloat(raw);
		if (Number.isFinite(value) && value > 0) return Math.max(margin, value);
	} catch {}
	return margin;
}
/**
* Fixed panel placement: a right-side panel for the experimental entry,
* otherwise below the anchor. Both stay inside the viewport margin, and the
* gap side is only abandoned when the opposite side genuinely fits.
*/
function memoPopoverStyle(anchor, placement, requestedWidth, requestedHeight) {
	const margin = window.innerWidth <= 480 ? 12 : 16;
	const topFloor = overlayTopFloor(margin);
	const available = Math.max(280, window.innerWidth - margin * 2);
	const width = Math.max(280, Math.min(720, available, requestedWidth || 360));
	if (placement === "right") {
		const rect = anchor && anchor.isConnected ? anchor.getBoundingClientRect() : null;
		let desiredRight = rect && rect.width > 0 ? rect.right : window.innerWidth - margin;
		const sidebar = [...document.querySelectorAll("[data-sidebar-right-panel][data-sidebar-right-open]")].find((node) => {
			const box = node.getBoundingClientRect();
			return box.width > 24 && box.left > 0 && box.left < window.innerWidth - 24;
		});
		if (sidebar) desiredRight = Math.min(desiredRight, sidebar.getBoundingClientRect().left - 8);
		const rightInset = Math.max(margin, Math.min(window.innerWidth - margin, window.innerWidth - desiredRight));
		const top = rect && rect.width > 0 ? Math.max(topFloor, Math.round(rect.bottom + 8)) : topFloor;
		const maxHeight = Math.max(160, window.innerHeight - top - margin);
		const height = requestedHeight ? Math.max(Math.min(240, maxHeight), Math.min(maxHeight, requestedHeight)) : 0;
		const style = {
			right: `${rightInset}px`,
			left: "auto",
			top: `${top}px`,
			width: `${width}px`,
			maxHeight: `${maxHeight}px`
		};
		if (height) style.height = `${height}px`;
		return style;
	}
	const maxHeight = Math.max(160, Math.min(460, window.innerHeight - topFloor - margin));
	if (!anchor) return {
		left: `${margin}px`,
		top: `${topFloor}px`,
		width: `${width}px`,
		maxHeight: `${maxHeight}px`
	};
	const rect = anchor.getBoundingClientRect();
	const left = rect.left < 420 ? Math.max(margin, rect.left) : Math.max(margin, Math.min(rect.right - width, window.innerWidth - width - margin));
	let top = rect.bottom + 8;
	if (top + maxHeight > window.innerHeight - margin) top = Math.max(topFloor, rect.top - maxHeight - 8);
	return {
		left: `${left}px`,
		top: `${top}px`,
		width: `${width}px`,
		maxHeight: `${maxHeight}px`
	};
}

// src/client/ui/usePanelGeometry.ts
/** Panel geometry: remembered width/height, pointer and keyboard resize, placement. */
function usePanelGeometry(anchorRef, placement, panelRef) {
	const [panelWidth, setPanelWidth] = react.default.useState(readPanelWidth);
	const [panelHeight, setPanelHeight] = react.default.useState(readPanelHeight);
	const [style, setStyle] = react.default.useState(() => memoPopoverStyle(anchorRef.current, placement, panelWidth, panelHeight));
	const panelWidthRef = react.default.useRef(panelWidth);
	const panelHeightRef = react.default.useRef(panelHeight);
	const lastStyleRef = react.default.useRef("");
	const updatePosition = react.default.useCallback(() => {
		if (anchorRef.current || placement === "right") {
			const next = memoPopoverStyle(anchorRef.current, placement, panelWidth, panelHeight);
			const key = JSON.stringify(next);
			if (key === lastStyleRef.current) return;
			lastStyleRef.current = key;
			setStyle(next);
		}
	}, [
		anchorRef,
		placement,
		panelWidth,
		panelHeight
	]);
	react.default.useEffect(() => {
		panelWidthRef.current = panelWidth;
	}, [panelWidth]);
	react.default.useEffect(() => {
		panelHeightRef.current = panelHeight;
	}, [panelHeight]);
	const clampPanelWidth = (value) => {
		const max = Math.min(720, Math.max(280, window.innerWidth - 32));
		return Math.max(280, Math.min(max, value));
	};
	const commitPanelWidth = (value) => {
		const next = clampPanelWidth(value);
		panelWidthRef.current = next;
		setPanelWidth(next);
		writePanelWidth(next);
	};
	const startPanelResize = (event) => {
		if (event.button !== 0) return;
		event.preventDefault();
		const startX = event.clientX;
		const startWidth = panelWidthRef.current;
		const onMove = (moveEvent) => {
			const next = clampPanelWidth(startWidth + (startX - moveEvent.clientX));
			panelWidthRef.current = next;
			setPanelWidth(next);
		};
		const onUp = () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
			document.body.style.userSelect = "";
			document.body.style.cursor = "";
			writePanelWidth(panelWidthRef.current);
		};
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp, { once: true });
		document.body.style.userSelect = "none";
		document.body.style.cursor = "ew-resize";
	};
	const onPanelResizeKeyDown = (event) => {
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			commitPanelWidth(panelWidthRef.current + 16);
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			commitPanelWidth(panelWidthRef.current - 16);
		} else if (event.key === "Home") {
			event.preventDefault();
			commitPanelWidth(360);
		}
	};
	const clampPanelHeight = (value) => {
		const max = Math.max(240, window.innerHeight - 64 - 16);
		return Math.max(240, Math.min(max, value));
	};
	const commitPanelHeight = (value) => {
		const next = value > 0 ? clampPanelHeight(value) : 0;
		panelHeightRef.current = next;
		setPanelHeight(next);
		writePanelHeight(next);
	};
	const startPanelHeightResize = (event) => {
		if (event.button !== 0) return;
		event.preventDefault();
		const startY = event.clientY;
		const startHeight = panelHeightRef.current || (panelRef.current ? panelRef.current.getBoundingClientRect().height : 360);
		const onMove = (moveEvent) => {
			const next = clampPanelHeight(startHeight + (moveEvent.clientY - startY));
			panelHeightRef.current = next;
			setPanelHeight(next);
		};
		const onUp = () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
			document.body.style.userSelect = "";
			document.body.style.cursor = "";
			writePanelHeight(panelHeightRef.current);
		};
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp, { once: true });
		document.body.style.userSelect = "none";
		document.body.style.cursor = "ns-resize";
	};
	const onPanelHeightKeyDown = (event) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			commitPanelHeight((panelHeightRef.current || 360) + 16);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			commitPanelHeight((panelHeightRef.current || 360) - 16);
		} else if (event.key === "Home") {
			event.preventDefault();
			commitPanelHeight(0);
		}
	};
	react.default.useLayoutEffect(() => {
		updatePosition();
		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);
		return () => {
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition, true);
		};
	}, [updatePosition]);
	react.default.useEffect(() => {
		const anchor = anchorRef.current;
		if (!anchor || typeof ResizeObserver !== "function") return void 0;
		const target = anchor.closest("[class*=\"_header\"]") || anchor;
		const observer = new ResizeObserver(updatePosition);
		observer.observe(target);
		return () => observer.disconnect();
	}, [anchorRef, updatePosition]);
	react.default.useEffect(() => {
		const timer = window.setInterval(updatePosition, 400);
		return () => window.clearInterval(timer);
	}, [updatePosition]);
	return {
		style,
		commitPanelWidth,
		commitPanelHeight,
		startPanelResize,
		startPanelHeightResize,
		onPanelResizeKeyDown,
		onPanelHeightKeyDown
	};
}

// src/client/ui/useSections.ts
/** Open/completed section visibility, remembered across panel opens. */
function useSections() {
	const [initial] = react.default.useState(readSectionState);
	const [showOpen, setShowOpen] = react.default.useState(initial.open);
	const [showDone, setShowDone] = react.default.useState(initial.done);
	const sectionsRef = react.default.useRef(initial);
	/** Apply one section state and remember it right away, using the next value. */
	const applySections = (next) => {
		sectionsRef.current = next;
		setShowOpen(next.open);
		setShowDone(next.done);
		writeSectionState(next);
	};
	return {
		sectionsRef,
		showOpen,
		showDone,
		applySections,
		toggleOpen: () => applySections({
			open: !sectionsRef.current.open,
			done: sectionsRef.current.done
		}),
		toggleDone: () => applySections({
			open: sectionsRef.current.open,
			done: !sectionsRef.current.done
		})
	};
}

// src/client/storage/forwarded.ts
/** Per-session forwarded marks behind the forward button. */
/** Empty forwarded-flag store; shape is { version, sessions: { [sessionId]: { [itemId]: true } } }. */
function emptyForwardedStore() {
	return {
		version: 1,
		sessions: {}
	};
}
/** Read the forwarded-flag store; corrupt or unavailable reads as empty. */
function readForwardedStore() {
	const ls = storage();
	if (!ls) return emptyForwardedStore();
	try {
		const raw = ls.getItem(FORWARDED_STORAGE_KEY);
		if (!raw) return emptyForwardedStore();
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return emptyForwardedStore();
		const sessions = parsed.sessions;
		if (!sessions || typeof sessions !== "object" || Array.isArray(sessions)) return emptyForwardedStore();
		return {
			version: 1,
			sessions
		};
	} catch {
		return emptyForwardedStore();
	}
}
function writeForwardedStore(store) {
	const ls = storage();
	if (!ls) return false;
	try {
		ls.setItem(FORWARDED_STORAGE_KEY, JSON.stringify(store));
		return true;
	} catch {
		return false;
	}
}
/** Keep only `true` flags on non-empty ids; anything else in the stored record is dropped. */
function normalizeForwardedRecord(record) {
	if (!record || typeof record !== "object" || Array.isArray(record)) return {};
	const next = {};
	for (const [itemId, flag] of Object.entries(record)) if (itemId && flag === true) next[itemId] = true;
	return next;
}
/** Forwarded item ids of one session, as an id -> true map. */
function readForwardedIds(sessionId) {
	const key = sessionId ? String(sessionId) : "";
	if (!key) return {};
	return normalizeForwardedRecord(readForwardedStore().sessions[key]);
}
/** Remember that one note was forwarded; best effort, never blocks the send. */
function markForwarded(sessionId, itemId) {
	const key = sessionId ? String(sessionId) : "";
	const id = itemId ? String(itemId) : "";
	if (!key || !id) return false;
	const store = readForwardedStore();
	store.sessions[key] = {
		...normalizeForwardedRecord(store.sessions[key]),
		[id]: true
	};
	return writeForwardedStore(store);
}
/** Drop forwarded flags that can no longer be rendered (deleted or cleared notes). */
function forgetForwarded(sessionId, itemIds) {
	const key = sessionId ? String(sessionId) : "";
	if (!key) return false;
	const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
	const store = readForwardedStore();
	const record = normalizeForwardedRecord(store.sessions[key]);
	let changed = false;
	for (const rawId of ids) {
		const id = rawId ? String(rawId) : "";
		if (!id || !record[id]) continue;
		delete record[id];
		changed = true;
	}
	if (!changed) return false;
	if (Object.keys(record).length) store.sessions[key] = record;
	else delete store.sessions[key];
	return writeForwardedStore(store);
}

// src/client/ui/useForwardMarks.ts
/** Which notes were forwarded in this session, plus the toggle-off bookkeeping. */
function useForwardMarks(sessionId) {
	const [forwardedIds, setForwardedIds] = react.default.useState(() => readForwardedIds(sessionId));
	const sessionRef = react.default.useRef(sessionId ? String(sessionId) : "");
	react.default.useEffect(() => {
		const key = sessionId ? String(sessionId) : "";
		if (sessionRef.current === key) return;
		sessionRef.current = key;
		setForwardedIds(readForwardedIds(key));
	}, [sessionId]);
	/** Drop forwarded flags for notes that no longer render (deleted or cleared). */
	const forgetForwardedItems = (itemIds) => {
		const ids = (Array.isArray(itemIds) ? itemIds : [itemIds]).filter(Boolean);
		if (!ids.length) return;
		forgetForwarded(sessionId, ids);
		setForwardedIds((current) => {
			if (!ids.some((id) => current[id])) return current;
			const next = { ...current };
			for (const id of ids) delete next[id];
			return next;
		});
	};
	/** Remember a successful forward so the forward button keeps its check after closing the panel. */
	const rememberForwarded = (item) => {
		const id = item && item.id ? String(item.id) : "";
		if (!id) return;
		markForwarded(sessionId, id);
		setForwardedIds((current) => current[id] ? current : {
			...current,
			[id]: true
		});
	};
	/** Toggle the forward mark off; the note and its open/done state stay untouched. */
	const unrememberForwarded = (item) => {
		const id = item && item.id ? String(item.id) : "";
		if (!id) return;
		forgetForwardedItems(id);
	};
	return {
		forwardedIds,
		rememberForwarded,
		unrememberForwarded,
		forgetForwardedItems
	};
}

// src/client/ui/usePanelSettings.ts
/** Inline settings: send shortcut and the forward lead-in, both persisted. */
function usePanelSettings() {
	const [showSettings, setShowSettings] = react.default.useState(false);
	const [sendShortcut, setSendShortcut] = react.default.useState(readSendShortcut);
	const [forwardPrefix, setForwardPrefix] = react.default.useState(readForwardPrefix);
	const prefixRef = react.default.useRef(null);
	react.default.useLayoutEffect(() => {
		const node = prefixRef.current;
		if (!node) return;
		node.style.height = "auto";
		node.style.height = `${Math.min(138, node.scrollHeight + 2)}px`;
	}, [forwardPrefix, showSettings]);
	const chooseShortcut = (value) => {
		setSendShortcut(value);
		writeSendShortcut(value);
	};
	const changeForwardPrefix = (value) => {
		const next = String(value || "").slice(0, 80);
		setForwardPrefix(next);
		writeForwardPrefix(next);
	};
	return {
		showSettings,
		setShowSettings,
		sendShortcut,
		chooseShortcut,
		forwardPrefix,
		changeForwardPrefix,
		prefixRef
	};
}

// src/client/update/releaseHistory.ts
/** Enough history to explain a long gap without turning the card into a feed. */
const MAX_RELEASE_HISTORY = 6;
function core(version) {
	return String(version ?? "").replace(/^v/i, "").split("-", 1)[0].split(".").map((part) => Number.parseInt(part, 10) || 0);
}
/** Numeric comparison of two versions; prerelease suffixes compare as the core. */
function compareVersions(a, b) {
	const left = core(a);
	const right = core(b);
	for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
		const difference = (left[index] || 0) - (right[index] || 0);
		if (difference !== 0) return difference > 0 ? 1 : -1;
	}
	return 0;
}
/** A plain `x.y.z` tag, with the `v` prefix and whitespace removed. */
function normalizeVersion(version) {
	const normalized = String(version ?? "").trim().replace(/^v/i, "");
	return /^\d+(\.\d+)*$/.test(normalized) ? normalized : "";
}
/**
* Filter the feed down to the releases the user is about to receive:
* newer than `current`, not newer than `latest`, newest first, capped.
*/
function selectReleaseHistory(list, query) {
	const max = query.max && query.max > 0 ? query.max : 6;
	const seen = /* @__PURE__ */ new Set();
	const entries = [];
	for (const item of Array.isArray(list) ? list : []) {
		const release = item;
		if (!release || typeof release !== "object") continue;
		if (release.prerelease === true || release.draft === true) continue;
		const version = normalizeVersion(typeof release.version === "string" ? release.version : release.tag_name);
		if (!version || seen.has(version)) continue;
		if (compareVersions(version, query.current) <= 0) continue;
		if (query.latest && compareVersions(version, query.latest) > 0) continue;
		seen.add(version);
		const url = release.url ?? release.html_url;
		const publishedAt = release.publishedAt ?? release.published_at;
		entries.push({
			version,
			body: typeof release.body === "string" ? release.body : "",
			url: typeof url === "string" ? url : "",
			publishedAt: typeof publishedAt === "string" ? publishedAt : ""
		});
	}
	entries.sort((a, b) => compareVersions(b.version, a.version));
	return {
		entries: entries.slice(0, max),
		truncated: entries.length > max
	};
}

// src/client/update/latest.ts
/**
* Published-version probes: the version number and the release notes behind it.
*
* The panel is usually installed from a checkout, not from a store, so it asks
* the npm registry first and falls back to the GitHub Release tag. Everything
* here is dependency-injected and free of widget state so the contract test can
* exercise the source order, the one-hour cache and the comparison in Node.
*/
/** npm metadata endpoints in fallback order; the mirror covers slow npmjs routes. */
const UPDATE_REGISTRY_HOSTS = ["https://registry.npmjs.org", "https://registry.npmmirror.com"];
/** GitHub's REST host for this repo, derived from the displayed repo URL. */
const UPDATE_GITHUB_API = `${PLUGIN_REPO_URL.replace("https://github.com/", "https://api.github.com/repos/")}/releases`;
/** Second source: a GitHub Release, for checkouts that are not published to npm. */
const UPDATE_GITHUB_RELEASE_URL = `${UPDATE_GITHUB_API}/latest`;
/** The releases feed; one page is enough for the gap the card is willing to show. */
const UPDATE_GITHUB_RELEASES_URL = `${UPDATE_GITHUB_API}?per_page=50`;
/** A resolved version is reused for an hour, including a miss, to keep opens quiet. */
const UPDATE_TTL_MS = 36e5;
/** A manual check should not hang the panel on a black-holed network. */
const UPDATE_TIMEOUT_MS = 8e3;
/**
* Numeric segment comparison, tolerant of a `v` prefix and short forms. A
* pre-release tag on the same core is not newer ("2.0.0-rc.1" vs "2.0.0").
*/
function isNewerVersion(latest, current) {
	const parse = (version) => version.replace(/^v/, "").split("-", 1)[0].split(".").map((part) => parseInt(part, 10) || 0);
	const next = parse(latest);
	const have = parse(current);
	for (let index = 0; index < Math.max(next.length, have.length); index += 1) {
		const a = next[index] || 0;
		const b = have[index] || 0;
		if (a !== b) return a > b;
	}
	return false;
}
/** A fetch that gives up after {@link UPDATE_TIMEOUT_MS} instead of hanging. */
function fetchWithTimeout(fetchImpl, url) {
	if (typeof AbortController !== "function") return Promise.resolve().then(() => fetchImpl(url));
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), UPDATE_TIMEOUT_MS);
	return Promise.resolve().then(() => fetchImpl(url, { signal: controller.signal })).finally(() => clearTimeout(timer));
}
function createUpdateProbe(options = {}) {
	const fetchImpl = options.fetchImpl || ((url, init) => fetch(url, init));
	const now = options.now || (() => Date.now());
	const ttlMs = options.ttlMs || 36e5;
	let cached = null;
	function readJson(url) {
		return fetchWithTimeout(fetchImpl, url).then((response) => response.ok ? response.json() : null).catch(() => null);
	}
	function readNpmVersion(host) {
		return readJson(`${host}/dsh-asidenote/latest`).then((body) => body !== null && typeof body.version === "string" ? body.version : null);
	}
	function readGitHubVersion() {
		return readJson(UPDATE_GITHUB_RELEASE_URL).then((body) => {
			const tag = body !== null && typeof body.tag_name === "string" ? body.tag_name : "";
			return tag === "" ? null : tag.replace(/^v/, "");
		});
	}
	function latest() {
		if (cached === null || now() - cached.at >= ttlMs) cached = {
			at: now(),
			promise: (async () => {
				for (const host of UPDATE_REGISTRY_HOSTS) {
					const version = await readNpmVersion(host);
					if (version !== null) return version;
				}
				return readGitHubVersion();
			})()
		};
		return cached.promise;
	}
	/** Drop the cached answer so the next call reads the network again. */
	function reset() {
		cached = null;
	}
	return {
		latest,
		reset
	};
}
/** Process-wide probe: one fetch per hour no matter how often the panel opens. */
const updateProbe = createUpdateProbe();
function fetchLatestVersion() {
	return updateProbe.latest();
}
function readJsonWithTimeout(fetchImpl, url) {
	return fetchWithTimeout(fetchImpl, url).then((response) => response.ok ? response.json() : null).catch(() => null);
}
/**
* Fetch the releases between the running build and the published version.
* GitHub is the only source: the notes live on the Release, not in the npm
* manifest. A missing feed falls back to the single newest tag, and a missing
* release (a tag pushed without a Release) leaves the card with links only.
*/
function createReleaseHistoryProbe(options = {}) {
	const fetchImpl = options.fetchImpl || ((url, init) => fetch(url, init));
	const now = options.now || (() => Date.now());
	const ttlMs = options.ttlMs || 36e5;
	const cached = /* @__PURE__ */ new Map();
	function latest(current, target) {
		const key = `${current}..${target}`;
		const hit = cached.get(key);
		if (hit && now() - hit.at < ttlMs) return hit.promise;
		const entry = {
			at: now(),
			promise: (async () => {
				const list = await readJsonWithTimeout(fetchImpl, UPDATE_GITHUB_RELEASES_URL);
				if (Array.isArray(list)) return selectReleaseHistory(list.map((item) => ({
					version: typeof item?.tag_name === "string" ? item.tag_name : item?.version,
					body: item?.body,
					url: item?.html_url,
					prerelease: item?.prerelease,
					draft: item?.draft,
					publishedAt: item?.published_at
				})), {
					current,
					latest: target,
					max: 6
				});
				const single = await readJsonWithTimeout(fetchImpl, `${UPDATE_GITHUB_API}/tags/v${encodeURIComponent(target)}`);
				if (single === null) return {
					entries: [],
					truncated: false
				};
				const tag = typeof single.tag_name === "string" ? single.tag_name.replace(/^v/, "") : target;
				return {
					entries: [{
						version: tag,
						body: typeof single.body === "string" ? single.body : "",
						url: typeof single.html_url === "string" && single.html_url ? single.html_url : `${PLUGIN_REPO_URL}/releases/tag/v${encodeURIComponent(tag)}`,
						publishedAt: typeof single.published_at === "string" ? single.published_at : ""
					}],
					truncated: false
				};
			})()
		};
		cached.set(key, entry);
		return entry.promise;
	}
	function reset() {
		cached.clear();
	}
	return {
		latest,
		reset
	};
}
/** Process-wide history probe, cached per version gap for an hour. */
const releaseHistoryProbe = createReleaseHistoryProbe();
function fetchReleaseHistory(current, target) {
	return releaseHistoryProbe.latest(current, target);
}
/** Manual check: forget both cached answers so the next calls hit the network. */
function resetUpdateChecks() {
	updateProbe.reset();
	releaseHistoryProbe.reset();
}

// src/client/update/releaseNotes.ts
/** Bounds taken from the published-notes convention, not an editorial limit. */
const MAX_NOTE_GROUPS = 6;
const MAX_NOTE_ITEMS = 40;
const MAX_NOTE_ITEM_CHARS = 600;
const MARKER_RE = /<!--\s*app-update-notes:([A-Za-z-]+):start\s*-->([\s\S]*?)<!--\s*app-update-notes:\1:end\s*-->/g;
const GROUP_RE = /^#{2,4}\s+(.+?)\s*$/;
const ITEM_RE = /^\s*[-*]\s+(.+?)\s*$/;
const LEAD_RE = /^([^。．.!?！？:：]{1,40}?[:：])\s*(\S[\s\S]*)$/;
const TRAILING_PR_REFS_RE = /\s*(?:[（(]\s*#\d+(?:\s*[,，、]\s*#\d+)*\s*[)）])\s*$/;
const HTML_TAG_RE = /<\/?[A-Za-z][^>]*>/g;
const IMAGE_RE = /!\[[^\]]*\]\([^)]*\)/g;
const LINK_RE = /\[([^\]]+)\]\([^)]*\)/g;
const CODE_RE = /`([^`]+)`/g;
const STRONG_RE = /\*\*([^*]+)\*\*|__([^_]+)__/g;
const EMPHASIS_RE = /\*([^*]+)\*|_([^_]+)_/g;
const WHITESPACE_RE = /\s+/g;
const ENTITIES = {
	amp: "&",
	apos: "'",
	gt: ">",
	lt: "<",
	nbsp: " ",
	quot: "\""
};
function decodeEntities(value) {
	return value.replace(/&(#x[0-9a-f]+|#\d+|amp|apos|gt|lt|nbsp|quot);/gi, (match, entity) => {
		const lower = entity.toLowerCase();
		if (Object.prototype.hasOwnProperty.call(ENTITIES, lower)) return ENTITIES[lower];
		const codePoint = lower.startsWith("#x") ? Number.parseInt(lower.slice(2), 16) : Number.parseInt(lower.slice(1), 10);
		if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 1114111) return match;
		try {
			return String.fromCodePoint(codePoint);
		} catch {
			return match;
		}
	});
}
/** Flatten one line of release-note markdown to readable plain text. */
function noteText(value) {
	return decodeEntities(String(value ?? "").replace(HTML_TAG_RE, "").replace(IMAGE_RE, "").replace(LINK_RE, "$1").replace(CODE_RE, "$1").replace(STRONG_RE, (_match, strong, underscored) => strong || underscored).replace(EMPHASIS_RE, (_match, italic, underscored) => italic || underscored).replace(TRAILING_PR_REFS_RE, "")).replace(WHITESPACE_RE, " ").trim();
}
/** Split "**Topic:** rest" into its bold lead and the remaining body. */
function splitNoteLead(value) {
	const text = noteText(value);
	const match = LEAD_RE.exec(text);
	return match ? {
		lead: match[1].trim(),
		body: match[2].trim()
	} : {
		lead: "",
		body: text
	};
}
function truncate(value, maxChars) {
	const characters = Array.from(value);
	return characters.length <= maxChars ? value : `${characters.slice(0, maxChars - 1).join("").trimEnd()}…`;
}
/**
* Locale fallback order for a DSH locale id. A Chinese UI reads the `zh` block,
* everything else reads `en`; either falls back to the other when a release
* only shipped one language.
*/
function noteLocalesFor(locale) {
	return String(locale ?? "").toLowerCase().startsWith("zh") ? ["zh", "en"] : ["en", "zh"];
}
/** The notes block for this locale, or an empty string when the release has none. */
function extractUpdateNotes(body, locale) {
	const blocks = /* @__PURE__ */ new Map();
	for (const match of String(body ?? "").matchAll(MARKER_RE)) {
		const key = match[1].toLowerCase();
		if (!blocks.has(key)) blocks.set(key, match[2]);
	}
	for (const key of noteLocalesFor(locale)) {
		const block = blocks.get(key);
		if (block && block.trim()) return block.trim();
	}
	return "";
}
/** Parse one marker block into headings and bullets. */
function parseReleaseNotes(markdown) {
	const drafts = [];
	let current = null;
	for (const rawLine of String(markdown ?? "").split(/\r?\n/)) {
		const line = rawLine.trimEnd();
		const heading = GROUP_RE.exec(line);
		if (heading) {
			current = {
				title: noteText(heading[1]),
				bullets: []
			};
			drafts.push(current);
			continue;
		}
		const item = ITEM_RE.exec(line);
		if (item) {
			if (current === null) {
				current = {
					title: "",
					bullets: []
				};
				drafts.push(current);
			}
			current.bullets.push(item[1]);
			continue;
		}
		if (line.trim() && current !== null && current.bullets.length > 0) {
			const last = current.bullets.length - 1;
			current.bullets[last] = `${current.bullets[last]} ${line.trim()}`;
		}
	}
	const parsed = [];
	for (const draft of drafts) {
		const items = [];
		for (const bullet of draft.bullets) {
			const text = truncate(noteText(bullet), 600);
			if (text) items.push(splitNoteLead(text));
			if (items.length >= 40) break;
		}
		if (items.length > 0) parsed.push({
			title: draft.title,
			items
		});
		if (parsed.length >= 6) break;
	}
	return parsed;
}
/** Convenience for the panel: extract and parse in one step. */
function updateNotesForLocale(body, locale) {
	return parseReleaseNotes(extractUpdateNotes(body, locale));
}

// src/client/update/market.ts
/**
* Client for the plugin market's public update API (v1, beta).
*
* The market publishes a small same-origin JSON API so a plugin can offer its
* own update button without running a package manager itself. Everything here
* degrades to `null` when the market is absent, older than the API, or refuses
* the request: an update button is a convenience, not a dependency.
*
* Contract: `dshmarket/UPDATE-API-V1.md` — endpoints come from
* `/capabilities`, so a path change does not need a client release.
*/
/** Where the market mounts its public API. */
const MARKET_API_BASE = "/dsh-market/api/v1";
/** The package this panel updates. */
const MARKET_PACKAGE = "dsh-asidenote";
/** A check should answer quickly; a slow market falls back to the manual path. */
const MARKET_TIMEOUT_MS = 8e3;
function asText(value) {
	return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}
function asRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function operationView(raw) {
	const operation = asRecord(raw);
	if (!operation) return null;
	const progress = asRecord(operation.progress) || {};
	const outcome = asRecord(operation.outcome) || {};
	const failure = asRecord(operation.failure);
	const percent = typeof progress.percent === "number" && Number.isFinite(progress.percent) ? Math.max(0, Math.min(100, Math.round(progress.percent))) : null;
	const state = asText(operation.state);
	return {
		operationId: asText(operation.operationId) || "",
		state: [
			"queued",
			"running",
			"succeeded",
			"failed",
			"cancelled",
			"rolled-back"
		].includes(state) ? state : "failed",
		percent,
		detail: asText(progress.detail),
		beforeVersion: asText(operation.beforeVersion),
		installedVersion: asText(operation.installedVersion),
		refreshRequired: outcome.refreshRequired === true,
		restartRequired: outcome.restartRequired === true,
		failure: failure ? {
			code: asText(failure.code) || "UPDATE_FAILED",
			message: asText(failure.message) || "",
			retryable: failure.retryable === true
		} : null
	};
}
function errorFrom(body, fallback) {
	const failure = asRecord(asRecord(body)?.failure);
	return {
		code: asText(failure?.code) || "UPDATE_FAILED",
		message: asText(failure?.message) || asText(asRecord(body)?.error) || fallback,
		retryable: failure?.retryable === true
	};
}
/**
* Build a market client. `fetchImpl` is injected so the client can be tested
* without a browser or a live market.
*/
function createMarketClient(options = {}) {
	const fetchImpl = options.fetchImpl || ((url, init) => fetch(url, init));
	const timeoutMs = options.timeoutMs || 8e3;
	const base = (options.base || "/dsh-market/api/v1").replace(/\/$/, "");
	async function request(path, init = {}) {
		const controller = typeof AbortController === "function" ? new AbortController() : null;
		const timer = setTimeout(() => controller?.abort(), timeoutMs);
		try {
			const response = await fetchImpl(path.startsWith("http") ? path : `${base}${path}`, {
				...init,
				...controller ? { signal: controller.signal } : {}
			});
			const body = await response.json().catch(() => null);
			return {
				status: response.status,
				body
			};
		} catch {
			return null;
		} finally {
			clearTimeout(timer);
		}
	}
	return {
		/** Feature discovery; `null` means "no usable market on this host". */
		async capabilities() {
			const result = await request("/capabilities");
			const body = asRecord(result?.body);
			if (!result || result.status !== 200 || !body || body.schema !== "dsh-market/update-api/v1") return null;
			const endpoints = asRecord(body.endpoints) || {};
			return {
				marketVersion: asText(body.marketVersion) || "",
				stability: asText(body.stability) || "beta",
				restartSupported: body.restart?.supported === true,
				endpoints: {
					updates: asText(endpoints.updates) || `${"/dsh-market/api/v1"}/updates`,
					operations: asText(endpoints.operations) || `${"/dsh-market/api/v1"}/operations`,
					restart: asText(endpoints.restart) || `${"/dsh-market/api/v1"}/restart`
				}
			};
		},
		/** The market's view of the installed vs published version. */
		async check(name = MARKET_PACKAGE, force = true) {
			const result = await request(`/updates${`?name=${encodeURIComponent(name)}${force ? "&force=1" : ""}`}`);
			const pkg = asRecord(asRecord(result?.body)?.package);
			if (!result || result.status !== 200 || !pkg) return null;
			return {
				name: asText(pkg.name) || name,
				source: asText(pkg.source) || "unknown",
				installedVersion: asText(pkg.installedVersion) || "",
				latestVersion: asText(pkg.latestVersion) || "",
				updateAvailable: pkg.updateAvailable === true
			};
		},
		/** Queue an update; returns the operation to poll or a stable failure code. */
		async start(name = MARKET_PACKAGE, force = false) {
			const result = await request("/updates", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					packageName: name,
					...force ? { force: true } : {}
				})
			});
			if (!result) return { error: {
				code: "UPDATE_FAILED",
				message: "market did not answer",
				retryable: true
			} };
			const operation = asRecord(asRecord(result.body)?.operation);
			const operationId = asText(operation?.operationId);
			if ((result.status === 200 || result.status === 202) && operationId) {
				const state = asText(operation?.state);
				return {
					operationId,
					state: state === "queued" || state === "running" ? state : "queued"
				};
			}
			return { error: errorFrom(result.body, `update failed with HTTP ${result.status}`) };
		},
		/** Poll one operation. */
		async operation(operationId) {
			if (!operationId) return null;
			const result = await request(`/operations?operationId=${encodeURIComponent(operationId)}`);
			if (!result || result.status !== 200) return null;
			return operationView(asRecord(result.body)?.operation);
		},
		/** Ask the market to restart the host; only offered when capabilities allow it. */
		async restart() {
			const result = await request("/restart", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: "{}"
			});
			return result !== null && result.status >= 200 && result.status < 300;
		}
	};
}
/** Process-wide market client: one request shape, shared by every panel open. */
const marketClient = createMarketClient();

// src/client/ui/useUpdateCenter.ts
/**
* Update centre state for the settings card.
*
* Three things are allowed to be independent here: the published version check
* (auto on open, manual on demand), the release notes behind that version
* (loaded only when the disclosure is opened), and the in-app update itself
* (queued through the plugin market's public API and polled to a terminal
* state). Keeping them separate means a missing market or a missing release
* body cannot take the version check down with it.
*/
const CHECK_IDLE = {
	status: "idle",
	latestVersion: null,
	checkedAt: null
};
const NOTES_IDLE = {
	status: "idle",
	entries: [],
	truncated: false
};
const RUN_IDLE = {
	phase: "idle",
	percent: null,
	failureCode: null,
	message: null,
	retryable: false,
	refreshRequired: false,
	restartRequired: false,
	installedVersion: null
};
const POLL_INTERVAL_MS = 900;
/** A terminal state never arrives for an abandoned operation; stop asking. */
const MAX_POLLS = 400;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function terminalRun(phase, patch = {}) {
	return {
		...RUN_IDLE,
		phase,
		...patch
	};
}
function useUpdateCenter(localeId) {
	const [check, setCheck] = react.default.useState(CHECK_IDLE);
	const [notes, setNotes] = react.default.useState(NOTES_IDLE);
	const [expanded, setExpanded] = react.default.useState(false);
	const [expandedVersions, setExpandedVersions] = react.default.useState({});
	const [run, setRun] = react.default.useState(RUN_IDLE);
	const [market, setMarket] = react.default.useState("unknown");
	const [restartSupported, setRestartSupported] = react.default.useState(false);
	const disposed = react.default.useRef(false);
	const runRef = react.default.useRef(RUN_IDLE);
	runRef.current = run;
	react.default.useEffect(() => {
		disposed.current = false;
		return () => {
			disposed.current = true;
		};
	}, []);
	const latestVersion = check.status === "available" ? check.latestVersion : null;
	react.default.useEffect(() => {
		if ("2.1.0".includes("-")) return void 0;
		let active = true;
		fetchLatestVersion().then((version) => {
			if (!active || version === null) return;
			if (isNewerVersion(version, "2.1.0")) setCheck({
				status: "available",
				latestVersion: version,
				checkedAt: Date.now()
			});
			else setCheck({
				status: "current",
				latestVersion: version,
				checkedAt: Date.now()
			});
		});
		return () => {
			active = false;
		};
	}, []);
	react.default.useEffect(() => {
		if (check.status !== "available" || market !== "unknown") return void 0;
		let active = true;
		marketClient.capabilities().then((caps) => {
			if (!active) return;
			setMarket(caps ? "ready" : "unsupported");
			setRestartSupported(caps?.restartSupported === true);
		});
		return () => {
			active = false;
		};
	}, [check.status, market]);
	const checkNow = react.default.useCallback(async () => {
		if (check.status === "checking") return;
		resetUpdateChecks();
		setCheck((previous) => ({
			...previous,
			status: "checking"
		}));
		setNotes(NOTES_IDLE);
		setExpanded(false);
		setExpandedVersions({});
		setRun(RUN_IDLE);
		const version = await fetchLatestVersion();
		if (disposed.current) return;
		if (version === null) {
			setCheck({
				status: "error",
				latestVersion: null,
				checkedAt: Date.now()
			});
			return;
		}
		if (isNewerVersion(version, "2.1.0")) {
			setCheck({
				status: "available",
				latestVersion: version,
				checkedAt: Date.now()
			});
			setMarket("unknown");
		} else {
			setCheck({
				status: "current",
				latestVersion: version,
				checkedAt: Date.now()
			});
			setMarket("unknown");
		}
	}, [check.status]);
	const toggleNotes = react.default.useCallback(() => {
		setExpanded((value) => !value);
	}, []);
	const toggleVersion = react.default.useCallback((version) => {
		setExpandedVersions((previous) => ({
			...previous,
			[version]: previous[version] !== true
		}));
	}, []);
	react.default.useEffect(() => {
		if (!expanded || check.status !== "available" || check.latestVersion === null) return void 0;
		if (notes.status !== "idle") return void 0;
		let active = true;
		setNotes((previous) => ({
			...previous,
			status: "loading"
		}));
		fetchReleaseHistory(PLUGIN_VERSION, check.latestVersion).then((result) => {
			if (!active) return;
			const entries = result.entries.map((entry) => ({
				version: entry.version,
				url: entry.url,
				groups: updateNotesForLocale(entry.body, localeId)
			}));
			if (entries.length === 0) {
				setNotes({
					status: "error",
					entries: [],
					truncated: false
				});
				return;
			}
			setNotes({
				status: "ready",
				entries,
				truncated: result.truncated
			});
			const newest = entries[0].version;
			setExpandedVersions({ [newest]: true });
		});
		return () => {
			active = false;
		};
	}, [
		expanded,
		check.status,
		check.latestVersion,
		localeId
	]);
	const startUpdate = react.default.useCallback(async (force = false) => {
		if (runRef.current.phase === "starting" || runRef.current.phase === "running" || runRef.current.phase === "done") return;
		setRun(terminalRun("starting"));
		const caps = await marketClient.capabilities();
		if (disposed.current) return;
		if (!caps) {
			setMarket("unsupported");
			setRun(terminalRun("error", { failureCode: "NO_MARKET" }));
			return;
		}
		setMarket("ready");
		setRestartSupported(caps.restartSupported);
		const started = await marketClient.start(MARKET_PACKAGE, force);
		if (disposed.current) return;
		if ("error" in started) {
			setRun(terminalRun("error", {
				failureCode: started.error.code,
				message: started.error.message || null,
				retryable: started.error.retryable
			}));
			return;
		}
		setRun({
			...RUN_IDLE,
			phase: "running",
			percent: 0
		});
		for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
			await sleep(POLL_INTERVAL_MS);
			if (disposed.current) return;
			const operation = await marketClient.operation(started.operationId);
			if (disposed.current) return;
			if (operation === null) {
				setRun(terminalRun("error", {
					failureCode: "UPDATE_FAILED",
					retryable: true
				}));
				return;
			}
			if (operation.state === "queued" || operation.state === "running") {
				setRun({
					...RUN_IDLE,
					phase: "running",
					percent: operation.percent
				});
				continue;
			}
			if (operation.state === "succeeded") {
				setRun(terminalRun("done", {
					percent: 100,
					installedVersion: operation.installedVersion,
					refreshRequired: operation.refreshRequired || !operation.restartRequired,
					restartRequired: operation.restartRequired
				}));
				return;
			}
			setRun(terminalRun("error", {
				failureCode: operation.failure?.code || "UPDATE_FAILED",
				message: operation.failure?.message || null,
				retryable: operation.failure?.retryable !== false
			}));
			return;
		}
		setRun(terminalRun("error", {
			failureCode: "UPDATE_TIMEOUT",
			retryable: true
		}));
	}, []);
	const refreshPage = react.default.useCallback(() => {
		try {
			window.location.reload();
		} catch {}
	}, []);
	const restartHost = react.default.useCallback(async () => {
		await marketClient.restart();
		refreshPage();
	}, [refreshPage]);
	const fullReleaseUrl = notes.entries[0]?.url || (latestVersion ? `${"https://github.com/Rayle8/dsh-asidenote"}/releases/tag/v${latestVersion}` : null);
	return {
		check,
		latestVersion,
		notes,
		expanded,
		expandedVersions,
		releasesUrl: `${PLUGIN_REPO_URL}/releases`,
		run,
		market,
		restartSupported,
		fullReleaseUrl,
		checkNow,
		toggleNotes,
		toggleVersion,
		startUpdate,
		refreshPage,
		restartHost
	};
}

// src/client/storage/drafts.ts
/** Unsaved add/edit drafts, so closing the panel never loses text. */
/** Empty unsaved-draft store. */
function emptyDraftStore() {
	return {
		version: 1,
		sessions: {}
	};
}
/** Read the unsaved add/edit drafts; corrupt or unavailable reads as empty. */
function readDraftStore() {
	const ls = storage();
	if (!ls) return emptyDraftStore();
	try {
		const raw = ls.getItem(DRAFT_STORAGE_KEY);
		if (!raw) return emptyDraftStore();
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return emptyDraftStore();
		const sessions = parsed.sessions;
		if (!sessions || typeof sessions !== "object" || Array.isArray(sessions)) return emptyDraftStore();
		return {
			version: 1,
			sessions
		};
	} catch {
		return emptyDraftStore();
	}
}
function writeDraftStore(store) {
	const ls = storage();
	if (!ls) return;
	try {
		ls.setItem(DRAFT_STORAGE_KEY, JSON.stringify(store));
	} catch {}
}
function readSessionDrafts(sessionId) {
	const key = sessionId ? String(sessionId) : "";
	const record = key ? readDraftStore().sessions[key] : null;
	if (!record || typeof record !== "object" || Array.isArray(record)) return {
		add: "",
		edits: {}
	};
	return {
		add: typeof record.add === "string" ? record.add : "",
		edits: record.edits && typeof record.edits === "object" && !Array.isArray(record.edits) ? record.edits : {}
	};
}
function pruneDraftSession(store, sessionId) {
	const record = store.sessions[sessionId];
	if (!record) return;
	const hasAdd = typeof record.add === "string" && record.add.length > 0;
	const hasEdits = record.edits && typeof record.edits === "object" && Object.keys(record.edits).length > 0;
	if (!hasAdd && !hasEdits) delete store.sessions[sessionId];
}
function saveAddDraft(sessionId, text) {
	const key = sessionId ? String(sessionId) : "";
	if (!key) return;
	const store = readDraftStore();
	const record = store.sessions[key] || {};
	const value = String(text || "").slice(0, 280);
	if (value) record.add = value;
	else delete record.add;
	record.edits = record.edits && typeof record.edits === "object" ? record.edits : {};
	store.sessions[key] = record;
	pruneDraftSession(store, key);
	writeDraftStore(store);
}
function clearAddDraft(sessionId) {
	saveAddDraft(sessionId, "");
}
function readEditDraft(sessionId, itemId) {
	const key = sessionId ? String(sessionId) : "";
	if (!key || !itemId) return null;
	const edits = readSessionDrafts(key).edits;
	return typeof edits[itemId] === "string" ? edits[itemId] : null;
}
function saveEditDraft(sessionId, itemId, text) {
	const key = sessionId ? String(sessionId) : "";
	if (!key || !itemId) return;
	const store = readDraftStore();
	const record = store.sessions[key] || {};
	record.edits = record.edits && typeof record.edits === "object" ? record.edits : {};
	record.edits[itemId] = String(text || "").slice(0, 280);
	store.sessions[key] = record;
	writeDraftStore(store);
}
function clearEditDraft(sessionId, itemId) {
	const key = sessionId ? String(sessionId) : "";
	if (!key || !itemId) return;
	const store = readDraftStore();
	const record = store.sessions[key];
	if (!record || !record.edits || typeof record.edits !== "object") return;
	delete record.edits[itemId];
	pruneDraftSession(store, key);
	writeDraftStore(store);
}

// src/client/ui/useComposerDraft.ts
/** The add box: draft persistence, auto-grow, send chords and newline insertion. */
function useComposerDraft({ sessionId, commit, report, sendShortcut }) {
	const [draft, setDraft] = react.default.useState(() => readSessionDrafts(sessionId).add);
	const addRef = react.default.useRef(null);
	const composingRef = react.default.useRef(false);
	const resizeAdd = (node) => {
		if (!node) return;
		node.style.height = "auto";
		node.style.height = `${node.scrollHeight + 2}px`;
	};
	react.default.useEffect(() => {
		resizeAdd(addRef.current);
	}, [draft]);
	react.default.useLayoutEffect(() => {
		const node = addRef.current;
		if (!node) return;
		if (typeof window.matchMedia === "function" && !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
		node.focus();
		const end = node.value.length;
		try {
			node.setSelectionRange(end, end);
		} catch {}
	}, []);
	const add = () => {
		const text = draft.trim().slice(0, 280);
		if (!text) return;
		const now = Date.now();
		if (!commit((currentItems) => [{
			id: uid(),
			text,
			done: false,
			createdAt: now,
			updatedAt: now
		}, ...currentItems])) {
			report("saveFailed");
			return;
		}
		setDraft("");
		clearAddDraft(sessionId);
	};
	const insertDraftNewline = (node) => {
		if (!node) return;
		const start = node.selectionStart === null ? node.value.length : node.selectionStart;
		const end = node.selectionEnd === null ? start : node.selectionEnd;
		const next = `${node.value.slice(0, start)}\n${node.value.slice(end)}`;
		setDraft(next);
		saveAddDraft(sessionId, next);
		window.requestAnimationFrame(() => {
			node.selectionStart = start + 1;
			node.selectionEnd = start + 1;
			resizeAdd(node);
		});
	};
	const onDraftChange = (event) => {
		const value = event.target.value;
		setDraft(value);
		saveAddDraft(sessionId, value);
		resizeAdd(event.target);
	};
	const onDraftKeyDown = (event) => {
		const composing = event.isComposing || event.nativeEvent && event.nativeEvent.isComposing;
		if (event.key === "Escape") {
			event.currentTarget.blur();
			return;
		}
		if (event.key !== "Enter") return;
		if (composing) {
			event.preventDefault();
			return;
		}
		const chord = event.ctrlKey || event.metaKey;
		const platformModifier = isSendModifier(event);
		if (sendShortcut === "enter" ? !chord && !event.shiftKey : platformModifier) {
			event.preventDefault();
			add();
			return;
		}
		if (sendShortcut === "enter" && (chord || event.shiftKey)) {
			event.preventDefault();
			insertDraftNewline(event.currentTarget);
		}
	};
	return {
		draft,
		addRef,
		composingRef,
		add,
		onDraftChange,
		onDraftKeyDown
	};
}

// src/client/ui/useNoteActions.ts
/** Row actions: toggle, delete, and the inline edit session. */
function useNoteActions({ sessionId, commit, report, forgetForwardedItems }) {
	const [editingId, setEditingId] = react.default.useState(null);
	const [editDraft, setEditDraft] = react.default.useState("");
	const editRef = react.default.useRef(null);
	const cancelEditRef = react.default.useRef(false);
	react.default.useEffect(() => {
		if (!editingId || !editRef.current) return;
		editRef.current.focus();
		editRef.current.select();
	}, [editingId]);
	const resetEditing = (itemId) => {
		if (!editingId || editingId !== itemId) return;
		setEditingId(null);
		setEditDraft("");
	};
	const toggle = (item) => {
		if (!commit((currentItems) => currentItems.map((candidate) => {
			if (candidate.id !== item.id) return candidate;
			const now = Date.now();
			return {
				...candidate,
				done: !candidate.done,
				updatedAt: now,
				...candidate.done ? { completedAt: void 0 } : { completedAt: now }
			};
		}))) {
			report("saveFailed");
			return;
		}
		if (item.id === editingId) {
			setEditingId(null);
			setEditDraft("");
			clearEditDraft(sessionId, item.id);
		}
	};
	const remove = (item) => {
		if (!commit((currentItems) => currentItems.filter((candidate) => candidate.id !== item.id))) {
			report("saveFailed");
			return;
		}
		report("deleted");
		clearEditDraft(sessionId, item.id);
		forgetForwardedItems(item.id);
		resetEditing(item.id);
	};
	const startEdit = (item) => {
		cancelEditRef.current = false;
		const saved = readEditDraft(sessionId, item.id);
		setEditingId(item.id);
		setEditDraft(saved === null ? item.text : saved);
	};
	const finishEdit = (item) => {
		if (cancelEditRef.current) {
			cancelEditRef.current = false;
			return;
		}
		if (!editingId) return;
		const text = editDraft.trim().slice(0, 280);
		if (text && text !== item.text) {
			if (!commit((currentItems) => currentItems.map((candidate) => {
				if (candidate.id !== item.id) return candidate;
				return {
					...candidate,
					text,
					updatedAt: Date.now()
				};
			}))) {
				report("saveFailed");
				return;
			}
		}
		setEditingId(null);
		setEditDraft("");
		clearEditDraft(sessionId, item.id);
	};
	const cancelEdit = () => {
		cancelEditRef.current = true;
		const currentId = editingId;
		setEditingId(null);
		setEditDraft("");
		if (currentId) clearEditDraft(sessionId, currentId);
	};
	return {
		editingId,
		editDraft,
		setEditDraft,
		editRef,
		startEdit,
		finishEdit,
		cancelEdit,
		toggle,
		remove
	};
}

// src/client/ui/useClearConfirm.ts
/** The inline second confirmation for clearing completed notes. */
function useClearConfirm({ sessionId, showDone, doneCount, onConfirm }) {
	const [confirmClear, setConfirmClear] = react.default.useState(false);
	const clearConfirmTimerRef = react.default.useRef(0);
	/** Drop the pending auto-dismiss clock without touching state. */
	const stopClearConfirmTimer = () => {
		if (!clearConfirmTimerRef.current) return;
		window.clearTimeout(clearConfirmTimerRef.current);
		clearConfirmTimerRef.current = 0;
	};
	/** Close the inline band and drop its pending timer. */
	const dismissClearConfirm = () => {
		stopClearConfirmTimer();
		setConfirmClear(false);
	};
	/** Open the inline band; it retires itself after a short pause. */
	const askClearConfirm = () => {
		stopClearConfirmTimer();
		setConfirmClear(true);
		clearConfirmTimerRef.current = window.setTimeout(() => {
			clearConfirmTimerRef.current = 0;
			setConfirmClear(false);
		}, CLEAR_CONFIRM_MS);
	};
	/** Only the destructive confirm action reaches the clear routine. */
	const confirmClearDone = () => {
		dismissClearConfirm();
		onConfirm();
	};
	react.default.useEffect(() => () => stopClearConfirmTimer(), []);
	react.default.useEffect(() => {
		if (confirmClear && (!showDone || doneCount === 0)) dismissClearConfirm();
	}, [
		confirmClear,
		showDone,
		doneCount
	]);
	react.default.useEffect(() => {
		dismissClearConfirm();
	}, [sessionId]);
	return {
		confirmClear,
		askClearConfirm,
		dismissClearConfirm,
		confirmClearDone
	};
}

// src/client/ui/useListEdge.ts
/** Tracks whether the note list can still scroll down, and updates sticky heads. */
function useListEdge({ items, showOpen, showDone }) {
	const listRef = react.default.useRef(null);
	const [listHasMore, setListHasMore] = react.default.useState(false);
	/** The bottom fade exists only while the list can still scroll down. */
	const syncListEdge = react.default.useCallback(() => {
		const node = listRef.current;
		if (!node) return;
		syncStickyHeads(node);
		const more = node.scrollTop + node.clientHeight < node.scrollHeight - 1;
		setListHasMore((current) => current === more ? current : more);
	}, []);
	react.default.useEffect(() => {
		const node = listRef.current;
		if (!node) return void 0;
		syncListEdge();
		if (typeof ResizeObserver !== "function") return void 0;
		const observer = new ResizeObserver(syncListEdge);
		observer.observe(node);
		for (const section of node.children) observer.observe(section);
		return () => observer.disconnect();
	}, [
		items,
		showOpen,
		showDone,
		syncListEdge
	]);
	return {
		listRef,
		listHasMore,
		syncListEdge
	};
}

// src/client/ui/useOutsideDismiss.ts
/** Close the panel on an outside pointerdown or Escape. */
function useOutsideDismiss(panelRef, anchorRef, onClose) {
	react.default.useEffect(() => {
		const onPointerDown = (event) => {
			if (panelRef.current && panelRef.current.contains(event.target)) return;
			if (anchorRef.current && anchorRef.current.contains(event.target)) return;
			onClose();
		};
		const onKeyDown = (event) => {
			if (event.key === "Escape") onClose();
		};
		document.addEventListener("pointerdown", onPointerDown, true);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown, true);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [onClose, anchorRef]);
}

// src/client/domain/forward.ts
/** Append a note to the conversation composer (Lexical contenteditable or textarea). */
/** Append one note to the conversation composer (Lexical contenteditable or textarea). */
function appendToConversation(text, prefix = "") {
	const note = String(text || "").replace(/^\s+|\s+$/g, "");
	if (!note) return false;
	const bullet = `- ${note}`;
	const lead = prefix ? String(prefix).trim() : "";
	const emptyBlock = lead ? `${lead}\n${bullet}` : bullet;
	const visible = (node) => {
		const rect = node.getBoundingClientRect();
		return rect.width > 0 && rect.height > 0;
	};
	const specific = [...document.querySelectorAll("[data-composer-input]")].filter(visible);
	const editor = (specific.length ? specific : [...document.querySelectorAll("[contenteditable=\"true\"][role=\"textbox\"], textarea[role=\"textbox\"]")].filter(visible))[0];
	if (!editor) return false;
	/** Payload for a composer whose current plain text is `current`. */
	const payloadFor = (current) => {
		const value = typeof current === "string" ? current : "";
		if (!value.trim()) return emptyBlock;
		return value.endsWith("\n") ? bullet : `\n${bullet}`;
	};
	if (editor.tagName === "TEXTAREA") {
		const textarea = editor;
		const current = textarea.value;
		const payload = payloadFor(current);
		Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(textarea, `${current}${payload}`);
		textarea.dispatchEvent(new Event("input", { bubbles: true }));
		textarea.focus();
		const end = textarea.value.length;
		textarea.setSelectionRange(end, end);
		return true;
	}
	const payload = payloadFor(typeof editor.innerText === "string" ? editor.innerText : "");
	editor.focus();
	try {
		const range = document.createRange();
		range.selectNodeContents(editor);
		range.collapse(false);
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	} catch {}
	try {
		const data = new DataTransfer();
		data.setData("text/plain", payload);
		const event = new ClipboardEvent("paste", {
			bubbles: true,
			cancelable: true,
			clipboardData: data
		});
		if (!editor.dispatchEvent(event)) return true;
	} catch {}
	try {
		return document.execCommand("insertText", false, payload);
	} catch {
		return false;
	}
}

// src/client/domain/clipboard.ts
/** Clipboard write with a synchronous fallback. */
/** Copy plain text, with a synchronous fallback for restricted clipboards. */
async function copyText(text) {
	try {
		if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
			await navigator.clipboard.writeText(text);
			return true;
		}
	} catch {}
	try {
		const area = document.createElement("textarea");
		area.value = text;
		area.setAttribute("readonly", "");
		area.style.position = "fixed";
		area.style.opacity = "0";
		document.body.appendChild(area);
		area.select();
		const ok = document.execCommand("copy");
		area.remove();
		return ok;
	} catch {
		return false;
	}
}

// src/client/ui/TodoRow.ts
/** One note: checkbox, actions, inline edit and the forwarded mark. */
const h$9 = react.default.createElement;
function TodoRow(props) {
	const { item, done, say, onToast, onToggle, onStartEdit, onDelete, editing, editDraft, setEditDraft, onEditDraftChange, onFinishEdit, onCancelEdit, editRef, forwardPrefix, sendShortcut = SEND_SHORTCUT_DEFAULT, forwarded = false, onForwarded, onUnforwarded } = props;
	const editHintKey = sendShortcut === "enter" ? "edit.hintEnter" : "edit.hintCtrlEnter";
	const [pending, setPending] = react.default.useState("");
	const mountedRef = react.default.useRef(true);
	react.default.useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);
	const copy = async () => {
		if (pending) return;
		setPending("copy");
		let ok = false;
		try {
			ok = await copyText(item.text);
		} finally {
			if (mountedRef.current) setPending("");
		}
		if (!mountedRef.current) return;
		if (onToast) onToast(ok ? "copied" : "copyFailed");
	};
	const forward = () => {
		if (forwarded) {
			if (onUnforwarded) onUnforwarded(item);
			if (onToast) onToast("unforwarded");
			return;
		}
		if (!appendToConversation(item.text, forwardPrefix)) {
			if (onToast) onToast("forwardFailed");
			return;
		}
		if (onForwarded) onForwarded(item);
		if (onToast) onToast("forwarded");
	};
	const toggleCheck = () => onToggle(item);
	const resizeEditor = (node) => {
		if (!node) return;
		node.style.height = "auto";
		node.style.height = `${node.scrollHeight + 2}px`;
	};
	const setEditorRef = react.default.useCallback((node) => {
		editRef.current = node;
		if (node) {
			node.style.height = "auto";
			node.style.height = `${node.scrollHeight + 2}px`;
		}
	}, [editRef]);
	/** Insert a line break at the caret of the controlled edit textarea and keep focus there. */
	const insertEditNewline = (node) => {
		if (!node) return;
		const start = node.selectionStart === null ? node.value.length : node.selectionStart;
		const end = node.selectionEnd === null ? start : node.selectionEnd;
		const next = `${node.value.slice(0, start)}\n${node.value.slice(end)}`;
		const caret = start + 1;
		setEditDraft(next);
		if (onEditDraftChange) onEditDraftChange(next);
		window.requestAnimationFrame(() => {
			node.focus();
			try {
				node.setSelectionRange(caret, caret);
			} catch {}
			resizeEditor(node);
		});
	};
	const body = editing ? h$9("div", { className: "dsh-an-edit" }, h$9("textarea", {
		ref: setEditorRef,
		className: "dsh-an-editInput",
		value: editDraft,
		rows: 1,
		maxLength: 280,
		"aria-label": say("item.edit"),
		onChange: (event) => {
			const value = event.target.value;
			setEditDraft(value);
			if (onEditDraftChange) onEditDraftChange(value);
			resizeEditor(event.target);
		},
		onKeyDown: (event) => {
			if (event.isComposing || event.nativeEvent && event.nativeEvent.isComposing) return;
			if (event.key === "Escape") {
				event.preventDefault();
				onCancelEdit();
				return;
			}
			if (event.key !== "Enter") return;
			const chord = event.ctrlKey || event.metaKey;
			const platformModifier = isSendModifier(event);
			if (sendShortcut === "enter") {
				if (!chord && !event.shiftKey) {
					event.preventDefault();
					onFinishEdit(item);
				} else {
					event.preventDefault();
					insertEditNewline(event.currentTarget);
				}
				return;
			}
			if (platformModifier) {
				event.preventDefault();
				if (event.shiftKey) insertEditNewline(event.currentTarget);
				else onFinishEdit(item);
			} else if (event.shiftKey) {
				event.preventDefault();
				insertEditNewline(event.currentTarget);
			}
		},
		onBlur: () => onFinishEdit(item)
	}), h$9("div", { className: "dsh-an-editActions" }, h$9("button", {
		type: "button",
		className: "dsh-an-mini dsh-an-miniPrimary",
		onMouseDown: (event) => event.preventDefault(),
		onClick: () => onFinishEdit(item)
	}, say("edit.save")), h$9("button", {
		type: "button",
		className: "dsh-an-mini",
		onMouseDown: (event) => event.preventDefault(),
		onClick: onCancelEdit
	}, say("edit.cancel")), h$9("span", {
		className: "dsh-an-editHint",
		title: say(editHintKey, { mod: MOD_LABEL })
	}, say(editHintKey, { mod: MOD_LABEL })))) : h$9("div", {
		className: "dsh-an-text",
		title: say("item.editHint"),
		onDoubleClick: () => onStartEdit(item)
	}, item.text);
	const checked = done === true;
	return h$9("li", { className: done ? "dsh-an-row dsh-an-rowDone" : "dsh-an-row" }, h$9("button", {
		type: "button",
		className: "dsh-an-check",
		role: "checkbox",
		"aria-checked": checked ? "true" : "false",
		"aria-label": say(done ? "item.markOpen" : "item.markDone"),
		onClick: toggleCheck
	}, h$9("span", { className: "dsh-an-checkCircle" }, checked ? h$9(IconCheck, { size: 9 }) : null)), h$9("div", { className: "dsh-an-itemBody" }, body, editing ? null : h$9("div", { className: "dsh-an-rowFoot" }, h$9("span", {
		className: "dsh-an-meta",
		title: metaLabel(item, say, props.localeId)
	}, metaLabel(item, say, props.localeId)), h$9("div", { className: "dsh-an-actions" }, withTooltip(say("item.copy"), h$9("button", {
		type: "button",
		className: "dsh-an-iconBtn",
		"aria-label": say("item.copy"),
		"aria-busy": pending === "copy" ? "true" : "false",
		"data-loading": pending === "copy" ? "true" : void 0,
		onClick: copy
	}, h$9(IconCopy, null))), done ? null : withTooltip(say(forwarded ? "item.forwarded" : "item.forward"), h$9("button", {
		type: "button",
		className: "dsh-an-iconBtn",
		"aria-label": say(forwarded ? "item.forwarded" : "item.forward"),
		"data-forwarded": forwarded ? "true" : void 0,
		onClick: forward
	}, h$9(IconForward, null), forwarded ? h$9("span", {
		className: "dsh-an-forwardMark",
		"aria-hidden": true
	}, h$9(IconCheck, { size: 8 })) : null)), withTooltip(say("item.edit"), h$9("button", {
		type: "button",
		className: "dsh-an-iconBtn",
		"aria-label": say("item.edit"),
		onClick: () => onStartEdit(item)
	}, h$9(IconPencil, null))), withTooltip(say("item.delete"), h$9("button", {
		type: "button",
		className: "dsh-an-iconBtn dsh-an-iconBtnDanger",
		"aria-label": say("item.delete"),
		onClick: () => onDelete(item)
	}, h$9(IconTrash, null)))))));
}

// src/client/ui/PanelHead.ts
/** Panel title, counts and the settings/close actions. */
const h$8 = react.default.createElement;
function PanelHead(props) {
	const { say, openCount, total, showSettings, onToggleSettings, onClose, newerVersion } = props;
	return h$8("div", { className: "dsh-an-popHead" }, h$8("div", { className: "dsh-an-popTitleLine" }, h$8("div", { className: "dsh-an-popTitle" }, say("popover.title")), h$8("p", { className: "dsh-an-popMeta" }, say("popover.count", {
		open: openCount,
		total
	}))), h$8("div", { className: "dsh-an-popActions" }, withTooltip(say("settings.open"), h$8("button", {
		type: "button",
		className: "dsh-an-settingsBtn",
		"data-active": showSettings ? "true" : void 0,
		"aria-label": newerVersion ? `${say("settings.open")} · ${say("update.tip", { version: `v${newerVersion}` })}` : say("settings.open"),
		"aria-expanded": showSettings,
		onClick: onToggleSettings
	}, h$8(IconGear, null), newerVersion ? h$8("span", {
		className: "dsh-an-updateDot",
		"aria-hidden": true
	}) : null)), withTooltip(say("popover.close"), h$8("button", {
		type: "button",
		className: "dsh-an-popClose",
		"aria-label": say("popover.close"),
		onClick: onClose
	}, h$8(IconClose, null)))));
}

// src/client/ui/UpdateNotice.ts
/**
* Settings › About › update centre.
*
* One compact card: the published version, a disclosure that loads the release
* notes for it, a link to the full release page, and the update action itself.
* The action is a button, never automatic: the market queues the update when it
* is clicked, and the panel reports the operation instead of guessing.
*
* A jump across several versions lists each release separately: the newest one
* opens by default and the ones behind it expand on demand, so a 2.0.0 install
* upgrading to 2.3.0 can read 2.1.0, 2.2.0 and 2.3.0 in order.
*/
const h$7 = react.default.createElement;
const NOTES_ID = "dsh-an-update-notes";
/** Failure codes the card can explain without echoing the market's message. */
const FAILURE_COPY = {
	NO_MARKET: "update.noMarket",
	RELEASE_TOO_FRESH: "update.tooFresh",
	VERSION_UNCHANGED: "update.unchanged",
	PLUGIN_NOT_INSTALLED: "update.notInstalled",
	UPDATE_FORBIDDEN: "update.forbidden",
	UPDATE_REJECTED: "update.rejected",
	OPERATION_BUSY: "update.busy",
	UPDATE_TIMEOUT: "update.timeout"
};
function UpdateNotice(props) {
	const { say, latestVersion, market, restartSupported, notes, expanded, expandedVersions, run, fullReleaseUrl } = props;
	if (latestVersion === null) return null;
	const phase = run.phase;
	const busy = phase === "starting" || phase === "running";
	const stopped = market === "unsupported";
	const failureKey = run.failureCode ? FAILURE_COPY[run.failureCode] : "";
	const canForce = run.failureCode === "RELEASE_TOO_FRESH" || run.failureCode === "VERSION_UNCHANGED";
	const progress = phase === "running" ? run.percent === null ? say("update.updating") : say("update.updatingPercent", { percent: run.percent }) : "";
	const noteGroups = (list) => list.map((group, index) => h$7("div", {
		key: `${group.title}-${index}`,
		className: "dsh-an-updateGroup"
	}, group.title ? h$7("div", { className: "dsh-an-updateGroupTitle" }, group.title) : null, h$7("ul", { className: "dsh-an-updateItems" }, group.items.map((item, itemIndex) => h$7("li", {
		key: itemIndex,
		className: "dsh-an-updateItem"
	}, item.lead ? h$7("strong", null, item.lead) : null, item.lead ? " " : null, item.body)))));
	const entryBody = (entry) => entry.groups.length > 0 ? noteGroups(entry.groups) : h$7("p", { className: "dsh-an-updateHint" }, say("update.notesMissing"));
	const notesBody = notes.status === "loading" ? h$7("p", { className: "dsh-an-updateHint" }, say("update.notesLoading")) : notes.status === "error" ? h$7("p", { className: "dsh-an-updateHint" }, say("update.notesFailed")) : notes.status === "ready" && notes.entries.length === 1 ? entryBody(notes.entries[0]) : notes.status === "ready" ? h$7("div", { className: "dsh-an-updateVersions" }, h$7("p", { className: "dsh-an-updateHint" }, say("update.historyCount", { n: notes.entries.length })), notes.entries.map((entry, index) => {
		const open = expandedVersions[entry.version] === true;
		return h$7("div", {
			key: entry.version,
			className: "dsh-an-updateVersion"
		}, h$7("button", {
			type: "button",
			className: "dsh-an-updateVersionHead",
			"aria-expanded": open,
			onClick: () => props.onToggleVersion(entry.version)
		}, h$7("span", {
			className: "dsh-an-updateChevron",
			"data-open": open ? "true" : "false",
			"aria-hidden": true
		}, "▸"), h$7("span", { className: "dsh-an-updateVersionLabel" }, `v${entry.version}`), index === 0 ? h$7("span", { className: "dsh-an-updateLatest" }, say("update.latest")) : null), open ? h$7("div", { className: "dsh-an-updateVersionBody" }, entryBody(entry)) : null);
	}), notes.truncated ? h$7("a", {
		className: "dsh-an-updateFull",
		href: props.releasesUrl,
		target: "_blank",
		rel: "noreferrer"
	}, say("update.olderNotes")) : null) : null;
	return h$7("div", { className: "dsh-an-updateCard" }, h$7("div", { className: "dsh-an-updateTitle" }, say("update.available", { version: `v${latestVersion}` })), h$7("div", { className: "dsh-an-updateLinks" }, h$7("button", {
		type: "button",
		className: "dsh-an-updateToggle",
		"aria-expanded": expanded,
		"aria-controls": NOTES_ID,
		onClick: props.onToggleNotes
	}, say(expanded ? "update.notesHide" : "update.notesShow")), fullReleaseUrl ? h$7("a", {
		className: "dsh-an-updateFull",
		href: fullReleaseUrl,
		target: "_blank",
		rel: "noreferrer"
	}, say("update.full")) : null), expanded ? h$7("div", {
		id: NOTES_ID,
		className: "dsh-an-updateNotes",
		role: "region"
	}, notesBody) : null, stopped ? h$7("p", { className: "dsh-an-updateHint" }, say("update.noMarket")) : h$7("div", { className: "dsh-an-updateActions" }, phase === "done" ? h$7("div", { className: "dsh-an-updateDone" }, h$7("span", { className: "dsh-an-updateHint" }, say("update.updated", { version: run.installedVersion ? `v${run.installedVersion}` : `v${latestVersion}` })), run.restartRequired && restartSupported ? h$7("button", {
		type: "button",
		className: "dsh-an-updatePrimary",
		onClick: props.onRestart
	}, say("update.restart")) : h$7("button", {
		type: "button",
		className: "dsh-an-updatePrimary",
		onClick: props.onRefresh
	}, say("update.refresh"))) : h$7("button", {
		type: "button",
		className: "dsh-an-updatePrimary",
		disabled: busy,
		onClick: () => props.onStartUpdate(false)
	}, busy ? phase === "starting" ? say("update.starting") : progress : say("update.now")), phase === "error" ? h$7("p", {
		className: "dsh-an-updateError",
		role: "status"
	}, failureKey ? say(failureKey) : say("update.failed", { reason: run.message || run.failureCode || "" }), canForce ? h$7("button", {
		type: "button",
		className: "dsh-an-updateLinkBtn",
		onClick: () => props.onStartUpdate(true)
	}, say("update.force")) : null) : null, run.phase === "done" && run.restartRequired && !restartSupported ? h$7("p", { className: "dsh-an-updateHint" }, say("update.restartHint")) : null));
}

// src/client/ui/SettingsPanel.ts
/** Settings card: send shortcut, forward prefix and about. */
const h$6 = react.default.createElement;
function SettingsPanel(props) {
	const { say, sendShortcut, chooseShortcut, forwardPrefix, changeForwardPrefix, prefixRef, update } = props;
	return h$6("div", { className: "dsh-an-settings" }, h$6("div", { className: "dsh-an-settingsHead" }, say("settings.title")), h$6("div", { className: "dsh-an-settingGroup" }, h$6("div", { className: "dsh-an-settingLabel" }, say("settings.shortcut")), h$6("div", { className: "dsh-an-settingBody" }, h$6("div", { className: "dsh-an-settingChoices" }, h$6("label", { className: "dsh-an-settingChoice" }, h$6("input", {
		type: "radio",
		name: "dsh-an-send-shortcut",
		checked: sendShortcut === "enter",
		onChange: () => chooseShortcut("enter")
	}), h$6("span", null, say("settings.shortcutEnter", { mod: MOD_LABEL }))), h$6("label", { className: "dsh-an-settingChoice" }, h$6("input", {
		type: "radio",
		name: "dsh-an-send-shortcut",
		checked: sendShortcut === "ctrl-enter",
		onChange: () => chooseShortcut("ctrl-enter")
	}), h$6("span", null, say("settings.shortcutCtrlEnter", { mod: MOD_LABEL })))))), h$6("div", { className: "dsh-an-settingGroup" }, h$6("div", { className: "dsh-an-settingLabel" }, say("settings.forward")), h$6("div", { className: "dsh-an-settingBody" }, h$6("div", { className: "dsh-an-settingItem" }, h$6("textarea", {
		id: "dsh-an-forward-prefix",
		ref: prefixRef,
		className: "dsh-an-settingInput dsh-an-settingTextarea",
		value: forwardPrefix,
		rows: 1,
		maxLength: 80,
		placeholder: say("forward.prefix"),
		"aria-label": say("settings.forwardPrefixItem"),
		"aria-describedby": "dsh-an-forward-prefix-hint",
		style: {
			fontFamily: "inherit",
			fontSize: "var(--an-fs-row)",
			lineHeight: "var(--an-lh-row)",
			fontWeight: 500
		},
		onChange: (event) => changeForwardPrefix(event.target.value)
	}), h$6("p", {
		id: "dsh-an-forward-prefix-hint",
		className: "dsh-an-settingHint"
	}, say("settings.forwardPrefixHint"))))), h$6("div", { className: "dsh-an-settingGroup" }, h$6("div", { className: "dsh-an-settingLabel" }, say("settings.about")), h$6("div", { className: "dsh-an-settingBody" }, h$6("div", { className: "dsh-an-settingAbout" }, h$6("span", { className: "dsh-an-settingAboutVersion" }, `${say("settings.version")} ${PLUGIN_VERSION}`), h$6("button", {
		type: "button",
		className: "dsh-an-updateCheck",
		disabled: update.check.status === "checking",
		onClick: update.checkNow
	}, say(update.check.status === "checking" ? "update.checking" : update.check.status === "error" ? "update.retryCheck" : "update.check")), update.check.status === "current" ? h$6("span", {
		className: "dsh-an-updateHint",
		role: "status"
	}, say("update.current")) : null, update.check.status === "error" ? h$6("span", {
		className: "dsh-an-updateHint dsh-an-updateHintError",
		role: "status"
	}, say("update.checkFailed")) : null, h$6("span", { className: "dsh-an-settingAuthor" }, `${say("settings.author")} ${PLUGIN_AUTHOR}`)), update.latestVersion ? h$6(UpdateNotice, {
		say,
		latestVersion: update.latestVersion,
		market: update.market,
		restartSupported: update.restartSupported,
		notes: update.notes,
		expanded: update.expanded,
		expandedVersions: update.expandedVersions,
		releasesUrl: update.releasesUrl,
		run: update.run,
		fullReleaseUrl: update.fullReleaseUrl,
		onToggleNotes: update.toggleNotes,
		onToggleVersion: update.toggleVersion,
		onStartUpdate: update.startUpdate,
		onRefresh: update.refreshPage,
		onRestart: update.restartHost
	}) : null, h$6("div", { className: "dsh-an-settingProject" }, h$6("span", null, say("settings.project")), h$6("a", {
		className: "dsh-an-settingLink",
		href: PLUGIN_REPO_URL,
		target: "_blank",
		rel: "noreferrer",
		title: PLUGIN_REPO_URL
	}, PLUGIN_REPO_LABEL)))));
}

// src/client/ui/ComposerForm.ts
/** The add form: one growing textarea, the shortcut hint and the submit button. */
const h$5 = react.default.createElement;
function ComposerForm(props) {
	const { say, draft, inputRef, sendShortcut, onDraftChange, onCompositionStart, onCompositionEnd, onKeyDown, onSubmit } = props;
	return h$5("form", {
		className: "dsh-an-add",
		onSubmit
	}, h$5("textarea", {
		ref: inputRef,
		className: "dsh-an-input",
		value: draft,
		rows: 1,
		maxLength: 280,
		placeholder: say("add.placeholder"),
		"aria-label": say("add.placeholder"),
		onChange: onDraftChange,
		onCompositionStart,
		onCompositionEnd,
		onKeyDown
	}), h$5("div", { className: "dsh-an-addFoot" }, h$5("span", { className: "dsh-an-addShortcut" }, say(sendShortcut === "enter" ? "add.shortcutEnter" : "add.shortcut", { mod: MOD_LABEL })), h$5("button", {
		type: "submit",
		className: "dsh-an-addBtn",
		disabled: !draft.trim()
	}, say("add.action"))));
}

// src/client/ui/ClearConfirm.ts
/** Inline second confirmation for clearing the completed notes. */
const h$4 = react.default.createElement;
function ClearConfirm(props) {
	const { say, count, onCancel, onConfirm } = props;
	return h$4("div", {
		className: "dsh-an-clearConfirm",
		role: "group",
		"aria-live": "polite",
		"aria-label": say("popover.clearConfirm", { n: count })
	}, h$4("p", { className: "dsh-an-clearConfirmText" }, say("popover.clearConfirm", { n: count })), h$4("div", { className: "dsh-an-clearConfirmActions" }, h$4("button", {
		type: "button",
		className: "dsh-an-mini",
		onClick: onCancel
	}, say("popover.clearCancel")), h$4("button", {
		type: "button",
		className: "dsh-an-mini dsh-an-miniDanger",
		onClick: onConfirm
	}, say("popover.clearConfirmAction"))));
}

// src/client/ui/EmptyState.ts
const h$3 = react.default.createElement;
function EmptyState(props) {
	return h$3("div", { className: "dsh-an-empty" }, h$3("div", { className: "dsh-an-emptyIcon" }, h$3(IconEmpty, null)), h$3("div", { className: "dsh-an-emptyTitle" }, props.title), h$3("div", { className: "dsh-an-emptyBody" }, props.body));
}

// src/client/ui/NoteList.ts
/** Open/completed sections, their sticky heads, rows and the clear confirmation. */
const h$2 = react.default.createElement;
function NoteList(props) {
	const { say, listRef, listHasMore, syncListEdge, showOpen, toggleOpen, openItems, openCount, total, row, showDone, toggleDone, doneItems, confirmClear, askClearConfirm, dismissClearConfirm, confirmClearDone } = props;
	return h$2("div", {
		className: "dsh-an-listViewport",
		"data-bottom": listHasMore ? "true" : void 0
	}, h$2("div", {
		className: "dsh-an-listArea",
		ref: listRef,
		onScroll: syncListEdge
	}, h$2("div", { className: "dsh-an-listSection" }, h$2("div", { className: "dsh-an-sectionHead" }, h$2("button", {
		type: "button",
		className: "dsh-an-doneToggle",
		"aria-expanded": showOpen ? "true" : "false",
		onClick: toggleOpen
	}, h$2("span", {
		className: "dsh-an-chevron",
		"data-open": showOpen ? "true" : "false"
	}, h$2(IconChevron, null)), say("list.open"), openCount ? h$2("span", { className: "dsh-an-sectionCount" }, String(openCount)) : null)), showOpen ? openItems.length ? h$2("ul", { className: "dsh-an-rows" }, openItems.map(row)) : h$2(EmptyState, {
		title: say(total ? "list.allDone.title" : "popover.empty.title"),
		body: say(total ? "list.allDone.body" : "popover.empty.body")
	}) : null), doneItems.length ? h$2("div", { className: "dsh-an-listSection" }, h$2("div", { className: "dsh-an-doneHead" }, h$2("button", {
		type: "button",
		className: "dsh-an-doneToggle",
		"aria-expanded": showDone ? "true" : "false",
		onClick: toggleDone
	}, h$2("span", {
		className: "dsh-an-chevron",
		"data-open": showDone ? "true" : "false"
	}, h$2(IconChevron, null)), say("popover.completed"), h$2("span", { className: "dsh-an-sectionCount" }, String(doneItems.length))), showDone ? h$2("button", {
		type: "button",
		className: "dsh-an-clear",
		"aria-expanded": confirmClear ? "true" : "false",
		onClick: askClearConfirm
	}, say("popover.clearDone")) : null), showDone && confirmClear ? h$2(ClearConfirm, {
		say,
		count: doneItems.length,
		onCancel: dismissClearConfirm,
		onConfirm: confirmClearDone
	}) : null, showDone ? h$2("ul", { className: "dsh-an-rows dsh-an-doneRows" }, doneItems.map(row)) : null) : null));
}

// src/client/ui/MemoPopover.ts
/**
* The floating notes panel.
*
* State, handlers and effects for one session's notes; the markup lives in the
* sibling components, the geometry in usePanelGeometry and the store in
* useSessionMemoStore.
*/
const h$1 = react.default.createElement;
function MemoPopover(props) {
	const say = props.say;
	const localeId = props.localeId;
	const sessionId = props.sessionId || "";
	/** Settled outcomes go to the frame-wide toast host, not to inline marks. */
	const report = typeof props.onToast === "function" ? props.onToast : () => {};
	const { record, syncError, commit } = useSessionMemoStore(props.sessionId);
	const { sectionsRef, showOpen, showDone, toggleOpen, toggleDone, applySections } = useSections();
	const { forwardedIds, rememberForwarded, unrememberForwarded, forgetForwardedItems } = useForwardMarks(sessionId);
	const { showSettings, setShowSettings, sendShortcut, chooseShortcut, forwardPrefix, changeForwardPrefix, prefixRef } = usePanelSettings();
	const update = useUpdateCenter(localeId);
	const newerVersion = update.latestVersion;
	const { draft, addRef, composingRef, add, onDraftChange, onDraftKeyDown } = useComposerDraft({
		sessionId,
		commit,
		report,
		sendShortcut
	});
	const { editingId, editDraft, setEditDraft, editRef, startEdit, finishEdit, cancelEdit, toggle, remove } = useNoteActions({
		sessionId,
		commit,
		report,
		forgetForwardedItems
	});
	const { confirmClear, askClearConfirm, dismissClearConfirm, confirmClearDone } = useClearConfirm({
		sessionId,
		showDone,
		doneCount: record.items.filter((item) => item.done).length,
		onConfirm: () => clearDone()
	});
	const panelRef = react.default.useRef(null);
	const { style, commitPanelWidth, commitPanelHeight, startPanelResize, startPanelHeightResize, onPanelResizeKeyDown, onPanelHeightKeyDown } = usePanelGeometry(props.anchorRef, props.placement, panelRef);
	const items = record.items || [];
	const openItems = items.filter((item) => !item.done);
	const doneItems = items.filter((item) => item.done).sort(compareDoneItems);
	const openCount = openItems.length;
	const total = items.length;
	const { listRef, listHasMore, syncListEdge } = useListEdge({
		items,
		showOpen,
		showDone
	});
	useOutsideDismiss(panelRef, props.anchorRef, props.onClose);
	const clearDone = () => {
		const clearedItems = items.filter((item) => item.done);
		if (!commit((currentItems) => currentItems.filter((item) => !item.done))) {
			report("saveFailed");
			return;
		}
		report("cleared");
		forgetForwardedItems(clearedItems.map((item) => item.id));
		applySections({
			open: sectionsRef.current.open,
			done: false
		});
	};
	const row = (item) => h$1(TodoRow, {
		key: item.id,
		item,
		done: item.done,
		say,
		localeId,
		onToast: report,
		onToggle: toggle,
		onStartEdit: startEdit,
		onDelete: remove,
		editing: editingId === item.id,
		editDraft,
		setEditDraft,
		onEditDraftChange: (value) => saveEditDraft(sessionId, item.id, value),
		onFinishEdit: finishEdit,
		onCancelEdit: cancelEdit,
		editRef,
		forwardPrefix: forwardPrefix.trim() ? forwardPrefix : say("forward.prefix"),
		sendShortcut,
		forwarded: forwardedIds[item.id] === true,
		onForwarded: rememberForwarded,
		onUnforwarded: unrememberForwarded
	});
	const content = h$1("div", {
		ref: panelRef,
		className: props.placement === "right" ? "dsh-an-popover dsh-an-popoverRight" : "dsh-an-popover",
		style,
		role: "dialog",
		"aria-label": say("popover.title")
	}, props.placement === "right" ? h$1("div", {
		className: "dsh-an-resizeHandle",
		role: "separator",
		"aria-orientation": "vertical",
		"aria-label": say("resize.width"),
		tabIndex: 0,
		title: say("resize.hint"),
		onPointerDown: startPanelResize,
		onDoubleClick: () => commitPanelWidth(360),
		onKeyDown: onPanelResizeKeyDown
	}) : null, props.placement === "right" ? h$1("div", {
		className: "dsh-an-resizeHandleBottom",
		role: "separator",
		"aria-orientation": "horizontal",
		"aria-label": say("resize.height"),
		tabIndex: 0,
		title: say("resize.hint"),
		onPointerDown: startPanelHeightResize,
		onDoubleClick: () => commitPanelHeight(0),
		onKeyDown: onPanelHeightKeyDown
	}) : null, h$1(PanelHead, {
		say,
		openCount,
		total,
		showSettings,
		onToggleSettings: () => setShowSettings((value) => !value),
		onClose: props.onClose,
		newerVersion
	}), showSettings ? h$1(SettingsPanel, {
		say,
		sendShortcut,
		chooseShortcut,
		forwardPrefix,
		changeForwardPrefix,
		prefixRef,
		update
	}) : null, h$1(ComposerForm, {
		say,
		draft,
		inputRef: addRef,
		sendShortcut,
		onDraftChange,
		onCompositionStart: () => {
			composingRef.current = true;
		},
		onCompositionEnd: () => {
			composingRef.current = false;
		},
		onKeyDown: onDraftKeyDown,
		onSubmit: (event) => {
			event.preventDefault();
			if (composingRef.current) return;
			add();
		}
	}), h$1(NoteList, {
		say,
		listRef,
		listHasMore,
		syncListEdge,
		showOpen,
		toggleOpen,
		openItems,
		openCount,
		total,
		row,
		showDone,
		toggleDone,
		doneItems,
		confirmClear,
		askClearConfirm,
		dismissClearConfirm,
		confirmClearDone
	}), h$1("div", {
		className: "dsh-an-popFoot",
		role: "status"
	}, h$1("span", { className: syncError ? "dsh-an-error" : void 0 }, say(syncError ? "storage.failed" : "popover.storage"))));
	return react_dom.default.createPortal(content, document.body);
}

// src/client/storage/migrate.ts
/** One-time marker; its presence means the copy below already ran successfully. */
const MIGRATED_KEY = "dsh.aside-notes.migrated.v2";
/**
* The 1.x keys, read once and copied verbatim.
*
* They are never deleted: a user who rolls back to 1.9.x still finds their
* notes, and a half-finished copy is retried on the next load because the
* marker is only written after the whole loop succeeds.
*/
const LEGACY_KEYS = [
	[SESSION_STORAGE_KEY, "dsh.session-memos.v1"],
	[DRAFT_STORAGE_KEY, "dsh.memo.drafts.v1"],
	[FORWARDED_STORAGE_KEY, "dsh.memo.forwarded.v1"],
	[SECTION_STATE_KEY, "dsh.memo.sections.v1"],
	[PANEL_WIDTH_KEY, "dsh.memo.panel-width.v1"],
	[PANEL_HEIGHT_KEY, "dsh.memo.panel-height.v1"],
	[SEND_SHORTCUT_KEY, "dsh.memo.send-shortcut.v1"],
	[FORWARD_PREFIX_STORAGE_KEY, "dsh.memo.forward-prefix.v1"]
];
/**
* Copy 1.x storage into the AsideNote keys.
*
* Runs before anything reads the store. A newer value already present wins, so
* the migration never overwrites what the user did after upgrading.
*/
function migrateLegacyStorage() {
	const ls = storage();
	if (!ls) return;
	try {
		if (ls.getItem(MIGRATED_KEY) !== null) return;
		for (const [next, legacy] of LEGACY_KEYS) {
			if (ls.getItem(next) !== null) continue;
			const raw = ls.getItem(legacy);
			if (raw !== null) ls.setItem(next, raw);
		}
		ls.setItem(MIGRATED_KEY, (/* @__PURE__ */ new Date()).toISOString());
	} catch {}
}

// src/client/index.ts
/**
* AsideNote browser half.
*
* The plugin entry: injects the stylesheet, binds the locale namespace and
* seats the two slots (session capture + frame-wide toast host) plus the
* host-owned header entry. Copy, storage, domain rules and the panel UI live
* in their own modules; P2 splits the remaining UI out of this file.
*/
const h = react.default.createElement;
/** Compact floating memo list, anchored to the entry that opened it. */
function apply(ctx) {
	migrateLegacyStorage();
	const locale = ctx.get("locale");
	ctx.effect(() => {
		const style = document.createElement("style");
		style.dataset.dshPlugin = "dsh-asidenote";
		style.textContent = panel_css_default;
		document.head.appendChild(style);
		return () => {
			style.remove();
		};
	}, "dsh-asidenote: styles");
	if (locale && typeof locale.register === "function") ctx.effect(() => locale.register(NS, DICT), "dsh-asidenote: dictionaries");
	const localeId = () => {
		try {
			const current = locale && typeof locale.getLocale === "function" ? locale.getLocale() : null;
			const id = current && (current.id || current.locale);
			return typeof id === "string" && id ? id : "zh";
		} catch {
			return "zh";
		}
	};
	const say = makeSay(ctx, localeId);
	const tr = (key, vars) => fill(say(key), vars);
	let activePopover = null;
	let activeSessionId = "";
	const toastSeat = createToastSeat(tr);
	let refreshHeaderEntry = () => {};
	const closeMemoPopover = () => {
		const current = activePopover;
		activePopover = null;
		if (!current) return;
		const hadFocus = current.container.contains(document.activeElement);
		try {
			current.root.unmount();
		} catch {}
		current.container.remove();
		const anchor = current.anchor;
		if (hadFocus && anchor && anchor.isConnected && typeof anchor.focus === "function") anchor.focus({ preventScroll: true });
		refreshHeaderEntry();
	};
	const openMemoPopover = (sessionId, anchor, placement = "popover") => {
		if (activePopover && activePopover.anchor === anchor) {
			closeMemoPopover();
			return;
		}
		closeMemoPopover();
		const container = document.createElement("div");
		container.dataset.dshMemoPopoverRoot = "true";
		document.body.appendChild(container);
		const root = react_dom_client.default.createRoot(container);
		activePopover = {
			container,
			root,
			anchor,
			placement
		};
		root.render(h(MemoPopover, {
			sessionId,
			say: tr,
			localeId: localeId(),
			anchorRef: { current: anchor },
			placement,
			onClose: closeMemoPopover,
			onToast: (kind) => toastSeat.show(kind)
		}));
		refreshHeaderEntry();
	};
	const headerEntry = createHeaderEntry({
		getSessionId: () => activeSessionId,
		getActiveAnchor: () => activePopover ? activePopover.anchor : null,
		getLocaleId: () => localeId(),
		tr,
		onOpen: (sessionId, anchor) => openMemoPopover(sessionId, anchor, "right")
	});
	refreshHeaderEntry = headerEntry.refresh;
	ctx.effect(() => headerEntry.attach(() => closeMemoPopover()), "dsh-asidenote: right-side entry");
	function BoundSessionCapture(props) {
		const sessionId = props.sessionId || "";
		react.default.useEffect(() => {
			if (activeSessionId !== sessionId) {
				activeSessionId = sessionId;
				closeMemoPopover();
			}
			refreshHeaderEntry();
		}, [sessionId]);
		return null;
	}
	ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
		name: "conversation.composer.dock",
		id: PANEL_ID,
		order: 30,
		locale: NS
	}, BoundSessionCapture));
	ctx.slots.inject("shell.overlay", () => ctx.slots.register({
		name: "shell.overlay",
		id: `${PANEL_ID}.toast`,
		order: 60,
		locale: NS
	}, toastSeat.ToastHost));
}
module.exports = {
	inject: ["slots"],
	apply
};

return module.exports; } });