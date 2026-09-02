// src/core/sprite.js —— SVG 符号库（源：prototype FIGMA-ASSETS 区间，逐只照搬；Watch 取 assets 快照并剥 Inkpad 元数据）
// 多色位挂 var(--box-line/--box-face/--surface-3)，单色位 currentColor（原型即如此，未改动）
// 品牌件：Apple/Finder/HappyMac/Watch（viewBox 0 0 2000 2000 的大件保持原样）；气球/软盘取自原型 FIGMA-ASSETS 区间
// 协议：顶层声明 McSprite；mount 在 apply 时把 <svg data-mc-sprite> 挂到 body 首位，返回 teardown
const McSprite = {
  markup: `
<symbol id="i-apple" viewBox="0 0 16 16">
    <path d="M11 1H9V2H8V4H9V5H7V4H4V5H3V6H13V5H12V4H9V3H10V2H11V1Z" fill="#00CD00"/>
    <rect x="2" y="6" width="9" height="2" fill="#FFFF00"/>
    <rect x="3" y="11" width="10" height="2" fill="#FF00B3"/>
    <path d="M4 13H12V14H11V15H9V14H7V15H5V14H4V13Z" fill="#0000E7"/>
    <rect x="2" y="10" width="11" height="1" fill="#E70000"/>
    <path d="M11 8H2V10H12V9H11V8Z" fill="#FF8700"/>
  </symbol>
  <symbol id="i-doc" viewBox="0 0 8 10"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 0H6V1H8V10H0V0ZM7 3H5V1H1V9H7V3Z" fill="currentColor"/><path d="M5 1H1V9H7V3H5V1Z" fill="var(--surface)"/></symbol>
  <symbol id="i-folder" viewBox="0 0 11 9"><path d="M5 1H1V8H10V2H5V1Z" fill="var(--surface)"/><path d="M1 0H5V1H1V0Z" fill="currentColor"/><path d="M1 1V8H10V2H5V1H11V9H0V1H1Z" fill="currentColor"/></symbol>
  <symbol id="i-suitcase" viewBox="0 0 12 10"><rect x="1" y="3" width="9" height="6" fill="var(--surface)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0H4V1H1V2H0V10H11V9H12V1H8V0ZM10 3H1V9H10V3Z" fill="currentColor"/></symbol>
  <symbol id="i-finder" viewBox="0 0 11 13"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 2H2V7H9V2ZM8 3H3V6H8V3Z" fill="currentColor"/><path d="M10 0H1V1H0V10H1V1H10V10H11V1H10V0Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 10H1V13H10V10ZM9 11H2V12H9V11Z" fill="currentColor"/><rect x="5" y="8" width="4" height="1" fill="currentColor"/></symbol>
  <symbol id="i-check" viewBox="0 0 9 8"><path d="M9 0H8V1H7V2H6V3H5V4H4V5H3V6H2V5H1V4H0V6H1V7H2V8H3V7H4V6H5V5H6V4H7V3H8V2H9V0Z" fill="currentColor"/></symbol>
  <symbol id="i-rdo" viewBox="0 0 12 12"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0H4V1H2V2H1V4H0V8H1V10H2V11H4V12H8V11H10V10H11V8H12V4H11V2H10V1H8V0ZM8 1V2H10V4H11V8H10V10H8V11H4V10H2V8H1V4H2V2H4V1H8Z" fill="currentColor"/></symbol>
  <symbol id="i-rdo-on" viewBox="0 0 12 12"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0H4V1H2V2H1V4H0V8H1V10H2V11H4V12H8V11H10V10H11V8H12V4H11V2H10V1H8V0ZM8 1V2H10V4H11V8H10V10H8V11H4V10H2V8H1V4H2V2H4V1H8Z" fill="currentColor"/><path d="M8 3H4V4H3V8H4V9H8V8H9V4H8V3Z" fill="currentColor"/></symbol>
  <symbol id="i-chk" viewBox="0 0 12 12"><rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor"/></symbol>
  <symbol id="i-chk-on" viewBox="0 0 12 12"><rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor"/><path d="M1 1H2V2H1V1Z" fill="currentColor"/><path d="M3 3H2V2H3V3Z" fill="currentColor"/><path d="M4 4H3V3H4V4Z" fill="currentColor"/><path d="M5 5H4V4H5V5Z" fill="currentColor"/><path d="M7 5H5V7H4V8H3V9H2V10H1V11H2V10H3V9H4V8H5V7H7V8H8V9H9V10H10V11H11V10H10V9H9V8H8V7H7V5Z" fill="currentColor"/><path d="M8 4V5H7V4H8Z" fill="currentColor"/><path d="M9 3V4H8V3H9Z" fill="currentColor"/><path d="M10 2V3H9V2H10Z" fill="currentColor"/><path d="M10 2V1H11V2H10Z" fill="currentColor"/></symbol>
  <symbol id="i-close" viewBox="0 0 11 11"><rect x="2" y="2" width="7" height="7" fill="var(--surface-3)"/><path d="M11 0H0V11H1V1H11V0Z" fill="var(--box-line)"/><path d="M10 2H9V9H2V10H10V2Z" fill="var(--box-line)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11 1H1V11H11V1ZM10 2H2V10H10V2Z" fill="var(--box-face)"/></symbol>
  <symbol id="i-zoom" viewBox="0 0 11 11"><rect x="2" y="2" width="7" height="7" fill="var(--surface-3)"/><path d="M11 0H0V11H1V1H11V0Z" fill="var(--box-line)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11 1H1V11H11V1ZM2 10H10V2H2V10Z" fill="var(--box-face)"/><path d="M10 2H9V9H2V10H10V2Z" fill="var(--box-line)"/><rect x="6" y="2" width="1" height="5" fill="var(--box-line)"/><rect x="2" y="6" width="5" height="1" fill="var(--box-line)"/></symbol>
  <symbol id="i-tri" viewBox="0 0 6 11"><path d="M0 0H1V1H2V2H1V9H2V10H1V11H0V0Z" fill="currentColor"/><path d="M3 8H2V9H3V8Z" fill="currentColor"/><path d="M4 7V8H3V7H4Z" fill="currentColor"/><path d="M5 6V7H4V6H5Z" fill="currentColor"/><path d="M5 5H6V6H5V5Z" fill="currentColor"/><path d="M4 4H5V5H4V4Z" fill="currentColor"/><path d="M3 3H4V4H3V3Z" fill="currentColor"/><path d="M3 3V2H2V3H3Z" fill="currentColor"/></symbol>
  <symbol id="i-caretright" viewBox="0 0 6 11"><path d="M1 0H0V11H1V10H2V9H3V8H4V7H5V6H6V5H5V4H4V3H3V2H2V1H1V0Z" fill="currentColor"/></symbol>
  <symbol id="i-command" viewBox="0 0 9 9"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 0H1V1H0V3H1V4H3V5H1V6H0V8H1V9H3V8H4V6H5V8H6V9H8V8H9V6H8V5H6V4H8V3H9V1H8V0H6V1H5V3H4V1H3V0ZM6 1H8V3H6V1ZM8 6V8H6V6H8ZM3 8H1V6H3V8ZM3 1V3H1V1H3ZM4 4V5H5V4H4Z" fill="currentColor"/></symbol>
  <symbol id="i-sparkle" viewBox="0 0 9 9"><path d="M5 0H4V3H5V0Z" fill="currentColor"/><path d="M2 1H1V2H2V3H3V2H2V1Z" fill="currentColor"/><path d="M8 1H7V2H6V3H7V2H8V1Z" fill="currentColor"/><path d="M1 7H2V8H1V7Z" fill="currentColor"/><path d="M2 7H3V6H2V7Z" fill="currentColor"/><path d="M8 7H7V6H6V7H7V8H8V7Z" fill="currentColor"/><path d="M4 6H5V9H4V6Z" fill="currentColor"/><path d="M3 4H0V5H3V4Z" fill="currentColor"/><path d="M6 4H9V5H6V4Z" fill="currentColor"/></symbol>
  <symbol id="i-px-plus" viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4z" fill="currentColor"/></symbol>
  <symbol id="i-px-search" viewBox="0 0 24 24"><path d="M6 2h8v2H6V2zM4 6V4h2v2H4zm0 8H2V6h2v8zm2 2H4v-2h2v2zm8 0v2H6v-2h8zm2-2h-2v2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm0-8h2v8h-2V6zm0 0V4h-2v2h2z" fill="currentColor"/></symbol>
  <symbol id="i-px-sliders" viewBox="0 0 24 24"><path d="M17 4h2v10h-2V4zm0 12h-2v2h2v2h2v-2h2v-2h-4zm-4-6h-2v10h2V10zm-8 2H3v2h2v6h2v-6h2v-2H5zm8-8h-2v2H9v2h6V6h-2V4zM5 4h2v6H5V4z" fill="currentColor"/></symbol>
  <symbol id="i-px-dots" viewBox="0 0 24 24"><path d="M1 9h6v6H1V9zm2 2v2h2v-2H3zm6-2h6v6H9V9zm2 2v2h2v-2h-2zm6-2h6v6h-6V9zm2 2v2h2v-2h-2z" fill="currentColor"/></symbol>
  <symbol id="i-px-clock" viewBox="0 0 24 24"><path d="M19 3H5v2H3v14h2v2h14v-2h2V5h-2V3zm0 2v14H5V5h14zm-8 2h2v6h4v2h-6V7z" fill="currentColor"/></symbol>
  <symbol id="i-px-timeline" viewBox="0 0 24 24"><path d="M7 7h4v4H7V7zm-2 6v-2h2v2H5zm0 0v4H1v-4h4zm8 0h-2v-2h2v2zm4 0h-4v4h4v-4zm2-2v2h-2v-2h2zm0 0h4V7h-4v4z" fill="currentColor"/></symbol>
  <symbol id="i-px-terminal" viewBox="0 0 24 24"><path d="M6 2h2v2H6V2Zm4 9h4v2h-4v-2Zm4 4h-4v2h4v-2Z" fill="currentColor"/><path d="M16 4h-2v2h-4V4H8v2H6v3H4V7H2v2h2v2h2v2H2v2h4v2H4v2H2v2h2v-2h2v3h12v-3h2v2h2v-2h-2v-2h-2v-2h4v-2h-4v-2h2V9h2V7h-2v2h-2V6h-2V4ZM8 20V8h8v12H8Zm8-16V2h2v2h-2Z" fill="currentColor"/></symbol>
  <symbol id="i-px-edit" viewBox="0 0 24 24"><path d="M18 2h-2v2h-2v2h-2v2h-2v2H8v2H6v2H4v2H2v6h6v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2V8h2V6h-2V4h-2V2zm0 8h-2v2h-2v2h-2v2h-2v2H8v-2H6v-2h2v-2h2V8h2V6h2v2h2v-2h2v2zM6 16H4v4h4v-2H6v-2z" fill="currentColor"/></symbol>
  <symbol id="i-px-lock" viewBox="0 0 24 24"><path d="M15 2H9v2H7v4H4v14h16V8h-3V4h-2V2zm0 2v4H9V4h6zm-6 6h9v10H6V10h3zm4 3h-2v4h2v-4z" fill="currentColor"/></symbol>
  <symbol id="i-px-eye" viewBox="0 0 24 24"><path d="M8 6h8v2H8V6zm-4 4V8h4v2H4zm-2 2v-2h2v2H2zm0 2v-2H0v2h2zm2 2H2v-2h2v2zm4 2H4v-2h4v2zm8 0v2H8v-2h8zm4-2v2h-4v-2h4zm2-2v2h-2v-2h2zm0-2h2v2h-2v-2zm-2-2h2v2h-2v-2zm0 0V8h-4v2h4zm-10 1h4v4h-4v-4z" fill="currentColor"/></symbol>
  <symbol id="i-px-zap" viewBox="0 0 24 24"><path d="M12 1h2v8h8v4h-2v-2h-8V5h-2V3h2V1zM8 7V5h2v2H8zM6 9V7h2v2H6zm-2 2V9h2v2H4zm10 8v2h-2v2h-2v-8H2v-4h2v2h8v6h2zm2-2v2h-2v-2h2zm2-2v2h-2v-2h2zm0 0h2v-2h-2v2z" fill="currentColor"/></symbol>
  <symbol id="i-px-chevd" viewBox="0 0 24 24"><path d="M7 8H5v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2V8h-2v2h-2v2h-2v2h-2v-2H9v-2H7V8z" fill="currentColor"/></symbol>
  <symbol id="i-px-copy" viewBox="0 0 24 24"><path d="M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z" fill="currentColor"/></symbol>
  <symbol id="i-px-reload" viewBox="0 0 24 24"><path d="M16 2h-2v2h2v2H4v2H2v5h2V8h12v2h-2v2h2v-2h2V8h2V6h-2V4h-2V2zM6 20h2v2h2v-2H8v-2h12v-2h2v-5h-2v5H8v-2h2v-2H8v2H6v2H4v2h2v2z" fill="currentColor"/></symbol>
  <symbol id="i-px-trash" viewBox="0 0 24 24"><path d="M16 2v4h6v2h-2v14H4V8H2V6h6V2h8zm-2 2h-4v2h4V4zm0 4H6v12h12V8h-4zm-5 2h2v8H9v-8zm6 0h-2v8h2v-8z" fill="currentColor"/></symbol>
  <symbol id="i-px-attach" viewBox="0 0 24 24"><path d="M7 5v14H5V3h14v18H9V7h6v10h-2V9h-2v10h6V5H7z" fill="currentColor"/></symbol>
  <symbol id="i-px-send" viewBox="0 0 24 24"><path d="M4 11v2h12v2h2v-2h2v-2h-2V9h-2v2H4zm10-4h2v2h-2V7zm0 0h-2V5h2v2zm0 10h2v-2h-2v2zm0 0h-2v2h2v-2z" fill="currentColor"/></symbol>
  <symbol id="i-px-stop" viewBox="0 0 24 24"><path d="M6 2h2v2H6V2Zm10 2h-2v2h-4V4H8v2H6v3H4V7H2v2h2v2h2v2H2v2h4v2H4v2H2v2h2v-2h2v3h8v-2H8V8h8v6h2v-3h2V9h2V7h-2v2h-2V6h-2V4Zm0 0V2h2v2h-2Zm-6 7h4v2h-4v-2Zm4 4h-4v2h4v-2Zm8 1h-6v6h6v-6Z" fill="currentColor"/></symbol>
  <symbol id="i-floppy" viewBox="0 0 13 12"><path d="M11 1H1V11H12V2H11V1Z" fill="var(--surface)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11 0H1V1H0V11H1V12H13V2H12V1H11V0ZM9 4H10V1H11V2H12V11H10V8H9V7H4V8H3V11H1V1H3V4H4V5H9V4ZM9 4H4V1H7V3H8V1H9V4ZM9 11H4V8H9V11Z" fill="currentColor"/></symbol>
  <symbol id="i-balloon" viewBox="0 0 14 14"><rect x=".5" y=".5" width="13" height="10" rx="2.5" fill="none" stroke="currentColor"/><path d="M3 10.5 L3 13.5 L6 10.5 Z" fill="currentColor"/><g fill="currentColor"><rect x="4.5" y="2" width="3" height="1"/><rect x="3.5" y="3" width="1" height="1"/><rect x="7.5" y="3" width="1" height="1"/><rect x="7.5" y="4" width="1" height="1"/><rect x="6.5" y="5" width="1" height="1"/><rect x="5.5" y="6" width="1" height="2"/><rect x="5.5" y="9" width="1" height="1"/></g></symbol>
  <symbol id="i-px-ext" viewBox="0 0 24 24"><path d="M21 11V3h-8v2h4v2h-2v2h-2v2h-2v2H9v2h2v-2h2v-2h2V9h2V7h2v4h2zM11 5H3v16h16v-8h-2v6H5V7h6V5z" fill="currentColor"/></symbol>
  <symbol id="i-px-goal" viewBox="0 0 24 24"><path d="M3 2h10v2h8v14H11v-2H5v6H3V2zm2 12h8v2h6V6h-8V4H5v10z" fill="currentColor"/></symbol>
  <symbol id="i-px-list" viewBox="0 0 24 24"><path d="M2 5h20v14H2V5zm2 2v2h16V7H4zm16 4H4v2h16v-2zm0 4H4v2h16v-2z" fill="currentColor"/></symbol>
  <symbol id="i-px-warning" viewBox="0 0 24 24"><path d="M3 3h16v2H5v14h14v2H3V3zm18 0h-2v18h2V3zM11 15h2v2h-2v-2zm2-8h-2v6h2V7z" fill="currentColor"/></symbol>
  <symbol id="i-moon" viewBox="0 0 24 24"><path d="M6 2h2v2H6V2zM4 4h4v2H4V4zM2 6h6v2H2V6zM2 8h6v2H2V8zM2 10h6v2H2v-2zM2 12h8v2H2v-2zM2 14h10v2H2v-2zM2 16h20v2H2v-2zM4 18h16v2H4v-2zM6 20h12v2H6v-2z" fill="currentColor"/></symbol>
  <symbol id="i-cl-HappyMac" viewBox="0 0 2000 2000">
    <g>
      <path d="M1550+300L1500+300L1500+250L450+250L450+300L400+300L400+1550L1550+1550" fill="#ffffff"/>
    </g>
    <g>
      <path d="M400+250L450+250L450+300L400+300L400+250Z" fill="#000000"/>
      <path d="M450+200L1500+200L1500+250L450+250L450+200Z" fill="#000000"/>
      <path d="M1500+250L1550+250L1550+300L1500+300L1500+250Z" fill="#000000"/>
      <path d="M1550+300L1600+300L1600+1550L1550+1550L1550+300Z" fill="#000000"/>
      <path d="M350+300L400+300L400+1550L350+1550L350+300Z" fill="#000000"/>
      <path d="M500+1350L600+1350L600+1400L500+1400L500+1350Z" fill="#000000"/>
      <path d="M1100+1300L1400+1300L1400+1350L1100+1350L1100+1300Z" fill="#000000"/>
      <path d="M550+350L1400+350L1400+400L550+400L550+350Z" fill="#000000"/>
      <path d="M1400+400L1450+400L1450+1050L1400+1050L1400+400Z" fill="#000000"/>
      <path d="M500+400L550+400L550+1050L500+1050L500+400Z" fill="#000000"/>
      <path d="M550+1050L1400+1050L1400+1100L550+1100L550+1050Z" fill="#000000"/>
      <path d="M750+550L800+550L800+650L750+650L750+550Z" fill="#000000"/>
      <path d="M1100+550L1150+550L1150+650L1100+650L1100+550Z" fill="#000000"/>
      <path d="M800+850L850+850L850+900L800+900L800+850Z" fill="#000000"/>
      <path d="M850+900L1050+900L1050+950L850+950L850+900Z" fill="#000000"/>
      <path d="M1050+850L1100+850L1100+900L1050+900L1050+850Z" fill="#000000"/>
      <path d="M400+1550L1550+1550L1550+1800L400+1800L400+1550Z" fill="#000000"/>
      <path d="M1000+550L950+550L950+750L900+750L900+800L1000+800" fill="#000000"/>
      <path d="M450+1600L1500+1600L1500+1750L450+1750L450+1600Z" fill="#ffffff"/>
    </g>
  </symbol>
  <symbol id="i-cl-Watch" viewBox="0 0 2000 2000">
  <g id="Fill">
  <path d="M850+800L850+850L800+850L800+1150L850+1150L850+1200L1150+1200L1150+1150L1200+1150L1200+850L1150+850L1150+800" opacity="1" fill="#ffffff"/>
  </g>
  <g id="Outline">
  <path d="M850+600L1150+600L1150+800L850+800L850+600Z" opacity="1" fill="#000000"/>
  <path d="M1150+800L1200+800L1200+850L1150+850L1150+800Z" opacity="1" fill="#000000"/>
  <path d="M800+800L850+800L850+850L800+850L800+800Z" opacity="1" fill="#000000"/>
  <path d="M750+850L800+850L800+1150L750+1150L750+850Z" opacity="1" fill="#000000"/>
  <path d="M800+1150L850+1150L850+1200L800+1200L800+1150Z" opacity="1" fill="#000000"/>
  <path d="M850+1200L1150+1200L1150+1400L850+1400L850+1200Z" opacity="1" fill="#000000"/>
  <path d="M1150+1150L1200+1150L1200+1200L1150+1200L1150+1150Z" opacity="1" fill="#000000"/>
  <path d="M1050+850L1000+850L1000+1000L900+1000L900+1050L1050+1050" opacity="1" fill="#000000"/>
  <path d="M1200+850L1250+850L1250+950L1300+950L1300+1050L1250+1050L1250+1150L1200+1150" opacity="1" fill="#000000"/>
  </g></symbol>
`,
  mount(ctx) {
    const wrap = document.createElement('div');
    wrap.innerHTML = '<svg data-mc-sprite xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">'
      + McSprite.markup + '</svg>';
    const el = wrap.firstElementChild;
    document.body.insertBefore(el, document.body.firstChild);
    return function teardown() { el.remove(); };
  },
};
