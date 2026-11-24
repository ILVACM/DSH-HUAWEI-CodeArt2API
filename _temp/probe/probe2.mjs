// P5 探针：触发工具调用 + 权限请求
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:4196';
const AUTH = 'Basic ' + Buffer.from('probe:probe-pass-2026').toString('base64');
const H = { Authorization: AUTH, 'Content-Type': 'application/json' };
const RES = 'D:/DSH-HUAWEI-CodeArt2API/_temp/probe/results';
const save = (n, d) => fs.writeFileSync(path.join(RES, n), typeof d === 'string' ? d : JSON.stringify(d, null, 2));
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };

// 取一个 toolcall 模型
const provider = await j(await fetch(`${BASE}/provider`, { headers: H }));
const all = provider?.all || [];
let pick = null;
for (const p of all) for (const [mid, m] of Object.entries(p.models || {})) {
  if (m?.capabilities?.toolcall) { pick = { providerID: p.id, modelID: mid, name: m.name }; break; }
  if (pick) break;
}
console.log('pick', pick);

const session = await j(await fetch(`${BASE}/session`, { method: 'POST', headers: H, body: JSON.stringify({ title: 'probe-p5' }) }));
const sid = session?.id;
console.log('session', sid);

const ac = new AbortController();
const evtRes = await fetch(`${BASE}/event`, { headers: { ...H, Accept: 'text/event-stream' }, signal: ac.signal });
const reader = evtRes.body.getReader();
const dec = new TextDecoder();
let buf = ''; const events = [];
const loop = (async () => {
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
      for (const line of chunk.split('\n')) if (line.startsWith('data:')) {
        const raw = line.slice(5).trim();
        try { events.push(JSON.parse(raw)); } catch { events.push({ _raw: raw }); }
      }
    }
  }
})().catch((e) => console.log('sse end', e?.message));

await new Promise((r) => setTimeout(r, 1500));
const promptBody = {
  messageID: 'msgprobe2',
  model: { providerID: pick.providerID, modelID: pick.modelID },
  agent: 'build',
  parts: [{ type: 'text', text: '请使用 bash 工具执行命令 echo hello-probe，然后告诉我输出结果。' }],
};
const pRes = await fetch(`${BASE}/session/${sid}/prompt_async`, { method: 'POST', headers: H, body: JSON.stringify(promptBody) });
console.log('prompt status', pRes.status);

let replied = 0; const seen = new Set();
const t0 = Date.now();
while (Date.now() - t0 < 90000) {
  await new Promise((r) => setTimeout(r, 500));
  for (const e of events) {
    const key = e?.id || JSON.stringify(e).slice(0, 80);
    if (e?.type === 'permission.asked' && !seen.has(key)) {
      seen.add(key);
      console.log('PERMISSION', JSON.stringify(e).slice(0, 800));
      const rid = e.properties?.id;
      if (rid) {
        const rr = await fetch(`${BASE}/permission/${rid}/reply`, { method: 'POST', headers: H, body: JSON.stringify({ reply: 'once' }) });
        replied++;
        console.log('reply status', rr.status, (await rr.text()).slice(0, 120));
      }
    }
  }
  const types = events.map((e) => e?.type);
  if (types.includes('session.idle') || types.includes('finish')) break;
}
ac.abort(); await loop;
save('C-sse-2.json', events);
const toolParts = events.filter((e) => e?.properties?.part?.type === 'tool');
const perm = events.filter((e) => e?.type === 'permission.asked' || e?.type === 'permission.replied');
const typeCount = {};
for (const e of events) { const t = e?.type || '?'; typeCount[t] = (typeCount[t] || 0) + 1; }
console.log('event types', JSON.stringify(typeCount));
console.log('tool parts', toolParts.length, 'permission events', perm.length, 'replied', replied);
save('C-tool-events.json', { toolParts, perm, typeCount });
try { const ab = await fetch(`${BASE}/session/${sid}/abort`, { method: 'POST', headers: H }); console.log('abort', ab.status); } catch {}
console.log('DONE');
