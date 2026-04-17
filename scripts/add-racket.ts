/**
 * Orchestrates the end-to-end "add racket" pipeline.
 *
 * MVP strategy: this script does NOT call Anthropic API directly.
 * Instead it prints researcher/writer prompts to stdout so the user can paste them
 * into Claude Code chat, letting the registered sub-agents do the work.
 *
 * Usage:
 *   npm run racket:add -- "요넥스 나노플레어 001"
 *   npm run racket:add -- "요넥스 나노플레어 001" --resume   # skip research, run writer
 *   npm run racket:add -- "요넥스 나노플레어 001" --publish  # drafts -> rackets + sync
 *   npm run racket:add -- "요넥스 나노플레어 001" --force    # overwrite existing
 *   npm run racket:add -- --slug yonex-nanoflare-001 ...
 */
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import slugifyLib from 'slugify'
import { BRAND_VALUES } from './types'

const ROOT = path.resolve(__dirname, '..')
const RESEARCH_DIR = path.join(ROOT, 'content', 'research')
const DRAFTS_DIR = path.join(ROOT, 'content', 'drafts')
const RACKETS_DIR = path.join(ROOT, 'content', 'rackets')

// Korean brand aliases -> enum
const BRAND_ALIASES: Record<string, string> = {
  '요넥스': 'YONEX',
  '빅터': 'VICTOR',
  '빅토': 'VICTOR',
  '리닝': 'LI-NING',
  '미즈노': 'MIZUNO',
  '가와사키': 'KAWASAKI',
  '플릿': 'FLEET',
  'rsl': 'RSL',
  '아펙스': 'APEX',
  '맥스볼트': 'MAXBOLT',
  '펄스': 'PULSE',
  '트라이코어': 'TRICORE',
  '라이더': 'RIDER',
  '아팍스': 'APACS',
  '레드슨': 'REDSON',
  '주봉': 'JOOBONG',
  '트리온': 'TRION',
  '테크니스트': 'TECHNIST',
}

interface Args {
  input: string | null
  explicitSlug: string | null
  resume: boolean
  publish: boolean
  force: boolean
}

function parseArgs(): Args {
  const argv = process.argv.slice(2)
  const out: Args = { input: null, explicitSlug: null, resume: false, publish: false, force: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--slug') out.explicitSlug = argv[++i] ?? null
    else if (a === '--resume') out.resume = true
    else if (a === '--publish') out.publish = true
    else if (a === '--force') out.force = true
    else if (a.startsWith('--')) continue
    else if (!out.input) out.input = a
  }
  return out
}

function detectBrand(text: string): { brand: string | null; rest: string } {
  const lower = text.toLowerCase()
  // Check ko aliases first
  for (const [ko, en] of Object.entries(BRAND_ALIASES)) {
    if (text.includes(ko)) return { brand: en, rest: text.replace(ko, '').trim() }
    if (lower.includes(ko.toLowerCase())) return { brand: en, rest: text.replace(new RegExp(ko, 'i'), '').trim() }
  }
  // Check enum directly
  for (const b of BRAND_VALUES) {
    if (lower.includes(b.toLowerCase())) {
      return { brand: b, rest: text.replace(new RegExp(b, 'i'), '').trim() }
    }
  }
  return { brand: null, rest: text.trim() }
}

// Korean-aware model-name normalization
const KO_MODEL_MAP: Record<string, string> = {
  '나노플레어': 'nanoflare',
  '아스트록스': 'astrox',
  '아크세이버': 'arcsaber',
  '듀오라': 'duora',
  '볼트릭': 'voltric',
  '머스클파워': 'muscle-power',
  '나노스피드': 'nanospeed',
  '오러스피드': 'auraspeed',
  '스러스터': 'thruster',
  '재플린': 'jetspeed',
}

function koreanToLatin(s: string): string {
  let out = s
  for (const [ko, en] of Object.entries(KO_MODEL_MAP)) {
    out = out.replace(new RegExp(ko, 'g'), ` ${en} `)
  }
  return out
}

function toSlug(brand: string | null, model: string): string {
  const modelLatin = koreanToLatin(model)
  const modelSlug = slugifyLib(modelLatin, { lower: true, strict: true, trim: true })

  // Guard: check if modelSlug is empty (Korean unmapped or pure symbols)
  if (!modelSlug || modelSlug.trim() === '') {
    console.error(
      `[ERROR] 모델명 "${model}" 을 슬러그로 변환할 수 없습니다.\n` +
      `해결 방법: --slug 플래그로 직접 지정하세요. 예:\n` +
      `  npm run racket:add -- "${model}" --slug your-custom-slug`
    )
    process.exit(1)
  }

  const brandSlug = brand ? slugifyLib(brand, { lower: true, strict: true }) : 'unknown'
  return `${brandSlug}-${modelSlug}`.replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function fileExists(p: string): boolean {
  return fs.existsSync(p)
}

function printResearcherPrompt(input: string, brand: string | null, slug: string) {
  const payload = {
    racket_name: input.trim(),
    brand: brand ?? undefined,
    target_slug: slug,
  }
  console.log('\n=== STEP 1: RESEARCHER ===')
  console.log('Paste this into Claude Code chat to invoke the racket-researcher sub-agent:\n')
  console.log('---COPY BELOW---')
  console.log(`@agent racket-researcher please research this racket and write content/research/${slug}.json`)
  console.log('')
  console.log('Input:')
  console.log('```json')
  console.log(JSON.stringify(payload, null, 2))
  console.log('```')
  console.log('---COPY ABOVE---\n')
  console.log(`After it finishes, rerun:  npm run racket:add -- "${input}" --resume`)
}

function printWriterPrompt(slug: string) {
  console.log('\n=== STEP 2: WRITER ===')
  console.log('Paste this into Claude Code chat to invoke racket-writer:\n')
  console.log('---COPY BELOW---')
  console.log(`@agent racket-writer please read content/research/${slug}.json and write content/drafts/${slug}.md`)
  console.log('---COPY ABOVE---\n')
  console.log(`After it finishes, rerun:  npm run racket:add -- --slug ${slug} --publish`)
}

function runValidator(slug: string): { valid: boolean; output: string } {
  try {
    const out = execSync(`npx tsx "${path.join(ROOT, 'scripts', 'validate-racket.ts')}" ${slug}`, {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).toString()
    return { valid: true, output: out }
  } catch (e) {
    const err = e as { stdout?: Buffer; stderr?: Buffer }
    const output = (err.stdout?.toString() ?? '') + (err.stderr?.toString() ?? '')
    return { valid: false, output }
  }
}

function promoteDraft(slug: string) {
  const src = path.join(DRAFTS_DIR, `${slug}.md`)
  const dst = path.join(RACKETS_DIR, `${slug}.md`)
  fs.mkdirSync(RACKETS_DIR, { recursive: true })
  fs.copyFileSync(src, dst)
  fs.rmSync(src)
  console.log(`[OK] promoted: drafts/${slug}.md -> rackets/${slug}.md`)
}

function runSync(slug: string) {
  try {
    const out = execSync(`npx tsx "${path.join(ROOT, 'scripts', 'sync-supabase.ts')}" --slug ${slug}`, {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).toString()
    console.log(out.trim())
  } catch (e) {
    const err = e as { stdout?: Buffer; stderr?: Buffer }
    console.log((err.stdout?.toString() ?? '') + (err.stderr?.toString() ?? ''))
    console.log('(Supabase sync failed but local files are in place)')
  }
}

function main() {
  const args = parseArgs()

  let slug: string
  let brand: string | null = null
  let input: string

  if (args.explicitSlug) {
    slug = args.explicitSlug
    input = args.input ?? slug
    const match = slug.match(/^([^-]+)-/)
    brand = match ? BRAND_VALUES.find((b) => b.toLowerCase() === match[1].toLowerCase()) ?? null : null
  } else {
    if (!args.input) {
      console.error('Usage: npm run racket:add -- "<racket name>" [--resume|--publish|--force]')
      process.exit(1)
    }
    input = args.input
    const detected = detectBrand(input)
    brand = detected.brand
    slug = toSlug(brand, detected.rest || input)
  }

  console.log(`\nBirdieminton — add racket`)
  console.log(`input:  ${input}`)
  console.log(`brand:  ${brand ?? '(unknown)'}`)
  console.log(`slug:   ${slug}`)

  const researchFile = path.join(RESEARCH_DIR, `${slug}.json`)
  const draftFile = path.join(DRAFTS_DIR, `${slug}.md`)
  const publishedFile = path.join(RACKETS_DIR, `${slug}.md`)

  if (fileExists(publishedFile) && !args.force) {
    console.error(`\n[ABORT] already published: ${publishedFile}`)
    console.error(`Use --force to overwrite.`)
    process.exit(1)
  }

  // Step 1: Research (unless resuming)
  if (!args.resume && !args.publish) {
    if (fileExists(researchFile) && !args.force) {
      console.log(`\n[SKIP] research already exists: ${researchFile}`)
      console.log(`      Proceeding to writer step. Use --force to redo research.`)
      printWriterPrompt(slug)
      return
    }
    printResearcherPrompt(input, brand, slug)
    return
  }

  // Step 2: Writer (resume path)
  if (args.resume && !args.publish) {
    if (!fileExists(researchFile)) {
      console.error(`\n[ERROR] research missing: ${researchFile}`)
      console.error(`Run without --resume first to get the researcher prompt.`)
      process.exit(1)
    }
    if (fileExists(draftFile) && !args.force) {
      console.log(`\n[SKIP] draft already exists: ${draftFile}`)
      console.log(`      Run with --publish to validate and promote. Use --force to redo writer.`)
    } else {
      printWriterPrompt(slug)
      return
    }
  }

  // Step 3: Publish — validate, promote, sync
  if (args.publish || fileExists(draftFile)) {
    if (!fileExists(draftFile)) {
      console.error(`\n[ERROR] draft missing: ${draftFile}`)
      process.exit(1)
    }

    console.log(`\n=== STEP 3: VALIDATE ===`)
    const v = runValidator(slug)
    console.log(v.output.trim())
    if (!v.valid) {
      console.error(`\n[FAIL] validation failed. Fix the draft and retry with --publish.`)
      process.exit(1)
    }

    console.log(`\n=== STEP 4: PROMOTE ===`)
    promoteDraft(slug)

    console.log(`\n=== STEP 5: SUPABASE SYNC ===`)
    runSync(slug)

    console.log(`\n=== DONE ===`)
    console.log(`Local URL:  http://localhost:3000/rackets/${slug}`)
    console.log(`File:       content/rackets/${slug}.md`)
  }
}

main()
