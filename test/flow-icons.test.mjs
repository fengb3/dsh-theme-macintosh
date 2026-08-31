// test/flow-icons.test.mjs — MC_FLOW_ICONS form→icon 纯数据映射(裁定2:createRequire 直引在
// type:module 下不生效,走 loadSrc 拷临时 .cjs 再 require,module.exports 守卫照常工作)
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';

const { MC_FLOW_ICONS } = loadSrc('src/conv/flow.js');

const FORMS = ['instructions', 'notice', 'relay', 'catalog', 'snapshot', 'recall', 'compaction', 'manual-compaction'];
const ICONS = ['doc', 'list', 'copy', 'clock'];

test('flow form→icon 映射覆盖全 form 且值合法', () => {
  assert.equal(typeof MC_FLOW_ICONS, 'object', 'MC_FLOW_ICONS 应经 CJS shim 导出');
  for (const f of FORMS) assert.ok(MC_FLOW_ICONS[f], 'missing: ' + f);
  for (const v of Object.values(MC_FLOW_ICONS)) assert.ok(ICONS.includes(v), 'bad icon: ' + v);
});
