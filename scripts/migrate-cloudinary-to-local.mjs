import { createClient } from '@supabase/supabase-js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isCloudinaryUrl, localCloudinaryUrl } from '../src/lib/upload-paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');
const publicDir = path.join(rootDir, 'public');
const dryRun = process.argv.includes('--dry-run');

function loadEnvFile(content) {
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function extractCloudinaryUrls(value) {
  if (typeof value !== 'string') return [];
  const matches = value.match(/https:\/\/res\.cloudinary\.com\/[^\s"'|),]+/gi) || [];
  return matches.filter(isCloudinaryUrl);
}

async function selectAll(supabase, table, columns) {
  const { data, error } = await supabase.from(table).select(columns);
  if (error) throw new Error(`${table}: ${error.message}`);
  return data || [];
}

async function downloadOnce(url, replacements) {
  if (replacements.has(url)) return replacements.get(url);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed ${response.status} ${response.statusText}: ${url}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const localUrl = localCloudinaryUrl(url, contentType);
  const diskPath = path.join(publicDir, ...localUrl.replace(/^\/+/, '').split('/'));

  if (!dryRun) {
    await mkdir(path.dirname(diskPath), { recursive: true });
    await writeFile(diskPath, Buffer.from(await response.arrayBuffer()));
  }

  replacements.set(url, localUrl);
  console.log(`${dryRun ? '[dry-run] ' : ''}${url} -> ${localUrl}`);
  return localUrl;
}

async function replaceUrlsInString(value, replacements) {
  let next = value;
  for (const url of extractCloudinaryUrls(value)) {
    const localUrl = await downloadOnce(url, replacements);
    next = next.split(url).join(localUrl);
  }
  return next;
}

async function updateScalarColumn(supabase, table, idColumn, urlColumn, replacements) {
  const rows = await selectAll(supabase, table, `${idColumn}, ${urlColumn}`);
  let changed = 0;

  for (const row of rows) {
    const value = row[urlColumn];
    if (!isCloudinaryUrl(value)) continue;
    const localUrl = await downloadOnce(value, replacements);
    changed += 1;

    if (!dryRun) {
      const { error } = await supabase.from(table).update({ [urlColumn]: localUrl }).eq(idColumn, row[idColumn]);
      if (error) throw new Error(`${table}.${urlColumn} update failed: ${error.message}`);
    }
  }

  return changed;
}

async function updateSiteSettings(supabase, replacements) {
  const rows = await selectAll(supabase, 'site_settings', 'key, value');
  let changed = 0;

  for (const row of rows) {
    const current = row.value || {};
    if (typeof current.v !== 'string') continue;
    const nextValue = await replaceUrlsInString(current.v, replacements);
    if (nextValue === current.v) continue;
    changed += 1;

    if (!dryRun) {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: { ...current, v: nextValue }, updated_at: new Date().toISOString() })
        .eq('key', row.key);
      if (error) throw new Error(`site_settings.${row.key} update failed: ${error.message}`);
    }
  }

  return changed;
}

async function main() {
  loadEnvFile(await readFile(envPath, 'utf8'));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const replacements = new Map();
  const counts = {};

  counts.product_images = await updateScalarColumn(supabase, 'product_images', 'id', 'image_url', replacements);
  counts.banners = await updateScalarColumn(supabase, 'banners', 'id', 'image_url', replacements);
  counts.suppliers = await updateScalarColumn(supabase, 'suppliers', 'id', 'avatar_url', replacements);
  counts.categories = await updateScalarColumn(supabase, 'categories', 'id', 'icon', replacements);
  counts.site_settings = await updateSiteSettings(supabase, replacements);

  console.log('Migration summary:', {
    mode: dryRun ? 'dry-run' : 'write',
    downloaded: replacements.size,
    updatedRows: counts,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
