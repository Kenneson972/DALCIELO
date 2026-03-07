import { appendFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()

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

async function run() {
  const args = parseArgs(process.argv.slice(2))
  const summary = (args.summary || 'Session terminee').trim()
  const next = (args.next || 'A definir').trim()
  const stamp = new Date().toISOString()
  const sessionFile = path.join(root, 'docs', 'logs', todayFileName())
  const globalLog = path.join(root, 'docs', 'ACTIONS_LOG.md')

  const endBlock = [
    '## Session End',
    `- endedAt: ${stamp}`,
    `- summary: ${summary}`,
    `- next: ${next}`,
    '',
  ].join('\n')

  await appendFile(sessionFile, endBlock, 'utf8')
  await appendFile(
    globalLog,
    `- ${stamp} | session | Session ended | files: n/a | session: docs/logs/${todayFileName()}\n`,
    'utf8'
  )
  console.log('Session finalized.')
}

run().catch((err) => {
  console.error('logs:end failed', err)
  process.exit(1)
})
