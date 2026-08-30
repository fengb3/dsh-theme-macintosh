// src/core/tokens.js —— 层1：token alias + 最小 --mc-* 底色（深浅两套，值照《笔记》§4.1）
const McTokens = {
  css: `:root{
  --mc-bg:#2b2b2b; --mc-bg-deep:#1f1f1f;
  --mc-surface:#3d3d3d; --mc-surface-2:#4a4a4a; --mc-surface-3:#575757;
  --mc-fg:#f2f2f2; --mc-muted:#bdbdbd; --mc-faint:#949494;
  --mc-border:#e9e9e9; --mc-accent:#dadaff; --mc-accent-strong:#f2f2ff; --mc-accent-dim:rgba(218,218,255,.4); --mc-accent-ink:#1f1f2e;
  --mc-spark:#e8b64c; --mc-success:#7ed07e; --mc-danger:#ff7a74; --mc-danger-ink:#2b1211; --mc-warn:#e8b64c;
  --mc-sel-bg:rgba(218,218,255,.26); --mc-rail-1:#383838; --mc-rail-2:#414141;
  --dsw-alias-bg-base:var(--mc-bg); --dsw-alias-bg-layer-1:var(--mc-surface); --dsw-alias-bg-layer-2:var(--mc-surface-2);
  --dsw-alias-bg-overlay:var(--mc-surface-3); --dsw-alias-border-l1:var(--mc-border); --dsw-alias-border-l2:var(--mc-border);
  --dsw-alias-brand-primary:var(--mc-accent); --dsw-alias-label-primary:var(--mc-fg); --dsw-alias-label-secondary:var(--mc-muted);
  --dsw-alias-state-error-primary:var(--mc-danger); --dsw-alias-state-success-primary:var(--mc-success); --dsw-alias-state-warn-primary:var(--mc-warn);
  --dsw-specific-sidebar-fill:var(--mc-rail-1);
}
html[data-theme="light"]{
  --mc-bg:#8f8f8f; --mc-surface:#fff; --mc-surface-2:#eee; --mc-surface-3:#ddd;
  --mc-fg:#0a0a0a; --mc-muted:#333; --mc-faint:#555; --mc-border:#0a0a0a;
  --mc-accent:#8f8fc0; --mc-sel-bg:#dadaff; --mc-warn:#8a6a1f;
  --dsw-specific-sidebar-fill:var(--mc-surface);
}`
};
