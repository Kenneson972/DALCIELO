import { mkdir, appendFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const logsDir = path.join(root, 'docs', 'logs')
const globalLog = path.join(root, 'docs', 'ACTIONS_LOG.md')

function todayFileName() {
  return `${new Date().toISOString().slice(0, 10)}.md`
}

function parseArgs(argv) {
  const out = {}
  for (const raw of argv) {
    if (!raw.startsWith('--')) continue
    const [k, ...rest] = raw.slice(2).split('=')
    out[k] = rest.join('=')
  }
  return out
}

function requireArg(args, key) {
  const value = args[key]
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required argument --${key}=...`)
  }
  return String(value).trim()
}

async function run() {
  const args = parseArgs(process.argv.slice(2))
  const stamp = new Date().toISOString()
  const type = requireArg(args, 'type')
  const summary = requireArg(args, 'summary')
  const files = requireArg(args, 'files')
  const why = requireArg(args, 'why')
  const impact = requireArg(args, 'impact')
  const verify = requireArg(args, 'verify')

  await mkdir(logsDir, { recursive: true })
  const sessionRel = `docs/logs/${todayFileName()}`
  const sessionFile = path.join(root, sessionRel)

  const sessionEntry = [
    `## Action ${stamp}`,
    `- type: ${type}`,
    `- summary: ${summary}`,
    `- files: ${files}`,
    `- why: ${why}`,
    `- impact: ${impact}`,
    `- verify: ${verify}`,
    '',
  ].join('\n')

  const globalEntry = `- ${stamp} | ${type} | ${summary} | files: ${files} | session: ${sessionRel}\n`

  await appendFile(sessionFile, sessionEntry, 'utf8')
  await appendFile(globalLog, globalEntry, 'utf8')

  console.log('Action logged successfully.')
}

run().catch((err) => {
  console.error('logs:action failed', err.message)
  process.exit(1)
})
