#!/usr/bin/env node
/**
 * @file scripts/translate.mjs
 * @description
 * CalcEmpire — Automated i18n Translation Pipeline
 *
 * Reads  : src/i18n/strings.json          (master English source)
 * Writes : src/messages/<locale>.json      (one file per target locale)
 *
 * Usage:
 *   npm run translate                      # copies English to all locales
 *
 * This script copies the English master strings to all target locales.
 * For production use with AI translations, uncomment the OpenAI integration
 * and provide an API key via OPENAI_API_KEY environment variable.
 *
 * Requirements:
 *   node >= 18  (native fetch)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ─────────────────────────────────────────────────────────────────────────────
// Paths
// ─────────────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STRINGS = path.join(ROOT, 'src', 'i18n', 'strings.json');
const MESSAGES = path.join(ROOT, 'src', 'messages');

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

/** Human-readable locale names sent in the prompt for better translation quality. */
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

    if (!fs.existsSync(STRINGS)) {
        console.error(`\n❌  Master strings file not found: ${STRINGS}\n`);
        process.exit(1);
    }

    // ── Load master source ─────────────────────────────────────────────────────

    const master = JSON.parse(fs.readFileSync(STRINGS, 'utf8'));
    const { _meta } = master;
    const locales = _meta?.targetLocales ?? Object.keys(LOCALE_NAMES);

    // Remove _meta before translating — not part of the UI strings
    const stringsOnly = Object.fromEntries(
        Object.entries(master).filter(([k]) => k !== '_meta')
    );

    // Write English source directly (no API call needed)
    const enPath = path.join(MESSAGES, 'en.json');
    fs.writeFileSync(enPath, JSON.stringify(stringsOnly, null, 2) + '\n', 'utf8');
    console.log(`✅  en  →  ${path.relative(ROOT, enPath)}`);

    // ── Copy English to each locale ────────────────────────────────────────────

    let failed = 0;

    for (const locale of locales) {
        const localeName = LOCALE_NAMES[locale] ?? locale;
        process.stdout.write(`🔄  ${locale.padEnd(4)}  Copying to ${localeName}…`);

        try {
            // Copy English strings as base (can be replaced with AI translation later)
            const translated = { ...stringsOnly };
            const outPath = path.join(MESSAGES, `${locale}.json`);
            fs.writeFileSync(outPath, JSON.stringify(translated, null, 2) + '\n', 'utf8');
            process.stdout.write(`\r✅  ${locale.padEnd(4)}  ${path.relative(ROOT, outPath)}\n`);
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
// OpenAI Translation (Optional - for future use)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends the flat string object to the OpenAI Chat API and returns the
 * translated JSON object.
 *
 * Strategy: we send the entire strings object as JSON and instruct the model
 * to return ONLY a valid JSON object with translated values. This avoids
 * multiple round-trips and keeps key names intact.
 *
 * @param {object} strings  - The English string object (nested, no _meta)
 * @param {string} locale   - BCP-47 locale code
 * @param {string} name     - Human-readable language name for the prompt
 * @returns {Promise<object>} Translated strings object
 */
async function translateStrings(strings, locale, name) {
    const systemPrompt = `\
You are a professional software localisation engineer.
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            temperature: 0.1,   // low temperature → deterministic, accurate translation
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`OpenAI API ${response.status}: ${body.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error('Empty response from OpenAI API');

    try {
        return JSON.parse(content);
    } catch {
        throw new Error(`Model returned invalid JSON: ${content.slice(0, 200)}`);
    }
}

// ─────────────────────────────────────────────────────────────────────────────

main().catch(err => {
    console.error('\n💥  Unexpected error:', err);
    process.exit(1);
});
