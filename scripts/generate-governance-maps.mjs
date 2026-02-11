import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const srcDir = path.join(root, "src")
const outDir = path.join(root, "memory-bank", "maps")

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(full))
      continue
    }

    if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(full)
    }
  }

  return files
}

function toRel(file) {
  return path.relative(root, file).replace(/\\/g, "/")
}

const files = walk(srcDir)

const importGraph = []
const routeActionMap = []
const dbTableMap = []
const integrationScan = []

const importRegex = /import\s+(?:type\s+)?[\s\S]*?from\s+["'`]([^"'`]+)["'`]/g
const exportFromRegex = /export\s+[\s\S]*?from\s+["'`]([^"'`]+)["'`]/g
const supabaseFromRegex = /\.from\(\s*["'`]([^"'`]+)["'`]\s*\)/g
const supabaseRpcRegex = /\.rpc\(\s*["'`]([^"'`]+)["'`]/g
const prismaModelRegex = /\bprisma\.([a-zA-Z0-9_]+)\./g

for (const file of files) {
  const rel = toRel(file)
  const content = fs.readFileSync(file, "utf8")

  const imports = new Set()
  let match

  while ((match = importRegex.exec(content)) !== null) imports.add(match[1])
  while ((match = exportFromRegex.exec(content)) !== null) imports.add(match[1])

  const allImports = [...imports].sort()
  const internalImports = allImports.filter((value) =>
    value.startsWith("@/") || value.startsWith("./") || value.startsWith("../")
  )

  importGraph.push({
    file: rel,
    importCount: allImports.length,
    internalImportCount: internalImports.length,
    imports: allImports,
  })

  if (/src\/app\/.+\/(page|layout)\.tsx$/.test(rel) || /src\/app\/.+\/route\.ts$/.test(rel)) {
    const actionImports = internalImports.filter((value) => /actions/.test(value))
    const featureImports = internalImports.filter((value) => value.startsWith("@/features/"))
    const libImports = internalImports.filter((value) => value.startsWith("@/lib/"))

    routeActionMap.push({
      routeFile: rel,
      actionImports,
      featureImports,
      libImports,
    })
  }

  const tables = new Set()
  const rpcs = new Set()
  const prismaModels = new Set()

  while ((match = supabaseFromRegex.exec(content)) !== null) tables.add(match[1])
  while ((match = supabaseRpcRegex.exec(content)) !== null) rpcs.add(match[1])
  while ((match = prismaModelRegex.exec(content)) !== null) prismaModels.add(match[1])

  if (tables.size || rpcs.size || prismaModels.size) {
    dbTableMap.push({
      file: rel,
      supabaseTables: [...tables].sort(),
      supabaseRpc: [...rpcs].sort(),
      prismaModels: [...prismaModels].sort(),
    })
  }

  const providers = {
    dataforseo: /dataforseo/i.test(content),
    upstash: /upstash|qstash/i.test(content),
    supabase: /supabase/i.test(content),
    prisma: /\bprisma\b/i.test(content),
    lemonsqueezy: /lemonsqueezy|lemon-squeezy/i.test(content),
    openai: /\bopenai\b/i.test(content),
    webhook: /webhook/i.test(content),
  }

  const activeProviders = Object.entries(providers)
    .filter(([, enabled]) => enabled)
    .map(([provider]) => provider)

  if (activeProviders.length) {
    integrationScan.push({ file: rel, providers: activeProviders })
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  totalScannedFiles: files.length,
  totalRoutesMapped: routeActionMap.length,
  totalDbTouchFiles: dbTableMap.length,
  totalIntegrationTouchFiles: integrationScan.length,
}

fs.mkdirSync(outDir, { recursive: true })

fs.writeFileSync(
  path.join(outDir, "import-graph.json"),
  JSON.stringify({ summary, nodes: importGraph }, null, 2)
)
fs.writeFileSync(
  path.join(outDir, "route-action-map.json"),
  JSON.stringify({ summary, routes: routeActionMap }, null, 2)
)
fs.writeFileSync(
  path.join(outDir, "db-table-map.json"),
  JSON.stringify({ summary, files: dbTableMap }, null, 2)
)
fs.writeFileSync(
  path.join(outDir, "integration-scan.json"),
  JSON.stringify({ summary, files: integrationScan }, null, 2)
)

console.log("Generated governance maps", summary)
