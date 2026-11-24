// variants 探针：node probe-variant.mjs <low|high|max>
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:4196';
const AUTH = 'Basic ' + Buffer.from('probe:probe-pass-2026').toString('base64');
const H = { Authorization: AUTH, 'Content-Type': 'application/json' };
const RES = 'D:/DSH-HUAWEI-CodeArt2API/_temp/probe/results';
const variant = process.argv[2] || 'low';
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };

const provider = await j(await fetch(`${BASE}/provider`, { headers: H }));
let pick = null;
for (const p of provider?.all || []) for (const [mid, m] of Object.entries(p.models || {})) {
  if (m?.capabilities?.toolcall) { pick = { providerID: p.id, modelID: mid }; break; }
  if (pick) break;
}
const session = await j(await fetch(`${BASE}/session`, { method: 'POST', headers: H, body: JSON.stringify({ title: 'variant-' + variant }) }));
const sid = session?.id;

const ac = new AbortController();
const evtRes = await fetch(`${BASE}/event`, { headers: { ...H, Accept: 'text/event-stream' }, signal: ac.signal });
const reader = evtRes.body.getReader(); const dec = new TextDecoder(); let buf = ''; const events = [];
const loop = (async () => { while (true) { const { done, value } = await reader.read(); if (done) break; buf += dec.decode(value, { stream: true }); let i; while ((i = buf.indexOf('\n\n')) >= 0) { const c = buf.slice(0, i); buf = buf.slice(i + 2); for (const l of c.split('\n')) if (l.startsWith('data:')) { const r = l.slice(5).trim(); try { events.push(JSON.parse(r)); } catch { events.push({ _raw: r }); } } } } })().catch(() => {});
await new Promise((r) => setTimeout(r, 1200));
const body = { messageID: 'msgvar' + variant, model: pick, agent: 'build', variant, parts: [{ type: 'text', text: '笼子里有鸡和兔，共 35 个头、94 只脚。问鸡和兔各几只？请仔细推理后回答。' }] };
const pr = await fetch(`${BASE}/session/${sid}/prompt_async`, { method: 'POST', headers: H, body: JSON.stringify(body) });
console.log('prompt', pr.status, 'variant=', variant);
const t0 = Date.now();
while (Date.now() - t0 < 120000) { await new Promise((r) => setTimeout(r, 500)); if (events.some((e) => e?.type === 'session.idle')) break; }
ac.abort(); await loop;

const reason = events.filter((e) => e?.properties?.part?.type === 'reasoning').map((e) => e.properties.part.reasoning || '').join('');
const text = events.filter((e) => e?.properties?.part?.type === 'text' && e.properties.part.role !== 'user').map((e) => e.properties.part.text).join('');
const info = events.filter((e) => e?.properties?.info?.role === 'assistant').map((e) => e.properties.info);
const last = info[info.length - 1] || {};
const out = { variant, session: sid, reasoningChars: reason.length, outputTokens: last.tokens?.output, reasoningTokens: last.tokens?.reasoning, text: text.slice(0, 200) };
fs.writeFileSync(`${RES}/C-variant-${variant}.json`, JSON.stringify({ out, events }, null, 2));
console.log(JSON.stringify(out, null, 1));
console.log('DONE');
