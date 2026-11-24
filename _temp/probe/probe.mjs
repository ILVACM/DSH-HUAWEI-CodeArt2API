// CodeArts serve 接口探针（P2-P5 合并）
// 复用已启动的 serve：http://127.0.0.1:4196，Basic probe:probe-pass-2026
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.PROBE_BASE || 'http://127.0.0.1:4196';
const USER = process.env.PROBE_USER || 'probe';
const PASS = process.env.PROBE_PASS || 'probe-pass-2026';
const RES = 'D:/DSH-HUAWEI-CodeArt2API/_temp/probe/results';
const AUTH = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');
const H = { Authorization: AUTH, 'Content-Type': 'application/json' };

const save = (name, data) =>
  fs.writeFileSync(path.join(RES, name), typeof data === 'string' ? data : JSON.stringify(data, null, 2));
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };

const summary = { steps: [] };
const step = (k, v) => { summary.steps.push([k, v]); console.log(`[${k}] ${JSON.stringify(v).slice(0, 300)}`); };

// ---- P2 只读接口 ----
const providerRes = await fetch(`${BASE}/provider`, { headers: H });
const provider = await j(providerRes);
save('C-provider.json', provider);
const all = Array.isArray(provider?.all) ? provider.all : [];
const modelPick = [];
for (const p of all) {
  for (const [mid, m] of Object.entries(p.models || {})) {
    modelPick.push({ providerID: p.id, modelID: mid, name: m.name, reasoning: m.reasoning, tool_call: m.tool_call });
  }
}
step('provider.status', providerRes.status);
step('provider.count', all.length);
step('models.count', modelPick.length);
save('C-models-picked.json', modelPick);

const configRes = await fetch(`${BASE}/config`, { headers: H });
const config = await j(configRes);
save('C-config.json', config);
step('config.status', configRes.status);

const listRes = await fetch(`${BASE}/session`, { headers: H });
const list = await j(listRes);
save('C-session-list.json', list);
step('session.list.status', listRes.status);
step('session.list.count', Array.isArray(list) ? list.length : 'n/a');

// ---- P4 建会话 + 流式 ----
const createRes = await fetch(`${BASE}/session`, { method: 'POST', headers: H, body: JSON.stringify({ title: 'probe-p4' }) });
const session = await j(createRes);
save('C-session.json', session);
const sid = session?.id;
step('session.create.status', createRes.status);
step('session.id', sid);

if (!sid) { save('C-probe-summary.json', summary); console.log('NO SESSION, STOP'); process.exit(1); }

// 选一个支持 tool_call 的模型做主探针，另一个做对照
const pick = modelPick.find((m) => m.tool_call) || modelPick[0];
step('model.pick', pick);

// SSE
const ac = new AbortController();
const evtRes = await fetch(`${BASE}/event`, { headers: { ...H, Accept: 'text/event-stream' }, signal: ac.signal });
const reader = evtRes.body.getReader();
const dec = new TextDecoder();
let buf = '';
const events = [];
const t0 = Date.now();
async function readLoop() {
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data:')) {
          const raw = line.slice(5).trim();
          try { events.push(JSON.parse(raw)); } catch { events.push({ _raw: raw }); }
        }
      }
    }
    if (Date.now() - t0 > 120000) break;
  }
}
const loop = readLoop().catch((e) => console.log('sse end', e?.message));

await new Promise((r) => setTimeout(r, 1500));

const promptBody = {
  messageID: 'msgprobe1',
  model: { providerID: pick.providerID, modelID: pick.modelID },
  agent: 'build',
  parts: [{ type: 'text', text: '请用一句话回答：1+1等于几？' }],
};
const pRes = await fetch(`${BASE}/session/${sid}/prompt_async`, {
  method: 'POST', headers: H, body: JSON.stringify(promptBody),
});
step('prompt.status', pRes.status);
step('prompt.body', (await pRes.text()).slice(0, 200));

// 等事件，自动处理 permission（reply: once）
let permissionReplied = 0;
const seen = new Set();
const t1 = Date.now();
while (Date.now() - t1 < 90000) {
  await new Promise((r) => setTimeout(r, 500));
  for (const e of events) {
    const key = e?.id || JSON.stringify(e).slice(0, 80);
    if (e?.type === 'permission' && !seen.has(key)) {
      seen.add(key);
      const rid = e.id || e.requestID || e.requestId;
      console.log('PERMISSION EVENT', JSON.stringify(e).slice(0, 500));
      if (rid) {
        const rr = await fetch(`${BASE}/permission/${rid}/reply`, {
          method: 'POST', headers: H, body: JSON.stringify({ reply: 'once' }),
        });
        permissionReplied++;
        console.log('permission reply status', rr.status, (await rr.text()).slice(0, 100));
      }
    }
  }
  const types = events.map((e) => e?.type || '?');
  if (types.some((t) => ['finish', 'idle', 'session.idle', 'done', 'error'].includes(t))) break;
}
ac.abort();
await loop;
save('C-sse-1.json', events);
const typeCount = {};
for (const e of events) { const t = e?.type || '?'; typeCount[t] = (typeCount[t] || 0) + 1; }
step('sse.events', events.length);
step('sse.types', typeCount);
step('permission.replied', permissionReplied);

// 清理：abort + 记录
try {
  const ab = await fetch(`${BASE}/session/${sid}/abort`, { method: 'POST', headers: H });
  step('abort.status', ab.status);
} catch (e) { step('abort.err', e?.message); }

save('C-probe-summary.json', summary);
console.log('DONE');
