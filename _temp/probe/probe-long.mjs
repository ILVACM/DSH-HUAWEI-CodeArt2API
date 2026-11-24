// 超长输入 + 多轮对话探针
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:4196';
const AUTH = 'Basic ' + Buffer.from('probe:probe-pass-2026').toString('base64');
const H = { Authorization: AUTH, 'Content-Type': 'application/json' };
const RES = 'D:/DSH-HUAWEI-CodeArt2API/_temp/probe/results';
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };
const provider = await j(await fetch(`${BASE}/provider`, { headers: H }));
let pick = null;
for (const p of provider?.all || []) for (const [mid, m] of Object.entries(p.models || {})) { if (m?.capabilities?.toolcall) { pick = { providerID: p.id, modelID: mid }; break; } if (pick) break; }

async function run(label, parts, note) {
  const session = await j(await fetch(`${BASE}/session`, { method: 'POST', headers: H, body: JSON.stringify({ title: label }) }));
  const sid = session?.id;
  const ac = new AbortController();
  const evtRes = await fetch(`${BASE}/event`, { headers: { ...H, Accept: 'text/event-stream' }, signal: ac.signal });
  const reader = evtRes.body.getReader(); const dec = new TextDecoder(); let buf = ''; const events = [];
  const loop = (async () => { while (true) { const { done, value } = await reader.read(); if (done) break; buf += dec.decode(value, { stream: true }); let i; while ((i = buf.indexOf('\n\n')) >= 0) { const c = buf.slice(0, i); buf = buf.slice(i + 2); for (const l of c.split('\n')) if (l.startsWith('data:')) { const r = l.slice(5).trim(); try { events.push(JSON.parse(r)); } catch { events.push({ _raw: r }); } } } } })().catch(() => {});
  await new Promise((r) => setTimeout(r, 1000));
  const pr = await fetch(`${BASE}/session/${sid}/prompt_async`, { method: 'POST', headers: H, body: JSON.stringify({ messageID: 'msg_' + label, model: pick, agent: 'build', parts }) });
  const t0 = Date.now();
  while (Date.now() - t0 < 90000) { await new Promise((r) => setTimeout(r, 500)); if (events.some((e) => e?.type === 'session.idle' || e?.type === 'session.error')) break; }
  ac.abort(); await loop;
  const err = events.filter((e) => e?.type === 'session.error').map((e) => e.properties?.error?.data?.message || e.properties?.error?.name);
  const info = events.filter((e) => e?.properties?.info?.role === 'assistant').map((e) => e.properties.info).pop();
  const out = { label, note, session: sid, promptStatus: pr.status, errors: err, outputTokens: info?.tokens?.output, contextTokens: info?.tokens?.context, finish: info?.finish };
  console.log(JSON.stringify(out));
  return out;
}

const long = '以下是重复文本，用于测试长度：' + ('人工智能的发展源远流长。'.repeat(4000)); // ~100KB
const r1 = await run('long-input', [{ type: 'text', text: long + '\n请用一句话总结上面文本的主题。' }], '约100KB输入');
fs.writeFileSync(`${RES}/C-long-input.json`, JSON.stringify(r1, null, 2));

// 多轮：同一会话连续两条
const session = await j(await fetch(`${BASE}/session`, { method: 'POST', headers: H, body: JSON.stringify({ title: 'multiturn' }) }));
const sid = session?.id;
const ac = new AbortController();
const evtRes = await fetch(`${BASE}/event`, { headers: { ...H, Accept: 'text/event-stream' }, signal: ac.signal });
const reader = evtRes.body.getReader(); const dec = new TextDecoder(); let buf = ''; const events = [];
const loop = (async () => { while (true) { const { done, value } = await reader.read(); if (done) break; buf += dec.decode(value, { stream: true }); let i; while ((i = buf.indexOf('\n\n')) >= 0) { const c = buf.slice(0, i); buf = buf.slice(i + 2); for (const l of c.split('\n')) if (l.startsWith('data:')) { const r = l.slice(5).trim(); try { events.push(JSON.parse(r)); } catch { events.push({ _raw: r }); } } } } })().catch(() => {});
await new Promise((r) => setTimeout(r, 1000));
await fetch(`${BASE}/session/${sid}/prompt_async`, { method: 'POST', headers: H, body: JSON.stringify({ messageID: 'm1', model: pick, agent: 'build', parts: [{ type: 'text', text: '请记住这个数字：42。只需回复"好的"。' }] }) });
await new Promise((r) => setTimeout(r, 8000));
await fetch(`${BASE}/session/${sid}/prompt_async`, { method: 'POST', headers: H, body: JSON.stringify({ messageID: 'm2', model: pick, agent: 'build', parts: [{ type: 'text', text: '我刚才让你记的数字是多少？' }] }) });
const t0 = Date.now();
while (Date.now() - t0 < 60000) { await new Promise((r) => setTimeout(r, 500)); const n = events.filter((e) => e?.type === 'session.idle').length; if (n >= 2) break; }
ac.abort(); await loop;
const texts = events.filter((e) => e?.properties?.part?.type === 'text').map((e) => ({ role: e.properties.part.role || e.properties.info?.role || '?', text: (e.properties.part.text || '').slice(0, 150) }));
const multi = { session: sid, textParts: texts };
fs.writeFileSync(`${RES}/C-multiturn.json`, JSON.stringify(multi, null, 2));
fs.writeFileSync(`${RES}/C-multiturn-events.json`, JSON.stringify(events, null, 2));
console.log('MULTI', JSON.stringify(multi, null, 1));
console.log('DONE');
