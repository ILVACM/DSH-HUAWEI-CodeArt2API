// 华为云 APIG 签名调用探针（用解密后的 STS 临时凭据，仅验证签名格式）
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const dpapi = require('C:/Users/hbk/.codeartsdoer/installers/bin/prebuilds/win32-x64/@primno+dpapi.node');
function decrypt(b64) {
  const o = dpapi.unprotectData(Buffer.from(b64, 'base64'), null, 'CURRENT_USER');
  return Buffer.isBuffer(o) ? o.toString('utf8') : String(o);
}
const auth = JSON.parse(fs.readFileSync(process.env.USERPROFILE + '/.codeartsdoer/cli-data/auth.json', 'utf8'));
const sts = JSON.parse(decrypt(auth['inferhub-provider'].access));
console.log('sts keys:', Object.keys(sts), 'expired:', new Date(sts.expiration).toISOString());

const AK = sts.access_key_id, SK = sts.secret_access_key, ST = sts.security_token;
const host = 'snap-access.cn-north-4.myhuaweicloud.com';
const uri = '/api/v2/chat/completions';
const body = JSON.stringify({ model: 'deepseek-v4.1-flash-1017', messages: [{ role: 'user', content: 'hi' }], max_tokens: 8 });
const date = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); // yyyyMMddTHHmmssZ

const canonicalHeaders = `host:${host}\nx-sdk-date:${date}\n`;
const signedHeaders = 'host;x-sdk-date';
const payloadHash = crypto.createHash('sha256').update(body).digest('hex');
const canonicalRequest = ['POST', uri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
const stringToSign = 'SDK-HMAC-SHA256\n' + date + '\n' + crypto.createHash('sha256').update(canonicalRequest).digest('hex');
const signature = crypto.createHmac('sha256', SK).update(stringToSign).digest('hex');

const headers = {
  'Authorization': `SDK-HMAC-SHA256 Access=${AK}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  'X-Sdk-Date': date,
  'Host': host,
  'Content-Type': 'application/json',
};
if (ST) headers['X-Security-Token'] = ST;

console.log('--- signed request ---');
const res = await fetch(`https://${host}${uri}`, { method: 'POST', headers, body });
const text = await res.text();
console.log('HTTP', res.status);
console.log(text.slice(0, 600));
fs.writeFileSync('D:/DSH-HUAWEI-CodeArt2API/_temp/probe/results/C-sign-probe.json', JSON.stringify({ status: res.status, body: text.slice(0, 600), expired: sts.expiration }, null, 2));
