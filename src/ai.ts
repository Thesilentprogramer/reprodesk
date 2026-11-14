import { createHash } from 'node:crypto';
import { required } from './chain.js';

export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

export async function reason(role: string, prompt: string): Promise<string> {
  const apiKey = required('NEAR_AI_API_KEY');
  const model = process.env.NEAR_AI_MODEL || 'deepseek-ai/DeepSeek-V3.1';
  const response = await fetch('https://cloud-api.near.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, temperature: 0, messages: [
      { role: 'system', content: `You are the ${role} in ProofBounty. Return only the requested value, with no explanation.` },
      { role: 'user', content: prompt },
    ] }),
  });
  if (!response.ok) throw new Error(`NEAR AI Cloud ${response.status}: ${await response.text()}`);
  const json = await response.json() as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('NEAR AI Cloud returned no answer');
  return content.replace(/^```(?:text)?\s*|\s*```$/g, '').trim();
}

export async function sourceValue(url: string, field: string): Promise<{ raw: string; value: string }> {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Source HTTP ${response.status}`);
  const raw = await response.text();
  const data = JSON.parse(raw) as Record<string, unknown>;
  const value = data[field];
  if (typeof value !== 'string' && typeof value !== 'number') throw new Error(`Source field ${field} is not scalar`);
  return { raw, value: String(value) };
}
