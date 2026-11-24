// 多会话并发探针：3 个会话同时对话，验证事件隔离
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:4196';
const AUTH = 'Basic ' + Buffer.from('probe:probe-pass-2026').toString('base64');
const H = { Authorization: AUTH, 'Content-Type': 'application/json' };
const RES = 'D:/DSH-HUAWEI-CodeArt2API/_temp/probe/results';
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };

const provider = await j(await fetch(`${BASE}/provider`, { headers: H }));
let pick = null;
for (const p of provider?.all || []) for (const [mid, m] of Object.entries(p.models || {})) {
  if (m?.capabilities?.toolcall) { pick = { providerID: p.id, modelID: mid }; break; }
  if (pick) break;
}

const words = ['苹果', '香蕉', '橙子'];
const sessions = [];
for (let i = 0; i < 3; i++) {
  const s = await j(await fetch(`${BASE}/session`, { method: 'POST', headers: H, body: JSON.stringify({ title: 'conc-' + i }) }));
  sessions.push(s.id);
}
console.log('sessions', sessions);

// 一个全局 SSE
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
})().catch(() => {});

await new Promise((r) => setTimeout(r, 1200));

// 同时发 3 个 prompt
await Promise.all(sessions.map((sid, i) =>
  fetch(`${BASE}/session/${sid}/prompt_async`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ messageID: 'msgconc' + i, model: pick, agent: 'build', parts: [{ type: 'text', text: `请只回复这个词：${words[i]}` }] }),
  })
));
console.log('prompts sent');

// 收集直到 3 个会话都 idle
const t0 = Date.now();
while (Date.now() - t0 < 120000) {
  await new Promise((r) => setTimeout(r, 600));
  const idles = new Set(events.filter((e) => e?.type === 'session.idle').map((e) => e.properties?.sessionID));
  if (sessions.every((s) => idles.has(s))) break;
}
ac.abort(); await loop;

// 按会话分组
const bySession = {};
for (const sid of sessions) {
  const evs = events.filter((e) => e?.properties?.sessionID === sid);
  const texts = evs.filter((e) => e?.properties?.part?.type === 'text' && e.properties.part.role === 'assistant')
    .map((e) => e.properties.part.text).join('');
  const models = evs.filter((e) => e?.properties?.info?.role === 'assistant').map((e) => e.properties.info.modelID);
  bySession[sid] = { eventCount: evs.length, types: [...new Set(evs.map((e) => e.type))], texts, models };
}
fs.writeFileSync(`${RES}/C-concurrent.json`, JSON.stringify({ sessions, words, bySession }, null, 2));
console.log(JSON.stringify(bySession, null, 1));
console.log('DONE');
