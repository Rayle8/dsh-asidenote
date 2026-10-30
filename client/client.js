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
var panel_css_default = "/*\n * Panel, composer dock, header entry and toast styles.\n *\n * Only DSH semantic aliases and the shared scale are used here — no palette of\n * its own. The entry point injects this sheet once for the whole frame, because\n * the dock mounts outside the panel tree.\n */\n/* ── 1 令牌 · 只映射 DSH 语义别名与共享尺度，不新建调色板 ─────────── */\nbody{--an-space-1:4px;--an-space-2:8px;--an-space-3:12px;--an-space-4:16px;--an-space-5:24px;--an-space-6:32px;--an-radius-pill:999px;--an-fs-caption:12px;--an-lh-caption:20px;--an-fs-row:13px;--an-lh-row:20px;--an-fs-title:14px;--an-lh-title:20px;--an-hover:var(--dsw-alias-interactive-bg-hover);--an-active:var(--dsw-alias-interactive-bg-active);--an-field:var(--dsw-alias-bg-layer-1);--an-field-line:var(--dsw-alias-border-l4);--an-divider:var(--dsw-alias-border-l2);--an-dur-fast:var(--ds-transition-duration-fast);--an-dur-base:var(--ds-transition-duration);--an-dur-spin:700ms;--an-ease:var(--ds-ease-in-out);--an-transition:background-color var(--an-dur-fast) var(--an-ease),border-color var(--an-dur-fast) var(--an-ease),color var(--an-dur-fast) var(--an-ease),opacity var(--an-dur-fast) var(--an-ease),transform var(--an-dur-fast) var(--an-ease),box-shadow var(--an-dur-fast) var(--an-ease)}\n\n/* ── 2 浮层 · 菜单材质 + 三层阴影，边框为 0（发丝线在阴影第一层） ── */\n.dsh-an-popover{position:fixed;z-index:1000;box-sizing:border-box;display:flex;flex-direction:column;gap:var(--an-space-3);min-height:0;padding:var(--an-space-4);border:0;border-radius:var(--dsw-radius-panel);background:var(--dsh-an-panelSurface);box-shadow:var(--dsw-elevation-panel);color:var(--dsw-alias-label-primary);font-size:var(--an-fs-row);line-height:var(--an-lh-row);--dsw-elevation-stroke-color:var(--dsw-alias-border-l2);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2,var(--an-divider));--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2,var(--dsw-alias-scrollbar-bg-l2,var(--an-divider)));--dsh-an-panelSurface:var(--dsw-alias-bg-layer-2);--dsh-an-listGutter:var(--an-space-4);--dsh-an-scrollRail:9px;--dsh-an-scrollInset:2px;overflow:hidden;animation:dsh-an-pop-in var(--an-dur-base) var(--an-ease) both}\n.dsh-an-popoverRight{padding-left:var(--an-space-4)}\n\n/* ── 3 面板头 · 标题与计数同一行，动作收在右侧 ───────────────────── */\n.dsh-an-popHead{display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-3);min-width:0}\n.dsh-an-popTitleLine{display:flex;align-items:center;gap:var(--an-space-3);flex:1 1 auto;min-width:0}\n.dsh-an-popTitle{min-width:0;overflow:hidden;font-size:var(--an-fs-title);line-height:var(--an-lh-title);font-weight:500;color:var(--dsw-alias-label-primary);white-space:nowrap;text-overflow:ellipsis}\n.dsh-an-popMeta{min-width:0;margin:0;overflow:hidden;font-size:var(--an-fs-caption);line-height:16px;color:var(--dsw-alias-label-secondary);font-weight:400;font-variant-numeric:tabular-nums;white-space:nowrap;text-overflow:ellipsis}\n.dsh-an-popActions{display:flex;align-items:center;flex:none;gap:var(--an-space-2)}\n.dsh-an-popClose,.dsh-an-settingsBtn{display:grid;place-items:center;flex:none;width:24px;height:24px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-popClose:active,.dsh-an-settingsBtn:active{background:var(--an-active)}\n.dsh-an-settingsBtn[data-active=\"true\"]{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n\n/* ── 4 添加区 · 嵌套表单组 R16，字段 0.5px 发丝线 ──────────────────── */\n.dsh-an-add{display:flex;flex-direction:column;gap:var(--an-space-2);padding:var(--an-space-3);border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill);transition:var(--an-transition)}\n.dsh-an-add:focus-within{border-color:var(--dsw-alias-state-business-primary)}\n.dsh-an-input{display:block;flex:0 0 auto;width:100%;min-width:0;box-sizing:border-box;min-height:var(--an-lh-row);max-height:120px;padding:0;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-row);line-height:var(--an-lh-row);resize:none;overflow-y:auto;overflow-x:hidden}\n.dsh-an-input::placeholder{color:var(--dsw-alias-label-secondary)}\n.dsh-an-addFoot{display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-2);width:100%;min-width:0}\n.dsh-an-addShortcut{min-width:0;overflow:hidden;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);white-space:nowrap;text-overflow:ellipsis}\n.dsh-an-addBtn{display:inline-flex;align-items:center;justify-content:center;flex:none;height:28px;padding:0 var(--an-space-2);border:0;border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-addBtn:active{background:var(--dsw-alias-button-primary-dimmed);transform:scale(.97)}\n.dsh-an-addBtn[disabled]{background:transparent;color:var(--dsw-alias-label-secondary);box-shadow:inset 0 0 0 0.5px var(--an-field-line);cursor:not-allowed}\n\n/* ── 5 分区与列表 · 9px 轨道内嵌 2px，底部羽化只盖内容不盖滚动条 ──── */\n/* The viewport grows into the popover padding so the 9px rail does not steal from the cards; the list pays the padding back minus the rail, so cards and the add field keep one content width at every panel size. */\n.dsh-an-listViewport{position:relative;display:flex;flex-direction:column;flex:1 1 auto;min-height:0;margin-right:calc(var(--dsh-an-listGutter) * -1)}\n/* Bottom edge treatment: a viewport-fixed alpha mask over the scroller itself, exactly like the DSH scroll areas. The first gradient fades the last 48px to transparent; the second keeps the 9px scrollbar rail opaque so the thumb stays crisp. There is no backdrop-filter layer, so there is no hard compositing edge to see. */\n.dsh-an-listViewport[data-bottom=\"true\"] .dsh-an-listArea{--dsh-an-fadeHeight:calc(var(--an-space-6) + var(--an-space-4));-webkit-mask-image:linear-gradient(to bottom,currentColor 0,currentColor calc(100% - var(--dsh-an-fadeHeight)),transparent 100%),linear-gradient(to right,transparent calc(100% - var(--dsh-an-scrollRail)),currentColor calc(100% - var(--dsh-an-scrollRail)));mask-image:linear-gradient(to bottom,currentColor 0,currentColor calc(100% - var(--dsh-an-fadeHeight)),transparent 100%),linear-gradient(to right,transparent calc(100% - var(--dsh-an-scrollRail)),currentColor calc(100% - var(--dsh-an-scrollRail)));-webkit-mask-composite:source-over;mask-composite:add}\n/* Geometry only: the shared DSH skin paints the thumb, so the plugin declares no scrollbar pseudo-elements. The popover already binds the l2 thumb pair for the menu material. */\n.dsh-an-listArea{--dsh-scrollbar-width:var(--dsh-an-scrollRail);--dsh-scrollbar-thumb-border:var(--dsh-an-scrollInset);display:flex;flex-direction:column;flex:1 1 auto;min-height:0;padding-right:calc(var(--dsh-an-listGutter) - var(--dsh-an-scrollRail));overflow-x:hidden;overflow-y:auto;scrollbar-gutter:stable}\n.dsh-an-listSection{display:flex;flex-direction:column;gap:var(--an-space-2);min-width:0}\n.dsh-an-listSection+.dsh-an-listSection{margin-top:var(--an-space-2)}\n.dsh-an-sectionHead,.dsh-an-doneHead{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-3);min-height:28px;margin:0;padding:var(--an-space-1) 0;background:transparent;transition:background-color var(--an-dur-fast) var(--an-ease)}\n.dsh-an-sectionHead[data-stuck],.dsh-an-doneHead[data-stuck]{background:var(--dsh-an-panelSurface,var(--dsw-alias-bg-layer-2))}\n.dsh-an-doneToggle{display:flex;align-items:center;gap:var(--an-space-2);flex:none;min-width:0;margin:0;padding:var(--an-space-1) var(--an-space-2) var(--an-space-1) 0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;text-align:left;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-doneToggle:active{background:var(--an-active)}\n.dsh-an-doneToggle[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-chevron{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:var(--dsw-alias-label-secondary);transition:transform var(--an-dur-fast) var(--an-ease)}\n.dsh-an-chevron[data-open=\"true\"]{transform:rotate(90deg)}\n.dsh-an-sectionCount{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 var(--an-space-1);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary);font-size:var(--an-fs-caption);line-height:16px;font-weight:500;font-variant-numeric:tabular-nums}\n.dsh-an-clear{display:inline-flex;align-items:center;flex:none;height:24px;margin-left:auto;padding:0 var(--an-space-2);border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-clear:active{background:var(--an-active);color:var(--dsw-alias-label-primary)}\n.dsh-an-clearConfirm{display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-2);min-width:0;margin-top:var(--an-space-1);padding:var(--an-space-2);border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill)}\n.dsh-an-clearConfirmText{flex:1 1 auto;min-width:0;margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}\n.dsh-an-clearConfirmActions{display:flex;align-items:center;flex:none;gap:var(--an-space-1)}\n.dsh-an-doneRows{margin-top:var(--an-space-2)}\n.dsh-an-rows{list-style:none;margin:0;padding:0;border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill);overflow:hidden}\n.dsh-an-row{display:flex;align-items:flex-start;gap:var(--an-space-2);padding:var(--an-space-2);border-top:0.5px solid var(--an-divider);transition:var(--an-transition)}\n.dsh-an-row:first-child{border-top:0}\n\n/* ── 6 一行便笺 · 勾选圈 14px，命中区 24px ─────────────────────────── */\n.dsh-an-check{display:flex;align-items:center;justify-content:center;flex:none;width:24px;height:24px;margin:-2px 0 0;padding:0;border:0;border-radius:var(--an-radius-pill);corner-shape:round;background:transparent;color:transparent;font:inherit;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-checkCircle{display:flex;align-items:center;justify-content:center;width:14px;height:14px;box-sizing:border-box;border:0.5px solid var(--dsw-alias-label-tertiary);border-radius:var(--an-radius-pill);corner-shape:round;background:transparent;color:transparent;transition:border-color var(--an-dur-fast) var(--an-ease),background-color var(--an-dur-fast) var(--an-ease),color var(--an-dur-fast) var(--an-ease),transform var(--an-dur-fast) var(--an-ease)}\n.dsh-an-check:active .dsh-an-checkCircle{transform:scale(.9)}\n.dsh-an-check[aria-checked=\"true\"] .dsh-an-checkCircle{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground)}\n.dsh-an-itemBody{display:flex;flex:1;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-text{display:block;width:100%;margin:0;padding:0;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-row);line-height:var(--an-lh-row);text-align:left;white-space:pre-wrap;overflow-wrap:anywhere;cursor:text;user-select:text;-webkit-user-select:text}\n.dsh-an-rowDone .dsh-an-text{color:var(--dsw-alias-label-secondary);text-decoration:line-through;text-decoration-thickness:1px;text-decoration-color:var(--dsw-alias-label-tertiary)}\n.dsh-an-rowFoot{display:flex;align-items:center;justify-content:space-between;gap:var(--an-space-2);min-height:24px}\n.dsh-an-meta{flex:0 1 auto;min-width:0;overflow:hidden;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap;text-overflow:ellipsis}\n\n/* ── 7 行操作 · 图标按钮 H24/R8，触摸端常显 ────────────────────────── */\n.dsh-an-actions{display:flex;flex:none;gap:var(--an-space-1)}\n.dsh-an-iconBtn{position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-iconBtn:active{background:var(--an-active);color:var(--dsw-alias-label-primary);transform:scale(.94)}\n.dsh-an-iconBtn:disabled,.dsh-an-iconBtn[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-forwardMark{position:absolute;right:0;bottom:0;display:flex;align-items:center;justify-content:center;width:10px;height:10px;border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-label-secondary);color:var(--dsw-alias-label-primary-foreground);pointer-events:none}\n\n/* ── 8 就地编辑 · 保存/取消为紧凑描边按钮 ──────────────────────────── */\n.dsh-an-edit{display:flex;flex-direction:column;gap:var(--an-space-1);width:100%}\n.dsh-an-editInput{display:block;width:100%;box-sizing:border-box;min-height:var(--an-lh-row);max-height:160px;padding:var(--an-space-1) var(--an-space-2);border:0.5px solid var(--an-field-line);border-radius:var(--dsw-radius-sm);background:var(--an-field);color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-row);line-height:var(--an-lh-row);outline:0;resize:none;overflow-y:auto;overflow-x:hidden;transition:var(--an-transition)}\n.dsh-an-editInput:focus{border-color:var(--dsw-alias-state-business-primary)}\n.dsh-an-editActions{display:flex;align-items:center;gap:var(--an-space-1)}\n.dsh-an-editHint{flex:1 1 auto;min-width:0;margin-left:auto;overflow:hidden;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);text-align:right;color:var(--dsw-alias-label-secondary);white-space:nowrap;text-overflow:ellipsis}\n.dsh-an-mini{display:inline-flex;align-items:center;justify-content:center;flex:none;height:24px;padding:0 var(--an-space-2);border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-mini:active{background:var(--an-active)}\n.dsh-an-mini[disabled]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-miniPrimary{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}\n.dsh-an-miniPrimary:active{background:var(--dsw-alias-button-primary-dimmed)}\n.dsh-an-miniDanger{border-color:transparent;background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-foreground)}\n.dsh-an-miniDanger:active{background:var(--dsw-alias-state-error-primary)}\n\n/* ── 9 空态 · 虚线 1px，说明 12/次级墨色 ──────────────────────────── */\n.dsh-an-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--an-space-2);padding:var(--an-space-5) var(--an-space-4);border:1px dashed var(--an-divider);border-radius:var(--dsw-radius-lg);text-align:center}\n.dsh-an-emptyIcon{display:flex;align-items:center;justify-content:center;width:32px;height:32px;margin:0 0 var(--an-space-1);border-radius:var(--dsw-radius-md);background:var(--an-hover);color:var(--dsw-alias-label-secondary)}\n.dsh-an-emptyTitle{font-size:var(--an-fs-row);line-height:var(--an-lh-row);font-weight:500;color:var(--dsw-alias-label-primary)}\n.dsh-an-emptyBody{max-width:36ch;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}\n\n/* ── 10 设置 · 分组 R16，项间 0.5px 分隔线，链接走 --dsw-alias-link ── */\n.dsh-an-settings{--dsh-an-settingIndent:var(--an-space-3);display:flex;flex-direction:column;gap:var(--an-space-2);margin:0;padding:var(--an-space-3);border:0.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill)}\n.dsh-an-settingsHead{font-size:var(--an-fs-row);line-height:var(--an-lh-row);font-weight:500;color:var(--dsw-alias-label-primary)}\n.dsh-an-settingGroup{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-settingGroup+.dsh-an-settingGroup{margin-top:var(--an-space-2);padding-top:var(--an-space-2);border-top:0.5px solid var(--an-divider)}\n.dsh-an-settingLabel{font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);font-weight:500;color:var(--dsw-alias-label-secondary)}\n.dsh-an-settingBody{display:flex;flex-direction:column;gap:var(--an-space-1);padding-left:var(--dsh-an-settingIndent)}\n.dsh-an-settingItem{display:flex;flex-direction:column;gap:var(--an-space-1);min-width:0}\n.dsh-an-settingItem+.dsh-an-settingItem{margin-top:var(--an-space-2);padding-top:var(--an-space-2);border-top:0.5px solid var(--an-divider)}\n.dsh-an-settingChoices{display:flex;flex-direction:column;gap:var(--an-space-1)}\n.dsh-an-settingChoice{display:flex;align-items:flex-start;gap:var(--an-space-2);font-size:var(--an-fs-row);line-height:var(--an-lh-row);color:var(--dsw-alias-label-primary);cursor:pointer}\n.dsh-an-settingChoice input{appearance:none;flex:none;width:14px;height:14px;margin:calc((var(--an-lh-row) - 14px) / 2) 0 0;box-sizing:border-box;border:0.5px solid var(--dsw-alias-label-tertiary);border-radius:var(--an-radius-pill);corner-shape:round;background:transparent;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-settingChoice input:checked{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);box-shadow:inset 0 0 0 3px var(--an-field)}\n.dsh-an-settingInput{box-sizing:border-box;width:100%;height:28px;padding:0 var(--an-space-2);border:0.5px solid var(--an-field-line);border-radius:var(--dsw-radius-sm);background:var(--an-field);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:var(--an-fs-row);line-height:var(--an-lh-row);font-weight:500;outline:0;transition:var(--an-transition)}\n.dsh-an-settingItem>.dsh-an-settingInput{font-family:inherit;font-size:var(--an-fs-row);line-height:var(--an-lh-row);font-weight:500}\n.dsh-an-settingInput:focus{border-color:var(--dsw-alias-state-business-primary)}\n/* 前缀提示词改为文本域：min-height 兜住三行，空态也不会被内联高度压扁 */\n.dsh-an-settingTextarea{display:block;height:auto;min-height:calc(var(--an-lh-row) + var(--an-space-4) + 2px);padding:var(--an-space-2);resize:none;overflow-y:auto;white-space:pre-wrap;overflow-wrap:anywhere}\n.dsh-an-settingHint{margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary)}\n.dsh-an-settingHintNote{margin-top:var(--an-space-1)}\n.dsh-an-settingAbout{display:flex;align-items:baseline;gap:var(--an-space-1);min-width:0;overflow:hidden;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);white-space:nowrap}\n.dsh-an-settingAbout>span{flex:none}\n.dsh-an-settingProject{display:flex;align-items:baseline;gap:var(--an-space-1);min-width:0;overflow:hidden;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary);white-space:nowrap}\n.dsh-an-settingProject>span{flex:none}\n.dsh-an-settingDot{flex:none;color:var(--dsw-alias-label-tertiary)}\n.dsh-an-settingLink{flex:0 1 auto;min-width:0;overflow:hidden;color:var(--dsw-alias-link);font-weight:500;text-decoration:none;text-overflow:ellipsis;transition:var(--an-transition)}\n.dsh-an-settingLink:focus-visible{text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px}\n\n/* ── 11 面板脚注 · 存储状态就地提示，错误用状态色 ─────────────────── */\n.dsh-an-popFoot{margin:0;font-size:var(--an-fs-caption);line-height:var(--an-lh-caption);color:var(--dsw-alias-label-secondary)}\n.dsh-an-error{color:var(--dsw-alias-state-error-primary)}\n\n/* ── 12 会话顶部入口 · H28/R8，计数徽标为胶囊 ──────────────────────── */\n.dsh-an-headerBtn{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:var(--an-transition)}\n.dsh-an-headerBtn:active{background:var(--an-active);color:var(--dsw-alias-label-primary)}\n.dsh-an-headerBtn[data-active=\"true\"]{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-headerBtn[data-disabled=\"true\"]{color:var(--dsw-alias-label-tertiary);cursor:not-allowed;pointer-events:none}\n.dsh-an-headerIcon{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:16px;color:currentColor}\n.dsh-an-headerCount{position:absolute;top:-2px;right:-2px;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 var(--an-space-1);border:0.5px solid var(--dsw-alias-bg-base);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-secondary);font-size:var(--an-fs-caption);line-height:14px;font-weight:500;font-variant-numeric:tabular-nums}\n\n/* ── 13 拖拽把手 · 8px 命中带，3px 视觉条 ─────────────────────────── */\n.dsh-an-resizeHandle{position:absolute;left:0;top:0;bottom:0;z-index:2;display:flex;align-items:center;justify-content:center;width:var(--an-space-2);cursor:ew-resize;touch-action:none;outline:0}\n.dsh-an-resizeHandle::before{content:\"\";width:3px;height:var(--an-space-6);border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-border-l4);transition:transform var(--an-dur-fast) var(--an-ease),background-color var(--an-dur-fast) var(--an-ease)}\n.dsh-an-resizeHandle:focus-visible::before{background:var(--dsw-alias-label-secondary)}\n.dsh-an-resizeHandle:focus-visible{outline-offset:-2px;border-radius:var(--dsw-radius-sm)}\n.dsh-an-resizeHandleBottom{position:absolute;left:50%;bottom:0;z-index:2;display:flex;align-items:center;justify-content:center;width:var(--an-space-6);height:var(--an-space-3);transform:translateX(-50%);cursor:ns-resize;touch-action:none;outline:0}\n.dsh-an-resizeHandleBottom::before{content:\"\";width:var(--an-space-5);height:3px;border-radius:var(--an-radius-pill);corner-shape:round;background:var(--dsw-alias-border-l4);transition:transform var(--an-dur-fast) var(--an-ease),background-color var(--an-dur-fast) var(--an-ease)}\n.dsh-an-resizeHandleBottom:focus-visible::before{background:var(--dsw-alias-label-secondary)}\n.dsh-an-resizeHandleBottom:focus-visible{outline-offset:-2px;border-radius:var(--dsw-radius-sm)}\n\n/* ── 14 加载 · 控件内 12px 环，文字隐藏，不报\"进行中\" ──────────────── */\n[data-loading=\"true\"]{position:relative;color:transparent!important;pointer-events:none;cursor:progress}\n[data-loading=\"true\"]>*{visibility:hidden}\n[data-loading=\"true\"]::after{content:\"\";position:absolute;left:50%;top:50%;box-sizing:border-box;width:12px;height:12px;margin:-6px 0 0 -6px;border:1.5px solid var(--dsw-alias-label-secondary);border-top-color:transparent;border-radius:var(--an-radius-pill);corner-shape:round;animation:dsh-an-spin var(--an-dur-spin) linear infinite}\n\n/* ── 15 悬停 · 只在支持 hover 的设备上启用（触摸端常显操作） ────────── */\n@media (hover:hover){\n.dsh-an-row:hover{background:var(--an-hover)}\n.dsh-an-actions{opacity:0;pointer-events:none}\n.dsh-an-row:hover .dsh-an-actions,.dsh-an-row:focus-within .dsh-an-actions{opacity:1;pointer-events:auto}\n.dsh-an-iconBtn:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-iconBtnDanger:hover{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}\n.dsh-an-popClose:hover,.dsh-an-settingsBtn:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-addBtn:hover:not([disabled]){background:var(--dsw-alias-button-primary-hover)}\n.dsh-an-mini:hover:not([disabled]){background:var(--an-hover)}\n.dsh-an-miniPrimary:hover:not([disabled]){background:var(--dsw-alias-button-primary-hover);color:var(--dsw-alias-label-primary-foreground)}\n.dsh-an-miniDanger:hover:not([disabled]){background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}\n.dsh-an-clear:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-doneToggle:hover{background:var(--an-hover)}\n.dsh-an-check:hover .dsh-an-checkCircle{border-color:var(--dsw-alias-label-primary)}\n.dsh-an-settingChoice:hover input{border-color:var(--dsw-alias-label-primary)}\n.dsh-an-settingLink:hover{text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px}\n.dsh-an-headerBtn:hover{background:var(--an-hover);color:var(--dsw-alias-label-primary)}\n.dsh-an-resizeHandle:hover::before{transform:scaleY(1.4);background:var(--dsw-alias-label-secondary)}\n.dsh-an-resizeHandleBottom:hover::before{transform:scaleX(1.4);background:var(--dsw-alias-label-secondary)}\n}\n\n/* ── 16 动效 · 只动 opacity/transform，错峰出场封顶 ─────────────────── */\n@media (prefers-reduced-motion:no-preference){\n.dsh-an-rows>.dsh-an-row{animation:dsh-an-row-in var(--an-dur-base) var(--an-ease) both}\n.dsh-an-rows>.dsh-an-row:nth-child(2){animation-delay:var(--an-space-1)}\n.dsh-an-rows>.dsh-an-row:nth-child(3){animation-delay:var(--an-space-2)}\n.dsh-an-rows>.dsh-an-row:nth-child(4){animation-delay:calc(var(--an-space-2) + var(--an-space-1))}\n.dsh-an-rows>.dsh-an-row:nth-child(n+5){animation-delay:var(--an-space-3)}\n}\n@keyframes dsh-an-pop-in{from{opacity:0}to{opacity:1}}\n@keyframes dsh-an-row-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}\n@keyframes dsh-an-spin{to{transform:rotate(360deg)}}\n@media (prefers-reduced-motion:reduce){\n.dsh-an-popover,.dsh-an-rows>.dsh-an-row,.dsh-an-chevron,[data-loading=\"true\"]::after{animation:none}\n.dsh-an-popover,.dsh-an-row,.dsh-an-actions,.dsh-an-iconBtn{transition-duration:1ms}\n}\n\n/* ── 17 窄视口 · 390 基准下收紧内边距，主操作全部可达 ──────────────── */\n@media (max-width:480px){\n.dsh-an-popover{padding:var(--an-space-3);--dsh-an-listGutter:var(--an-space-3)}\n.dsh-an-popoverRight{padding-left:var(--an-space-4)}\n.dsh-an-popHead{gap:var(--an-space-2)}\n.dsh-an-add{padding:var(--an-space-2) var(--an-space-3)}\n.dsh-an-sectionHead,.dsh-an-doneHead{min-height:24px}\n}\n\n";

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
const PLUGIN_VERSION = "2.0.0";
const PLUGIN_AUTHOR = "阿三石";
const PLUGIN_REPO_URL = "https://github.com/Rayle8/dsh-dsh-asidenote";
const PLUGIN_REPO_LABEL = "github.com/Rayle8/dsh-dsh-asidenote";
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
	"toast.saveFailed": "Save failed — nothing changed"
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
	"toast.saveFailed": "保存失败，内容没有改动"
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
const h$9 = react.default.createElement;
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
	return h$9(Component, { size: props.size });
}
const IconCheck = (props) => h$9(Glyph, {
	name: "IconCheckOutlineMedium",
	size: props && props.size ? props.size : 12
});
const IconCopy = () => h$9(Glyph, {
	name: "IconCopyOutlineRegular",
	size: 14
});
const IconForward = () => h$9(Glyph, {
	name: "IconShareOutlineRegular",
	size: 14
});
const IconGear = () => h$9(Glyph, {
	name: "IconSettingsOutlineRegular",
	size: 14
});
const IconPencil = () => h$9(Glyph, {
	name: "IconEditOutlineRegular",
	size: 14
});
const IconTrash = () => h$9(Glyph, {
	name: "IconTrashOutlineRegular",
	size: 14
});
const IconChevron = () => h$9(Glyph, {
	name: "IconChevronRightOutlineRegular",
	size: 12
});
const IconEmpty = () => h$9(Glyph, {
	name: "IconChecklistOutlineRegular",
	size: 18
});
const IconClose = () => h$9(Glyph, {
	name: "IconCloseOutlineRegular",
	size: 14
});
/** Wrap one icon-only control in the shared tooltip; a bare button when absent. */
function withTooltip(label, node) {
	if (!Tooltip) return node;
	return h$9(Tooltip, {
		label,
		side: "top",
		portal: true,
		gap: 6
	}, node);
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
const h$8 = react.default.createElement;
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
	const body = editing ? h$8("div", { className: "dsh-an-edit" }, h$8("textarea", {
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
	}), h$8("div", { className: "dsh-an-editActions" }, h$8("button", {
		type: "button",
		className: "dsh-an-mini dsh-an-miniPrimary",
		onMouseDown: (event) => event.preventDefault(),
		onClick: () => onFinishEdit(item)
	}, say("edit.save")), h$8("button", {
		type: "button",
		className: "dsh-an-mini",
		onMouseDown: (event) => event.preventDefault(),
		onClick: onCancelEdit
	}, say("edit.cancel")), h$8("span", {
		className: "dsh-an-editHint",
		title: say(editHintKey, { mod: MOD_LABEL })
	}, say(editHintKey, { mod: MOD_LABEL })))) : h$8("div", {
		className: "dsh-an-text",
		title: say("item.editHint"),
		onDoubleClick: () => onStartEdit(item)
	}, item.text);
	const checked = done === true;
	return h$8("li", { className: done ? "dsh-an-row dsh-an-rowDone" : "dsh-an-row" }, h$8("button", {
		type: "button",
		className: "dsh-an-check",
		role: "checkbox",
		"aria-checked": checked ? "true" : "false",
		"aria-label": say(done ? "item.markOpen" : "item.markDone"),
		onClick: toggleCheck
	}, h$8("span", { className: "dsh-an-checkCircle" }, checked ? h$8(IconCheck, { size: 9 }) : null)), h$8("div", { className: "dsh-an-itemBody" }, body, editing ? null : h$8("div", { className: "dsh-an-rowFoot" }, h$8("span", {
		className: "dsh-an-meta",
		title: metaLabel(item, say, props.localeId)
	}, metaLabel(item, say, props.localeId)), h$8("div", { className: "dsh-an-actions" }, withTooltip(say("item.copy"), h$8("button", {
		type: "button",
		className: "dsh-an-iconBtn",
		"aria-label": say("item.copy"),
		"aria-busy": pending === "copy" ? "true" : "false",
		"data-loading": pending === "copy" ? "true" : void 0,
		onClick: copy
	}, h$8(IconCopy, null))), done ? null : withTooltip(say(forwarded ? "item.forwarded" : "item.forward"), h$8("button", {
		type: "button",
		className: "dsh-an-iconBtn",
		"aria-label": say(forwarded ? "item.forwarded" : "item.forward"),
		"data-forwarded": forwarded ? "true" : void 0,
		onClick: forward
	}, h$8(IconForward, null), forwarded ? h$8("span", {
		className: "dsh-an-forwardMark",
		"aria-hidden": true
	}, h$8(IconCheck, { size: 8 })) : null)), withTooltip(say("item.edit"), h$8("button", {
		type: "button",
		className: "dsh-an-iconBtn",
		"aria-label": say("item.edit"),
		onClick: () => onStartEdit(item)
	}, h$8(IconPencil, null))), withTooltip(say("item.delete"), h$8("button", {
		type: "button",
		className: "dsh-an-iconBtn dsh-an-iconBtnDanger",
		"aria-label": say("item.delete"),
		onClick: () => onDelete(item)
	}, h$8(IconTrash, null)))))));
}

// src/client/ui/PanelHead.ts
/** Panel title, counts and the settings/close actions. */
const h$7 = react.default.createElement;
function PanelHead(props) {
	const { say, openCount, total, showSettings, onToggleSettings, onClose } = props;
	return h$7("div", { className: "dsh-an-popHead" }, h$7("div", { className: "dsh-an-popTitleLine" }, h$7("div", { className: "dsh-an-popTitle" }, say("popover.title")), h$7("p", { className: "dsh-an-popMeta" }, say("popover.count", {
		open: openCount,
		total
	}))), h$7("div", { className: "dsh-an-popActions" }, withTooltip(say("settings.open"), h$7("button", {
		type: "button",
		className: "dsh-an-settingsBtn",
		"data-active": showSettings ? "true" : void 0,
		"aria-label": say("settings.open"),
		"aria-expanded": showSettings,
		onClick: onToggleSettings
	}, h$7(IconGear, null))), withTooltip(say("popover.close"), h$7("button", {
		type: "button",
		className: "dsh-an-popClose",
		"aria-label": say("popover.close"),
		onClick: onClose
	}, h$7(IconClose, null)))));
}

// src/client/ui/SettingsPanel.ts
/** Settings card: send shortcut, forward prefix and about. */
const h$6 = react.default.createElement;
function SettingsPanel(props) {
	const { say, sendShortcut, chooseShortcut, forwardPrefix, changeForwardPrefix, prefixRef } = props;
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
	}, say("settings.forwardPrefixHint"))))), h$6("div", { className: "dsh-an-settingGroup" }, h$6("div", { className: "dsh-an-settingLabel" }, say("settings.about")), h$6("div", { className: "dsh-an-settingBody" }, h$6("div", { className: "dsh-an-settingAbout" }, h$6("span", null, `${say("settings.version")} ${PLUGIN_VERSION}`), h$6("span", {
		className: "dsh-an-settingDot",
		"aria-hidden": true
	}, "·"), h$6("span", null, `${say("settings.author")} ${PLUGIN_AUTHOR}`)), h$6("div", { className: "dsh-an-settingProject" }, h$6("span", null, say("settings.project")), h$6("a", {
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
	const [draft, setDraft] = react.default.useState(() => readSessionDrafts(sessionId).add);
	const [editingId, setEditingId] = react.default.useState(null);
	const [editDraft, setEditDraft] = react.default.useState("");
	const [initialSections] = react.default.useState(readSectionState);
	const [showDone, setShowDone] = react.default.useState(initialSections.done);
	const [showOpen, setShowOpen] = react.default.useState(initialSections.open);
	const [confirmClear, setConfirmClear] = react.default.useState(false);
	const sectionsRef = react.default.useRef(initialSections);
	const [showSettings, setShowSettings] = react.default.useState(false);
	const [sendShortcut, setSendShortcut] = react.default.useState(readSendShortcut);
	const [forwardPrefix, setForwardPrefix] = react.default.useState(readForwardPrefix);
	const [forwardedIds, setForwardedIds] = react.default.useState(() => readForwardedIds(sessionId));
	const forwardedSessionRef = react.default.useRef(sessionId ? String(sessionId) : "");
	const [listHasMore, setListHasMore] = react.default.useState(false);
	const panelRef = react.default.useRef(null);
	const { style, commitPanelWidth, commitPanelHeight, startPanelResize, startPanelHeightResize, onPanelResizeKeyDown, onPanelHeightKeyDown } = usePanelGeometry(props.anchorRef, props.placement, panelRef);
	const listRef = react.default.useRef(null);
	const editRef = react.default.useRef(null);
	const addRef = react.default.useRef(null);
	const prefixRef = react.default.useRef(null);
	const cancelEditRef = react.default.useRef(false);
	const composingRef = react.default.useRef(false);
	const clearConfirmTimerRef = react.default.useRef(0);
	const resizeAdd = (node) => {
		if (!node) return;
		node.style.height = "auto";
		node.style.height = `${node.scrollHeight + 2}px`;
	};
	react.default.useEffect(() => {
		resizeAdd(addRef.current);
	}, [draft]);
	react.default.useLayoutEffect(() => {
		const node = prefixRef.current;
		if (!node) return;
		node.style.height = "auto";
		node.style.height = `${Math.min(138, node.scrollHeight + 2)}px`;
	}, [forwardPrefix, showSettings]);
	react.default.useEffect(() => {
		const key = sessionId ? String(sessionId) : "";
		if (forwardedSessionRef.current === key) return;
		forwardedSessionRef.current = key;
		setForwardedIds(readForwardedIds(key));
	}, [sessionId]);
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
	react.default.useEffect(() => {
		const onPointerDown = (event) => {
			if (panelRef.current && panelRef.current.contains(event.target)) return;
			if (props.anchorRef.current && props.anchorRef.current.contains(event.target)) return;
			props.onClose();
		};
		const onKeyDown = (event) => {
			if (event.key === "Escape") props.onClose();
		};
		document.addEventListener("pointerdown", onPointerDown, true);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown, true);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [props.onClose, props.anchorRef]);
	react.default.useEffect(() => {
		if (!editingId || !editRef.current) return;
		editRef.current.focus();
		editRef.current.select();
	}, [editingId]);
	const items = record.items || [];
	const openItems = items.filter((item) => !item.done);
	const doneItems = items.filter((item) => item.done).sort(compareDoneItems);
	const openCount = openItems.length;
	const total = items.length;
	react.default.useEffect(() => () => stopClearConfirmTimer(), []);
	react.default.useEffect(() => {
		if (confirmClear && (!showDone || doneItems.length === 0)) dismissClearConfirm();
	}, [
		confirmClear,
		showDone,
		doneItems.length
	]);
	react.default.useEffect(() => {
		dismissClearConfirm();
	}, [sessionId]);
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
	const chooseShortcut = (value) => {
		setSendShortcut(value);
		writeSendShortcut(value);
	};
	const changeForwardPrefix = (value) => {
		const next = String(value || "").slice(0, 80);
		setForwardPrefix(next);
		writeForwardPrefix(next);
	};
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
	const remove = (item) => {
		if (!commit((currentItems) => currentItems.filter((candidate) => candidate.id !== item.id))) {
			report("saveFailed");
			return;
		}
		report("deleted");
		clearEditDraft(sessionId, item.id);
		forgetForwardedItems(item.id);
		if (item.id === editingId) {
			setEditingId(null);
			setEditDraft("");
		}
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
	/** Apply one section state and remember it right away, using the next value. */
	const applySections = (next) => {
		sectionsRef.current = next;
		setShowOpen(next.open);
		setShowDone(next.done);
		writeSectionState(next);
	};
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
	/** Only the destructive confirm action reaches the existing clear routine. */
	const confirmClearDone = () => {
		dismissClearConfirm();
		clearDone();
	};
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
	const toggleOpen = () => {
		applySections({
			open: !sectionsRef.current.open,
			done: sectionsRef.current.done
		});
	};
	const toggleDone = () => {
		applySections({
			open: sectionsRef.current.open,
			done: !sectionsRef.current.done
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
		onClose: props.onClose
	}), showSettings ? h$1(SettingsPanel, {
		say,
		sendShortcut,
		chooseShortcut,
		forwardPrefix,
		changeForwardPrefix,
		prefixRef
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
	const toastSource = (() => {
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
	/** The frame-wide toast seat: one notice at a time, dismissed when faded. */
	function ToastHost(props) {
		const notice = react.default.useSyncExternalStore(toastSource.hooks.notice.subscribe, toastSource.hooks.notice.getSnapshot);
		if (!notice || !Toast) return null;
		const copy = TOAST_COPY[notice.kind] || TOAST_COPY.saveFailed;
		const bound = props && typeof props.t === "function" ? props.t(copy.key) : "";
		const text = bound && bound !== copy.key ? bound : tr(copy.key);
		return h(Toast, {
			key: notice.sequence,
			text,
			tone: copy.tone,
			icon: copy.tone ? void 0 : WarningIcon ? h(WarningIcon, { size: 16 }) : void 0,
			onDone: toastSource.dismiss
		});
	}
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
			onToast: (kind) => toastSource.show(kind)
		}));
		refreshHeaderEntry();
	};
	const HEADER_ICON = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.25 2.75h6.5l3 3v7.5c0 .55-.45 1-1 1H3.25c-.55 0-1-.45-1-1V3.75c0-.55.45-1 1-1Z\"/><path d=\"M9.75 2.75v3h3\"/><path d=\"M4.9 7.6h5.4M4.9 9.9h3.6\" stroke-linecap=\"round\"/></svg>";
	const refreshHeaderEntry = () => {
		const host = document.querySelector("[class*=\"_headerUtilities\"]");
		let button = host ? host.querySelector(":scope > .dsh-an-headerBtn") : null;
		if (!host || !activeSessionId) {
			if (button) button.remove();
			return;
		}
		const store = readSessionStore();
		const open = normalizeItems(store.sessions[activeSessionId] && store.sessions[activeSessionId].items).filter((item) => !item.done).length;
		if (!button) {
			button = document.createElement("button");
			button.type = "button";
			button.className = "dsh-an-headerBtn";
			button.addEventListener("pointerdown", (event) => event.stopPropagation());
			button.addEventListener("click", (event) => {
				event.preventDefault();
				event.stopPropagation();
				openMemoPopover(activeSessionId, button, "right");
			});
			host.appendChild(button);
		}
		button.dataset.active = activePopover && activePopover.anchor === button ? "true" : "false";
		const signature = `${localeId()}:${activeSessionId}:${open}`;
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
		button.dataset.sessionId = activeSessionId;
		button.title = open > 0 ? tr("header.tooltip", { n: open }) : tr("header.tooltipEmpty");
		button.setAttribute("aria-label", open > 0 ? `${tr("dock.open")}, ${tr("dock.count", { n: open })}` : tr("dock.open"));
	};
	ctx.effect(() => {
		let scheduled = false;
		const schedule = () => {
			if (scheduled) return;
			scheduled = true;
			requestAnimationFrame(() => {
				scheduled = false;
				refreshHeaderEntry();
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
		refreshHeaderEntry();
		return () => {
			TODO_LISTENERS.delete(schedule);
			window.removeEventListener("storage", onStorage);
			observer.disconnect();
			closeMemoPopover();
			for (const button of document.querySelectorAll(".dsh-an-headerBtn")) button.remove();
		};
	}, "dsh-asidenote: right-side entry");
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
	}, ToastHost));
}
module.exports = {
	inject: ["slots"],
	apply
};

return module.exports; } });