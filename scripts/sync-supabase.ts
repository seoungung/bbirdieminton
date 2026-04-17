/**
 * Sync validated rackets from content/rackets/*.md to Supabase `rackets` table.
 * Usage:
 *   npx tsx scripts/sync-supabase.ts --slug <slug>
 *   npx tsx scripts/sync-supabase.ts --all
 *
 * If Supabase env vars are missing, exits 0 with a skip message (no error).
 */
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'
import { RacketFrontmatterSchema } from './types'

const ROOT = path.resolve(__dirname, '..')
const RACKETS_DIR = path.join(ROOT, 'content', 'rackets')
const ENV_FILE = path.join(ROOT, '.env.local')

function parseEnvLocal(): Record<string, string> {
  if (!fs.existsSync(ENV_FILE)) return {}
  const out: Record<string, string> = {}
  const raw = fs.readFileSync(ENV_FILE, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    // strip wrapping quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

function parseArgs() {
  const args = process.argv.slice(2)
  let slug: string | null = null
  let all = false
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug') slug = args[++i] ?? null
    else if (args[i] === '--all') all = true
  }
  return { slug, all }
}

function loadRacket(slug: string) {
  const file = path.join(RACKETS_DIR, `${slug}.md`)
  if (!fs.existsSync(file)) throw new Error(`Racket file not found: ${file}`)
  const raw = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  const parsed = RacketFrontmatterSchema.parse(data)
  return { parsed, body: content, file }
}

async function main() {
  const env = { ...process.env, ...parseEnvLocal() }
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.log('Supabase env not set (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY), skipping sync')
    process.exit(0)
  }

  const { slug, all } = parseArgs()
  if (!slug && !all) {
    console.error('Usage: sync-supabase.ts --slug <slug> | --all')
    process.exit(1)
  }

  const slugs: string[] = []
  if (all) {
    if (!fs.existsSync(RACKETS_DIR)) {
      console.log('No rackets dir, nothing to sync')
      process.exit(0)
    }
    for (const f of fs.readdirSync(RACKETS_DIR)) {
      if (f.endsWith('.md')) slugs.push(f.replace(/\.md$/, ''))
    }
  } else if (slug) {
    slugs.push(slug)
  }

  if (slugs.length === 0) {
    console.log('Nothing to sync')
    process.exit(0)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  let ok = 0
  let fail = 0

  for (const s of slugs) {
    try {
      const { parsed } = loadRacket(s)
      const row = {
        ...parsed,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from('rackets').upsert(row, { onConflict: 'slug' })
      if (error) {
        console.error(`[FAIL] ${s}: ${error.message}`)
        fail++
      } else {
        console.log(`[OK]   ${s}`)
        ok++
      }
    } catch (e) {
      console.error(`[FAIL] ${s}: ${(e as Error).message}`)
      fail++
    }
  }

  console.log(`\nDone. ok=${ok} fail=${fail}`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
