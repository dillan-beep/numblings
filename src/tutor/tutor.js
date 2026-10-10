// AI math helper: a Socratic tutor that guides a child through the current question
// without giving the answer away. Calls the Claude API directly from the browser
// (home-computer setup; the key is entered by a parent and stored only in this browser).
import Anthropic from '@anthropic-ai/sdk';

export const TUTOR_MODELS = [
  { id: 'claude-opus-5-5', name: 'Opus 5.5 (best explanations)' },
  { id: 'claude-sonnet-5-5', name: 'Sonnet 5.5 (fast)' },
  { id: 'claude-haiku-5-5', name: 'Haiku 5.5 (cheapest)' },
];
export const DEFAULT_TUTOR = { apiKey: '', model: 'claude-opus-5-5', enabled: true, voice: true };

let client = null, clientKey = null;
function getClient(apiKey) {
  if (!client || clientKey !== apiKey) {
    client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    clientKey = apiKey;
  }
  return client;
}

function systemPrompt({ kidName, age, grade, skillName, level }) {
  return `You are "Pip", a friendly math helper inside a pixel-art pet game. You are talking with ${kidName}, who is ${age} years old and in grade ${grade}. ${kidName} is working on a ${skillName} question (difficulty level ${level} of 10).

How to help:
- Never say the final answer, even if asked directly. If ${kidName} asks for it, cheerfully say you can't give it, then help with the very next small step.
- Ask one small guiding question at a time, or give one tiny hint. Think "what is the next thing ${kidName} needs to notice?"
- Use words a ${age}-year-old knows. Short sentences. At most 3 sentences per reply. Lots of warmth, zero lecturing.
- If ${kidName} tells you their idea or a wrong answer, find the part that is right, say so, then nudge the next step. Never say "wrong" or "no" bluntly; say things like "close!" or "let's check that part".
- Suggest concrete strategies kids use: count on fingers, make ten, use doubles, draw a picture, break the number apart, skip count, think of the fact family, use a number line.
- If ${kidName} says something off-topic or silly, reply in one short playful sentence and steer back to the math.
- You speak out loud through text-to-speech, so write plain text only: no markdown, no bullet points, no symbols like * or #. Write math in words or simple digits, like "7 plus 5".
- You know the correct answer (given below) only so you can guide well. Do not reveal it or make it obvious.`;
}

/**
 * Ask the tutor. Streams text through onText(chunkSoFar). Resolves with the final reply.
 * @param {object} p
 * @param {object} p.settings  { apiKey, model }
 * @param {object} p.kid       { name, age, grade }
 * @param {object} p.question  { prompt, answer, skillName, level, hint }
 * @param {Array}  p.history   [{role:'user'|'assistant', content}] previous turns this question
 * @param {string} p.message   the child's new message
 * @param {(text:string)=>void} p.onText
 */
export async function askTutor({ settings, kid, question, history, message, onText }) {
  if (!settings?.apiKey) throw new TutorError('No API key. A grown-up needs to add one in Parent Mode.');
  const c = getClient(settings.apiKey);
  const contextBlock = `The question on screen: "${question.prompt}"\nCorrect answer (secret, never reveal): ${question.answer}${question.hint ? `\nHint already shown on screen: ${question.hint}` : ''}`;
  // The first user turn carries the question context; later turns are the plain exchange.
  const turns = [...history, { role: 'user', content: message }];
  const messages = turns.map((h, i) => ({
    role: h.role,
    content: i === 0 ? `${contextBlock}\n\n${kid.name} says: ${h.content}` : h.content,
  }));

  let text = '';
  try {
    const stream = c.beta.messages.stream({
      model: settings.model || DEFAULT_TUTOR.model,
      max_tokens: 400,
      system: [{ type: 'text', text: systemPrompt({ kidName: kid.name, age: kid.age, grade: kid.grade, skillName: question.skillName, level: question.level }), cache_control: { type: 'ephemeral' } }],
      messages,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });
    stream.on('text', (delta) => { text += delta; onText?.(text); });
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') throw new TutorError("Pip can't help with that one. Try asking about the math!");
    if (!text.trim()) {
      const tb = final.content.find((b) => b.type === 'text');
      text = tb?.text || '';
    }
    return text.trim();
  } catch (err) {
    if (err instanceof TutorError) throw err;
    if (err instanceof Anthropic.AuthenticationError) throw new TutorError('The helper key is not working. Ask a grown-up to check it in Parent Mode.');
    if (err instanceof Anthropic.RateLimitError) throw new TutorError('Pip is a bit tired. Try again in a minute!');
    if (err instanceof Anthropic.APIConnectionError) throw new TutorError('Pip cannot reach the internet right now.');
    if (err instanceof Anthropic.APIError) throw new TutorError(`Pip had a hiccup (${err.status}). Try again!`);
    throw new TutorError('Pip had a hiccup. Try again!');
  }
}

export class TutorError extends Error {}

/* ---------- Speech ---------- */

export function speechSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/** Listen once. Resolves with the transcript, rejects on error/no speech. */
export function listen({ onInterim } = {}) {
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return reject(new Error('unsupported'));
    const rec = new SR();
    rec.lang = 'en-CA'; rec.interimResults = true; rec.maxAlternatives = 1; rec.continuous = false;
    let finalText = '';
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript; else interim += r[0].transcript;
      }
      onInterim?.(finalText || interim);
    };
    rec.onerror = (e) => reject(new Error(e.error || 'speech error'));
    rec.onend = () => (finalText.trim() ? resolve(finalText.trim()) : reject(new Error('no-speech')));
    rec.start();
    listen.current = rec;
  });
}
export function stopListening() { try { listen.current?.stop(); } catch { /* ignore */ } }

let voice = null;
function pickVoice() {
  if (voice) return voice;
  const vs = window.speechSynthesis?.getVoices?.() || [];
  const pref = ['Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Samantha', 'Microsoft Zira'];
  voice = vs.find((v) => pref.some((p) => v.name.includes(p))) || vs.find((v) => v.lang.startsWith('en')) || vs[0] || null;
  return voice;
}
export function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice(); if (v) u.voice = v;
  u.rate = 0.95; u.pitch = 1.15;
  window.speechSynthesis.speak(u);
}
export function stopSpeaking() { window.speechSynthesis?.cancel(); }
if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = () => { voice = null; pickVoice(); };
