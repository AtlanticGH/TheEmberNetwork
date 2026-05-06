import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()

const DEFAULT_IGNORES = new Set([
  '.git',
  'node_modules',
  'dist',
  '.vite',
  '.turbo',
  '.next',
  '.cache',
  'coverage',
])

function rel(p) {
  const r = path.relative(ROOT, p)
  return r || '.'
}

function isWalkableError(err) {
  return (
    err &&
    (err.code === 'EPERM' ||
      err.code === 'EACCES' ||
      err.code === 'EBUSY' ||
      err.code === 'ENOENT')
  )
}

async function safeLstat(p) {
  try {
    return await fs.lstat(p)
  } catch (err) {
    return { __error: err }
  }
}

async function walkDir(startAbs, { ignores = DEFAULT_IGNORES } = {}) {
  const unreadable = []
  const symlinks = []
  const missing = []

  const stack = [startAbs]
  while (stack.length) {
    const current = stack.pop()
    const name = path.basename(current)
    if (ignores.has(name)) continue

    const st = await safeLstat(current)
    if (st?.__error) {
      if (isWalkableError(st.__error)) {
        missing.push({ path: current, error: st.__error })
        continue
      }
      throw st.__error
    }

    if (st.isSymbolicLink()) {
      symlinks.push(current)
      continue
    }

    if (!st.isDirectory()) continue

    let dir
    try {
      dir = await fs.opendir(current)
    } catch (err) {
      if (isWalkableError(err)) {
        unreadable.push({ path: current, error: err })
        continue
      }
      throw err
    }

    try {
      for await (const entry of dir) {
        // Avoid infinite loops on weird '.' / '..' entries.
        if (!entry?.name || entry.name === '.' || entry.name === '..') continue
        stack.push(path.join(current, entry.name))
      }
    } finally {
      await dir.close().catch(() => {})
    }
  }

  return { unreadable, symlinks, missing }
}

function quote(p) {
  // Safe for PowerShell/CMD copy-paste.
  return `"${p.replaceAll('"', '""')}"`
}

function printWindowsRemovalPlan(absPath) {
  const p = absPath
  const q = quote(p)

  // Print multiple options: some Windows setups (FAT/exFAT) don't support ACLs.
  const ps = [
    `# PowerShell (run as Administrator)`,
    `# Option A: try ACL/takeown (works on NTFS)`,
    `takeown /f ${q} /r /d y`,
    `icacls ${q} /grant Administrators:F /t`,
    `rmdir /s /q ${q}`,
    ``,
    `# Option B: clear attributes then delete (often works when ACL tools fail)`,
    `attrib -r -s -h ${q} /s /d`,
    `rmdir /s /q ${q}`,
  ]

  const cmd = [
    `:: CMD (run as Administrator)`,
    `:: Option A: try ACL/takeown (works on NTFS)`,
    `takeown /f ${q} /r /d y`,
    `icacls ${q} /grant Administrators:F /t`,
    `rmdir /s /q ${q}`,
    ``,
    `:: Option B: clear attributes then delete`,
    `attrib -r -s -h ${q} /s /d`,
    `rmdir /s /q ${q}`,
  ]

  return { ps, cmd }
}

function printPosixRemovalPlan(absPath) {
  const q = JSON.stringify(absPath)
  return {
    sh: [
      `# sh (run with sufficient permissions)`,
      `sudo chmod -R u+rwX ${q} || true`,
      `sudo rm -rf ${q}`,
    ],
  }
}

function fmtErr(err) {
  if (!err) return 'Unknown error'
  const code = err.code ? `${err.code} ` : ''
  return `${code}${err.message || String(err)}`.trim()
}

async function main() {
  const start = ROOT
  const { unreadable, symlinks, missing } = await walkDir(start)

  if (!unreadable.length) {
    console.log(`Repo doctor: no unreadable directories found under ${rel(start)}.`)
    if (symlinks.length) {
      console.log(`\nNote: ${symlinks.length} symlink(s) were detected and not traversed.`)
    }
    return
  }

  console.log(`Repo doctor found ${unreadable.length} unreadable director${unreadable.length === 1 ? 'y' : 'ies'}.\n`)
  unreadable
    .slice()
    .sort((a, b) => a.path.localeCompare(b.path))
    .forEach((it, idx) => {
      console.log(`${idx + 1}. ${rel(it.path)} (${fmtErr(it.error)})`)
    })

  console.log(`\n---`)
  console.log(`The script does NOT delete anything. Below are copy/paste commands you can run manually.`)

  const targets = unreadable
    .map((x) => x.path)
    // Prefer deleting deeper paths first.
    .sort((a, b) => b.length - a.length)

  if (process.platform === 'win32') {
    console.log(`\n### Windows removal commands\n`)
    for (const t of targets) {
      console.log(`\n# Target: ${rel(t)}`)
      const plan = printWindowsRemovalPlan(t)
      console.log(plan.ps.join('\n'))
    }
  } else {
    console.log(`\n### POSIX removal commands\n`)
    for (const t of targets) {
      console.log(`\n# Target: ${rel(t)}`)
      const plan = printPosixRemovalPlan(t)
      console.log(plan.sh.join('\n'))
    }
  }

  if (symlinks.length) {
    console.log(`\nNote: ${symlinks.length} symlink(s) were detected and not traversed.`)
  }

  if (missing.length) {
    // Not an error; just visibility.
    console.log(`\nNote: ${missing.length} path(s) disappeared during scan (normal on some filesystems).`)
  }
}

main().catch((err) => {
  console.error(`Repo doctor failed: ${fmtErr(err)}`)
  process.exitCode = 1
})

