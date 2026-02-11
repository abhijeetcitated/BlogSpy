import { defineConfig, env } from "prisma/config"
import fs from "node:fs"

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return

  const content = fs.readFileSync(filePath, "utf8")
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) return

    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) return

    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()
    if (!key || value === undefined) return
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }

    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  })
}

loadEnvFile(".env.local")
loadEnvFile(".env")

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
    // @ts-expect-error Prisma config supports directUrl, types lag behind in prisma/config.
    directUrl: env("DIRECT_URL"),
    schemas: ["public", "auth"],
  },
})
