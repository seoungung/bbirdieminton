/**
 * Validate racket markdown front-matter against Zod schema.
 * Usage: npx tsx scripts/validate-racket.ts <slug>
 * Exit 0 + {valid:true} on pass, exit 1 + {valid:false, errors:[]} on fail.
 */
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { RacketFrontmatterSchema } from './types'

const ROOT = path.resolve(__dirname, '..')

function findFile(slug: string): string | null {
  const candidates = [
    path.join(ROOT, 'content', 'drafts', `${slug}.md`),
    path.join(ROOT, 'content', 'rackets', `${slug}.md`),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  return null
}

function main() {
  const slug = process.argv[2]
  if (!slug) {
    console.log(JSON.stringify({ valid: false, errors: [{ path: 'argv', message: 'slug argument required' }] }))
    process.exit(1)
  }

  const file = findFile(slug)
  if (!file) {
    console.log(JSON.stringify({
      valid: false,
      errors: [{ path: 'file', message: `not found: drafts/${slug}.md or rackets/${slug}.md` }],
    }))
    process.exit(1)
  }

  const raw = fs.readFileSync(file, 'utf8')
  const { data } = matter(raw)
  const result = RacketFrontmatterSchema.safeParse(data)

  if (result.success) {
    console.log(JSON.stringify({ valid: true, file, slug: result.data.slug }))
    process.exit(0)
  }

  const errors = result.error.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }))
  console.log(JSON.stringify({ valid: false, file, errors }))
  process.exit(1)
}

main()
