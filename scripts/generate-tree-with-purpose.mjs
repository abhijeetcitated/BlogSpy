import fs from "node:fs";
import path from "node:path";

const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".vscode",
  ".kilocode",
  ".roo",
  ".cursor",
  "backups",
  "assets",
]);

const EXCLUDE_EXTS = new Set([".md", ".txt"]);

function purposeForPath(p, isDir) {
  const base = path.basename(p);
  if (isDir) {
    switch (base) {
      case "app":
        return "Next.js App Router routes/layouts";
      case "src":
        return "Application source (feature-first)";
      case "components":
        return "Shared UI components (app-level)";
      case "lib":
        return "Core libraries (auth, utils, integrations)";
      case "services":
        return "Service clients/wrappers (external + internal)";
      case "types":
        return "TypeScript shared types/contracts";
      case "supabase":
        return "Database migrations and Supabase config";
      case "prisma":
        return "Prisma schema and DB tooling";
      case "public":
        return "Static assets served by Next.js";
      case "store":
        return "App/global state stores";
      case "docs":
        return "Documentation (excluded from listing)";
      default:
        return "Folder";
    }
  }

  switch (base) {
    case "package.json":
      return "NPM scripts and dependencies";
    case "next.config.ts":
      return "Next.js configuration";
    case "tsconfig.json":
      return "TypeScript compiler configuration";
    case "proxy.ts":
      return "Proxy/demo routing logic";
    default:
      return "File";
  }
}

/**
 * Builds a real tree view like:
 * app/  — ...
 * ├─ (auth)/  — ...
 * │  └─ login/
 * │     └─ page.tsx
 */
function buildTreeLines(dirAbs, relBase, prefix, isLast, outLines) {
  const baseName = relBase === "" ? "" : path.basename(relBase);

  const label = relBase === "" ? "." : `${baseName}${fs.statSync(dirAbs).isDirectory() ? "/" : ""}`;
  if (relBase !== "") {
    const connector = prefix === "" ? "" : isLast ? "└─ " : "├─ ";
    outLines.push(`${prefix}${connector}${label} — ${purposeForPath(dirAbs, true)}`);
  }

  const entries = fs
    .readdirSync(dirAbs, { withFileTypes: true })
    .filter((e) => {
      if (e.isDirectory()) return !EXCLUDE_DIRS.has(e.name);
      return !EXCLUDE_EXTS.has(path.extname(e.name));
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const childPrefix = relBase === "" ? "" : `${prefix}${isLast ? "   " : "│  "}`;

  entries.forEach((ent, idx) => {
    const last = idx === entries.length - 1;
    const abs = path.join(dirAbs, ent.name);

    if (ent.isDirectory()) {
      buildTreeLines(abs, path.join(relBase, ent.name), childPrefix, last, outLines);
      return;
    }

    const connector = last ? "└─ " : "├─ ";
    outLines.push(`${childPrefix}${connector}${ent.name} — ${purposeForPath(abs, false)}`);
  });
}

const root = process.cwd();
const lines = [];
lines.push("# BLOGSPY TREE (REAL) + PURPOSE (NO DOCS/TXT)");
lines.push("");
lines.push(`Excluded dirs: ${Array.from(EXCLUDE_DIRS).join(", ")}`);
lines.push(`Excluded ext: ${Array.from(EXCLUDE_EXTS).join(", ")}`);
lines.push("");

// Root folders/files
const rootEntries = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((e) => {
    if (e.isDirectory()) return !EXCLUDE_DIRS.has(e.name);
    return !EXCLUDE_EXTS.has(path.extname(e.name));
  })
  .sort((a, b) => a.name.localeCompare(b.name));

rootEntries.forEach((ent, idx) => {
  const last = idx === rootEntries.length - 1;
  const abs = path.join(root, ent.name);

  if (ent.isDirectory()) {
    // root-level directory label (no prefix)
    lines.push(`${ent.name}/ — ${purposeForPath(abs, true)}`);

    const entries = fs
      .readdirSync(abs, { withFileTypes: true })
      .filter((e) => {
        if (e.isDirectory()) return !EXCLUDE_DIRS.has(e.name);
        return !EXCLUDE_EXTS.has(path.extname(e.name));
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    entries.forEach((child, childIdx) => {
      const childLast = childIdx === entries.length - 1;
      const childAbs = path.join(abs, child.name);

      if (child.isDirectory()) {
        // Print child dir header line and recurse into it as a subtree
        lines.push(`${childLast ? "└─ " : "├─ "}${child.name}/ — ${purposeForPath(childAbs, true)}`);
        const childPrefix = childLast ? "   " : "│  ";
        const childEntries = fs
          .readdirSync(childAbs, { withFileTypes: true })
          .filter((e) => {
            if (e.isDirectory()) return !EXCLUDE_DIRS.has(e.name);
            return !EXCLUDE_EXTS.has(path.extname(e.name));
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        childEntries.forEach((g, gIdx) => {
          const gLast = gIdx === childEntries.length - 1;
          const gAbs = path.join(childAbs, g.name);

          if (g.isDirectory()) {
            buildTreeLines(gAbs, path.join(ent.name, child.name, g.name), childPrefix, gLast, lines);
          } else {
            lines.push(`${childPrefix}${gLast ? "└─ " : "├─ "}${g.name} — ${purposeForPath(gAbs, false)}`);
          }
        });
        return;
      }

      lines.push(`${childLast ? "└─ " : "├─ "}${child.name} — ${purposeForPath(childAbs, false)}`);
    });

    lines.push("");
    return;
  }

  // root-level file
  lines.push(`${ent.name} — ${purposeForPath(abs, false)}`);
  if (last) lines.push("");
});

fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
fs.writeFileSync(path.join(root, "BLOGSPY_COMPLETE_TREE_WITH_PURPOSE.md"), lines.join("\n"), "utf8");

console.log("WROTE BLOGSPY_COMPLETE_TREE_WITH_PURPOSE.md");
console.log("lines:", lines.length);
