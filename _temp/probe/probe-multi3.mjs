// 多轮对话探针 v3：每轮独立 SSE 连接
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:4196';
const AUTH = 'Basic ' + Buffer.from('probe:probe-pass-2026').toString('base64');
const H = { Authorization: AUTH, 'Content-Type': 'application/json' };
const RES = 'D:/DSH-HUAWEI-CodeArt2API/_temp/probe/results';
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };
const provider = await j(await fetch(`${BASE}/provider`, { headers: H }));
let pick = null;
for (const p of provider?.all || []) for (const [mid, m] of Object.entries(p.models || {})) { if (m?.capabilities?.toolcall) { pick = { providerID: p.id, modelID: mid }; break; } if (pick) break; }
const session = await j(await fetch(`${BASE}/session`, { method: 'POST', headers: H, body: JSON.stringify({ title: 'multiturn4' }) }));
const sid = session?.id;
console.log('session', sid);
await fetch(`${BASE}/config`, { method: 'PATCH', headers: H, body: JSON.stringify({ permission: {} }) });
console.log('patched');

async function round(msgID, text) {
  const ac = new AbortController();
  const evtRes = await fetch(`${BASE}/event`, { headers: { ...H, Accept: 'text/event-stream' }, signal: ac.signal });
  const reader = evtRes.body.getReader(); const dec = new TextDecoder(); let buf = ''; const events = [];
  const loop = (async () => { while (true) { const { done, value } = await reader.read(); if (done) break; buf += dec.decode(value, { stream: true }); let i; while ((i = buf.indexOf('\n\n')) >= 0) { const c = buf.slice(0, i); buf = buf.slice(i + 2); for (const l of c.split('\n')) if (l.startsWith('data:')) { const r = l.slice(5).trim(); try { events.push(JSON.parse(r)); } catch { events.push({ _raw: r }); } } } } })().catch(() => {});
  await new Promise((r) => setTimeout(r, 1500));
  await fetch(`${BASE}/session/${sid}/prompt_async`, { method: 'POST', headers: H, body: JSON.stringify({ messageID: msgID, model: pick, agent: 'build', parts: [{ type: 'text', text }] }) });
  const t0 = Date.now();
  while (Date.now() - t0 < 60000) { await new Promise((r) => setTimeout(r, 500)); if (events.some((e) => e?.type === 'session.idle')) break; }
  await new Promise((r) => setTimeout(r, 800));
  ac.abort(); await loop;
  const texts = events.filter((e) => e?.properties?.part?.type === 'text').map((e) => (e.properties.part.text || '').slice(0, 200));
  return { events: events.length, texts };
}

const r1 = await round('mr1', '请记住这个数字：42。只需回复"好的"。');
console.log('round1', JSON.stringify(r1));
const r2 = await round('mr2', '我刚才让你记的数字是多少？请直接回答数字。');
console.log('round2', JSON.stringify(r2));
fs.writeFileSync(`${RES}/C-multiturn.json`, JSON.stringify({ session: sid, r1, r2 }, null, 2));
console.log('DONE');
