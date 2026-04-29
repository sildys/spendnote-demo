#!/usr/bin/env node
// Removes the .html suffix from internal links so they match the canonical
// (Cloudflare Pages serves clean URLs and 301-redirects /foo.html -> /foo).
//
// Targets:
//  - Root-level *.html files (the public site)
//  - supabase/email-templates/*.html (absolute spendnote.app links)
//
// Rules:
//   href="foo.html"            -> href="/foo"
//   href="foo.html#bar"        -> href="/foo#bar"
//   href="foo.html?x=1"        -> href="/foo?x=1"
//   href="index.html"          -> href="/"
//   href="index.html#features" -> href="/#features"
//   href="https://spendnote.app/foo.html..." -> https://spendnote.app/foo...
// Untouched: external (non spendnote.app) URLs, mailto:, tel:, #anchors,
//            and any href that does not end in .html (with optional query/hash).

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const targets = [];
for (const name of readdirSync(ROOT)) {
  if (name.endsWith('.html') && statSync(join(ROOT, name)).isFile()) {
    targets.push(join(ROOT, name));
  }
}
const emailDir = join(ROOT, 'supabase', 'email-templates');
try {
  for (const name of readdirSync(emailDir)) {
    if (name.endsWith('.html')) targets.push(join(emailDir, name));
  }
} catch {}

// Match href="..." where the value ends in .html (optionally followed by ? or #).
// We capture the "path" portion before .html, plus any query/hash suffix.
//   Group 1: path before .html (e.g. "spendnote-pricing", "./foo", "https://spendnote.app/foo")
//   Group 2: query/fragment incl. leading ? or # (or empty)
const RE = /href="([^"\s]+?)\.html((?:[?#][^"]*)?)"/g;

let totalReplacements = 0;
const changedFiles = [];

for (const file of targets) {
  const original = readFileSync(file, 'utf8');
  let count = 0;

  const updated = original.replace(RE, (full, path, suffix) => {
    // Skip non-spendnote external URLs.
    if (/^https?:\/\//i.test(path)) {
      if (!/^https?:\/\/spendnote\.app(\/|$)/i.test(path)) return full;
    }
    // Skip protocol-only weirdness (defensive).
    if (path.startsWith('mailto:') || path.startsWith('tel:')) return full;

    // Strip leading "./" for cleanliness.
    let p = path.replace(/^\.\//, '');

    // Special case: index page.
    // - "index"            -> "/"
    // - "https://spendnote.app/index" -> "https://spendnote.app/"
    if (p === 'index') {
      count++;
      return `href="/${suffix}"`;
    }
    if (/^https?:\/\/spendnote\.app\/index$/i.test(p)) {
      const origin = p.replace(/\/index$/i, '/');
      count++;
      return `href="${origin}${suffix}"`;
    }

    // Absolute spendnote.app URL: keep scheme+host, drop .html.
    if (/^https?:\/\//i.test(p)) {
      count++;
      return `href="${p}${suffix}"`;
    }

    // Relative root-level link: ensure leading slash for absolute path.
    // (Pages live at site root so "/foo" is unambiguous and avoids any
    // resolution surprise on URLs like /spendnote-pricing.)
    const absolute = p.startsWith('/') ? p : `/${p}`;
    count++;
    return `href="${absolute}${suffix}"`;
  });

  if (count > 0) {
    writeFileSync(file, updated);
    totalReplacements += count;
    changedFiles.push({ file: file.replace(ROOT + '\\', '').replace(ROOT + '/', ''), count });
  }
}

console.log(`Files changed: ${changedFiles.length}`);
console.log(`Total href rewrites: ${totalReplacements}`);
for (const { file, count } of changedFiles) {
  console.log(`  ${count.toString().padStart(4)}  ${file}`);
}
