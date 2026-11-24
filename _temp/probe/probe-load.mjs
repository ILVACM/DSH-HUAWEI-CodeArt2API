// 限流/并发压力探针：8 会话同时发消息
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:4196';
const AUTH = 'Basic ' + Buffer.from('probe:probe-pass-2026').toString('base64');
const H = { Authorization: AUTH, 'Content-Type': 'application/json' };
const RES = 'D:/DSH-HUAWEI-CodeArt2API/_temp/probe/results';
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };
const provider = await j(await fetch(`${BASE}/provider`, { headers: H }));
let pick = null;
for (const p of provider?.all || []) for (const [mid, m] of Object.entries(p.models || {})) { if (m?.capabilities?.toolcall) { pick = { providerID: p.id, modelID: mid }; break; } if (pick) break; }
const N = 8;
const sessions = [];
for (let i = 0; i < N; i++) { const s = await j(await fetch(`${BASE}/session`, { method: 'POST', headers: H, body: JSON.stringify({ title: 'load-' + i }) })); sessions.push(s.id); }
console.log('sessions', sessions.length);
const ac = new AbortController();
const evtRes = await fetch(`${BASE}/event`, { headers: { ...H, Accept: 'text/event-stream' }, signal: ac.signal });
const reader = evtRes.body.getReader(); const dec = new TextDecoder(); let buf = ''; const events = [];
const loop = (async () => { while (true) { const { done, value } = await reader.read(); if (done) break; buf += dec.decode(value, { stream: true }); let i; while ((i = buf.indexOf('\n\n')) >= 0) { const c = buf.slice(0, i); buf = buf.slice(i + 2); for (const l of c.split('\n')) if (l.startsWith('data:')) { const r = l.slice(5).trim(); try { events.push(JSON.parse(r)); } catch { events.push({ _raw: r }); } } } } })().catch(() => {});
await new Promise((r) => setTimeout(r, 1500));
const t0 = Date.now();
const results = await Promise.all(sessions.map((sid, i) => fetch(`${BASE}/session/${sid}/prompt_async`, { method: 'POST', headers: H, body: JSON.stringify({ messageID: 'msgload' + i, model: pick, agent: 'build', parts: [{ type: 'text', text: `请只回复数字 ${i + 1}。` }] }) }).then((r) => r.status)));
console.log('prompt statuses', results, 'elapsed', Date.now() - t0, 'ms');
const t1 = Date.now();
while (Date.now() - t1 < 90000) { await new Promise((r) => setTimeout(r, 700)); if (events.filter((e) => e?.type === 'session.idle').length >= N) break; }
ac.abort(); await loop;
const tc = {}; for (const e of events) { const t = e?.type || '?'; tc[t] = (tc[t] || 0) + 1; }
const errs = events.filter((e) => e?.type === 'session.error').map((e) => e.properties?.error?.name + ':' + (e.properties?.error?.data?.message || '').slice(0, 80));
const out = { sessions, promptStatuses: results, eventTypes: tc, errors: errs };
fs.writeFileSync(`${RES}/C-load.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
console.log('DONE');
