import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  pool: Pool;
  poolSignature?: string;
};

type ConnectionConfig = {
  connectionString: string;
  databaseUser: string;
  isSupabasePoolerHost: boolean;
  isSupabaseHost: boolean;
  sslMode?: string;
  sslConfig: false | { rejectUnauthorized: boolean };
  poolSignature: string;
};

function getConnectionConfig(): ConnectionConfig {
  const connectionString = process.env.DATABASE_URL!;
  const databaseUrl = (() => {
    try {
      return new URL(connectionString);
    } catch {
      return null;
    }
  })();

  const sslMode = process.env.DATABASE_SSL_MODE?.toLowerCase();
  const hostname = databaseUrl?.hostname ?? "";
  const isSupabaseHost =
    hostname.endsWith(".supabase.co") ||
    hostname.endsWith(".pooler.supabase.com");
  const isSupabasePoolerHost =
    hostname.endsWith(".pooler.supabase.com");
  const allowSelfSignedCerts =
    process.env.NODE_ENV !== "production" &&
    process.env.DATABASE_ALLOW_SELF_SIGNED_CERTS === "true";
  const databaseUser = databaseUrl?.username ?? "";

  const sslConfig = (() => {
    if (sslMode === "disable") {
      return false as const;
    }

    if (sslMode === "require") {
      return { rejectUnauthorized: false } as const;
    }

    if (sslMode === "strict") {
      return { rejectUnauthorized: true } as const;
    }

    if (allowSelfSignedCerts || isSupabasePoolerHost) {
      return { rejectUnauthorized: false } as const;
    }

    if (isSupabaseHost) {
      return { rejectUnauthorized: false } as const;
    }

    return { rejectUnauthorized: true } as const;
  })();
  const poolSignature = [
    hostname || "unknown-host",
    databaseUrl?.port || "default-port",
    databaseUser || "unknown-user",
    databaseUrl?.pathname || "/",
    sslMode || "auto",
    allowSelfSignedCerts ? "self-signed-dev" : "default",
    isSupabaseHost ? "supabase-host" : "other-host",
  ].join("|");

  return {
    connectionString,
    databaseUser,
    isSupabasePoolerHost,
    isSupabaseHost,
    sslMode,
    sslConfig,
    poolSignature,
  };
}

function createPrismaClient() {
  const config = getConnectionConfig();
  const {
    connectionString,
    databaseUser,
    isSupabasePoolerHost,
    sslMode,
    sslConfig,
    poolSignature,
  } = config;

  if (process.env.NODE_ENV === "production" && databaseUser === "postgres") {
    console.warn(
      "[SECURITY] DATABASE_URL uses postgres role. Prefer a least-privilege role without BYPASSRLS for app traffic."
    );
  }

  if (isSupabasePoolerHost && sslMode !== "strict") {
    console.warn(
      "[DB] Using TLS with certificate verification disabled for Supabase pooler host. Set DATABASE_SSL_MODE=strict when a trusted cert chain is available."
    );
  }

  const shouldRecreatePool =
    !globalForPrisma.pool ||
    globalForPrisma.poolSignature !== poolSignature;
  const shouldRecreateClient = !globalForPrisma.prisma || shouldRecreatePool;

  if (shouldRecreatePool && globalForPrisma.pool) {
    globalForPrisma.pool
      .end()
      .catch(() => {
        // Ignore teardown issues during dev hot reload pool swaps.
      });
  }

  if (shouldRecreatePool) {
    globalForPrisma.pool = new Pool({
      connectionString,
      ssl: sslConfig,
      max: 5,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
      allowExitOnIdle: true,
    });
    // Prevent unhandled 'error' events from crashing the process when
    // an idle connection is terminated by the server or a network blip.
    globalForPrisma.pool.on("error", (err) => {
      console.error("[DB] Idle pool connection error (non-fatal):", err.message);
    });
    globalForPrisma.poolSignature = poolSignature;
  }

  if (!shouldRecreateClient && globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  if (globalForPrisma.prisma) {
    globalForPrisma.prisma
      .$disconnect()
      .catch(() => {
        // Ignore disconnect errors during development reloads.
      });
  }

  if (shouldRecreatePool) {
    // Pool already (re)created above.
  }

  const adapter = new PrismaPg(globalForPrisma.pool);
  globalForPrisma.prisma = new PrismaClient({ adapter });
  return globalForPrisma.prisma;
}

export const prisma = createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
