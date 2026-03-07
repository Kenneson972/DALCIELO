import { mkdir, access, appendFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const logsDir = path.join(root, 'docs', 'logs')
const globalLog = path.join(root, 'docs', 'ACTIONS_LOG.md')

function todayFileName() {
  return `${new Date().toISOString().slice(0, 10)}.md`
}

async function ensureFile(filePath, initialContent = '') {
  try {
    await access(filePath)
  } catch {
    await writeFile(filePath, initialContent, 'utf8')
  }
}

async function run() {
  await mkdir(logsDir, { recursive: true })
  await ensureFile(
    globalLog,
    '# Actions Log\n\nJournal global des actions importantes effectuees sur le projet.\n\n## Entries\n\n'
  )

  const sessionFile = path.join(logsDir, todayFileName())
  const stamp = new Date().toISOString()
  const header = `# Session ${stamp.slice(0, 10)}\n\n## Session Start\n- startedAt: ${stamp}\n\n`
  await ensureFile(sessionFile, header)

  const marker = `- ${stamp} | session | Session started | files: n/a | session: docs/logs/${path.basename(sessionFile)}\n`
  await appendFile(globalLog, marker, 'utf8')
  console.log(`Session log ready: ${sessionFile}`)
}

run().catch((err) => {
  console.error('logs:start failed', err)
  process.exit(1)
})
