#!/usr/bin/env node
/**
 * @file scripts/translate.mjs
 * @description
 * CalcEmpire — Automated i18n Translation Pipeline using Gemini API
 *
 * Reads  : src/i18n/strings.json          (master English source)
 * Writes : src/messages/<locale>.json      (one file per target locale)
 *
 * Usage:
 *   npm run translate                      # uses GEMINI_API_KEY from .env.local
 *
 * Requirements:
 *   node >= 18  (native fetch)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

// ─────────────────────────────────────────────────────────────────────────────
// Paths
// ─────────────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STRINGS = path.join(ROOT, 'src', 'i18n', 'strings.json');
const MESSAGES = path.join(ROOT, 'src', 'messages');

// Load .env.local
config({ path: path.join(ROOT, '.env.local') });

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/** Human-readable locale names for translation prompts. */
const LOCALE_NAMES = {
  tr: 'Turkish',
  ru: 'Russian',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  pt: 'Portuguese (Brazil)',
  zh: 'Simplified Chinese',
  ar: 'Arabic',
  ko: 'Korean',
  hi: 'Hindi',
  ja: 'Japanese',
  it: 'Italian',
  nl: 'Dutch',
  pl: 'Polish',
  id: 'Indonesian',
};

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  // ── Validate prerequisites ─────────────────────────────────────────────────

  if (!GEMINI_API_KEY) {
    console.error('\n❌  GEMINI_API_KEY is not set.');
    console.error('    Create a .env.local file with your Gemini API key:\n');
    console.error('    GEMINI_API_KEY=your-api-key-here\n');
    process.exit(1);
  }

  if (!fs.existsSync(STRINGS)) {
    console.error(`\n❌  Master strings file not found: ${STRINGS}\n`);
    process.exit(1);
  }

  // ── Load master source ─────────────────────────────────────────────────────

  const master = JSON.parse(fs.readFileSync(STRINGS, 'utf8'));
  const { _meta } = master;
  const locales = _meta?.targetLocales ?? Object.keys(LOCALE_NAMES);

  // Remove _meta before translating — not part of the UI strings
  const stringsOnly = Object.fromEntries(Object.entries(master).filter(([k]) => k !== '_meta'));

  // Write English source directly (no API call needed)
  const enPath = path.join(MESSAGES, 'en.json');
  fs.writeFileSync(enPath, JSON.stringify(stringsOnly, null, 2) + '\n', 'utf8');
  console.log(`✅  en  →  ${path.relative(ROOT, enPath)}`);

  // ── Translate each locale using Gemini API ────────────────────────────────

  let failed = 0;

  for (const locale of locales) {
    const localeName = LOCALE_NAMES[locale] ?? locale;
    process.stdout.write(`🔄  ${locale.padEnd(4)}  Translating to ${localeName}…`);

    try {
      const translated = await translateStrings(stringsOnly, locale, localeName);
      const outPath = path.join(MESSAGES, `${locale}.json`);
      fs.writeFileSync(outPath, JSON.stringify(translated, null, 2) + '\n', 'utf8');
      process.stdout.write(`\r✅  ${locale.padEnd(4)}  ${path.relative(ROOT, outPath)}\n`);

      // Add delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      process.stdout.write(`\r❌  ${locale.padEnd(4)}  FAILED: ${err.message}\n`);
      failed++;
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  const total = locales.length + 1; // +1 for English
  console.log('');
  console.log(`📦  Done. ${total - failed}/${total} locale files written to src/messages/`);
  if (failed > 0) {
    console.log(`⚠️   ${failed} locale(s) failed. Re-run to retry only failed locales.`);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemini Translation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends the flat string object to the Gemini API and returns the
 * translated JSON object.
 *
 * @param {object} strings  - The English string object (nested, no _meta)
 * @param {string} locale   - BCP-47 locale code
 * @param {string} name     - Human-readable language name for the prompt
 * @returns {Promise<object>} Translated strings object
 */
async function translateStrings(strings, locale, name) {
  const systemPrompt = `\
You are a professional software localization engineer.
Your task is to translate JSON string values from English into ${name} (${locale}).

Rules you MUST follow without exception:
1. Return ONLY a valid JSON object — no markdown, no code fences, no commentary.
2. Preserve EVERY key name exactly as given. Do NOT rename, add, or remove keys.
3. Keep technical terms and formulas EXACTLY as-is:
   - Mathematical formulas: "V = I × R", "P = V × I", etc.
   - Placeholder hints like "e.g. 12" should be adapted to the locale's convention
     (e.g. use a locale-appropriate example label like "ex. 12" or "Ex : 12"), but
     keep the numeric value unchanged.
4. Keep brand names unchanged: "CalcEmpire".
5. Use formal/neutral register — this is a professional engineering tool.
6. For RTL languages (Arabic), keep the JSON LTR; the app handles rendering direction.
7. Return the COMPLETE object including ALL keys, translated.`;

  const userPrompt = JSON.stringify(strings, null, 2);

  // Retry logic for rate limiting
  const maxRetries = 3;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nTranslate this JSON:\n${userPrompt}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const body = await response.text();
        lastError = new Error(`Gemini API ${response.status}: ${body.slice(0, 200)}`);

        // If rate limited, retry
        if (response.status === 429) {
          continue;
        }
        throw lastError;
      }

      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) throw new Error('Empty response from Gemini API');

      try {
        // Extract JSON from response (remove markdown code fences if present)
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```|([\s\S]*)/);
        const jsonStr = jsonMatch?.[1] || jsonMatch?.[2] || content;
        return JSON.parse(jsonStr.trim());
      } catch {
        throw new Error(`Model returned invalid JSON: ${content.slice(0, 200)}`);
      }
    } catch (err) {
      lastError = err;
      if (err.message.includes('429')) {
        continue; // Retry on rate limit
      }
      throw err; // Don't retry on other errors
    }
  }

  throw lastError;
}

// ─────────────────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error('\n💥  Unexpected error:', err);
  process.exit(1);
});
