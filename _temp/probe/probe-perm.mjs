// 权限状态探针：node probe-perm.mjs '<permissionPatch>' '<prompt>' <reply:none|once> <label>
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:4196';
const AUTH = 'Basic ' + Buffer.from('probe:probe-pass-2026').toString('base64');
const H = { Authorization: AUTH, 'Content-Type': 'application/json' };
const RES = 'D:/DSH-HUAWEI-CodeArt2API/_temp/probe/results';
const permPatch = JSON.parse(process.argv[2] || '{}');
const prompt = process.argv[3] || '请使用 bash 工具执行命令 echo hi，并告诉我结果。';
const reply = process.argv[4] || 'none';
const label = process.argv[5] || 'x';
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };

// 1. patch permission
const patchRes = await fetch(`${BASE}/config`, { method: 'PATCH', headers: H, body: JSON.stringify({ permission: permPatch }) });
const cfg = await j(patchRes);
console.log('PATCH', patchRes.status, 'permission=', JSON.stringify(cfg?.permission));

// 2. pick toolcall model
const provider = await j(await fetch(`${BASE}/provider`, { headers: H }));
let pick = null;
for (const p of provider?.all || []) for (const [mid, m] of Object.entries(p.models || {})) {
  if (m?.capabilities?.toolcall) { pick = { providerID: p.id, modelID: mid }; break; }
  if (pick) break;
}

// 3. session
const session = await j(await fetch(`${BASE}/session`, { method: 'POST', headers: H, body: JSON.stringify({ title: 'perm-' + label }) }));
const sid = session?.id;
console.log('session', sid);

// 4. SSE
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
const pRes = await fetch(`${BASE}/session/${sid}/prompt_async`, {
  method: 'POST', headers: H,
  body: JSON.stringify({ messageID: 'msgperm_' + label, model: pick, agent: 'build', parts: [{ type: 'text', text: prompt }] }),
});
console.log('prompt', pRes.status);

let replied = 0; const seen = new Set();
const t0 = Date.now();
while (Date.now() - t0 < 90000) {
  await new Promise((r) => setTimeout(r, 400));
  for (const e of events) {
    const key = e?.properties?.id || JSON.stringify(e).slice(0, 80);
    if ((e?.type === 'permission.asked' || e?.type === 'question.asked') && !seen.has(key)) {
      seen.add(key);
      console.log('ASKED', e.type, JSON.stringify(e).slice(0, 600));
      if (reply !== 'none' && e?.properties?.id) {
        const url = e.type === 'permission.asked'
          ? `${BASE}/permission/${e.properties.id}/reply`
          : `${BASE}/question/${e.properties.id}/reply`;
        const body = e.type === 'permission.asked' ? { reply: 'once' } : { answers: [] };
        const rr = await fetch(url, { method: 'POST', headers: H, body: JSON.stringify(body) });
        replied++; console.log('reply', rr.status, (await rr.text()).slice(0, 100));
      }
    }
  }
  const types = events.map((e) => e?.type);
  if (types.includes('session.idle') || types.includes('session.error')) break;
}
ac.abort(); await loop;

const toolParts = events.filter((e) => e?.properties?.part?.type === 'tool');
const summary = {
  label, permPatch, prompt, reply, session: sid,
  eventTypes: events.reduce((a, e) => { const t = e?.type || '?'; a[t] = (a[t] || 0) + 1; return a; }, {}),
  asked: events.filter((e) => e?.type === 'permission.asked' || e?.type === 'question.asked'),
  toolParts: toolParts.map((e) => ({ tool: e.properties.part.tool, status: e.properties.part.state?.status, output: e.properties.part.state?.output, error: e.properties.part.state?.error })),
  errors: events.filter((e) => e?.type === 'session.error').map((e) => e.properties?.error),
  replied,
};
fs.writeFileSync(`${RES}/C-perm-${label}.json`, JSON.stringify({ summary, events }, null, 2));
console.log('SUMMARY', JSON.stringify(summary, null, 1));
try { await fetch(`${BASE}/session/${sid}/abort`, { method: 'POST', headers: H }); } catch {}
console.log('DONE');
