import { Pool, types } from "pg";

// bigint(int8, OID 20) を JS number として受け取る（id は小さいので安全）。
types.setTypeParser(20, (v) => parseInt(v, 10));

// HMR で Pool が多重生成されないよう global に保持。
const g = globalThis as unknown as { _pgPool?: Pool };

/** DATABASE_URL が設定されていれば Postgres 用 Pool を返す（未設定なら null）。 */
export function getPool(): Pool | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!g._pgPool) g._pgPool = new Pool({ connectionString: url, max: 5 });
  return g._pgPool;
}
