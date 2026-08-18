import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const dir = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não definida — copie .env.example para .env");
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX || 5),
  connectionTimeoutMillis: 8000,
  idleTimeoutMillis: 30000,
  // Postgres gerenciado costuma exigir TLS; local não tem certificado válido.
  ssl: process.env.PGSSL === "require" ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (err) => {
  console.error("[db] erro no cliente ocioso do pool:", err.message);
});

/** Cria a tabela se não existir. Idempotente — pode rodar em todo boot. */
export async function migrate() {
  const sql = fs.readFileSync(path.join(dir, "schema.sql"), "utf8");
  await pool.query(sql);
}

/* Chave arbitrária e fixa do advisory lock da waitlist. */
const LOCK_WAITLIST = 8123401;

/**
 * Grava a inscrição respeitando o limite de vagas.
 *
 * Contar e inserir em statements separados abriria uma corrida: em 1199 vagas
 * usadas, duas requisições simultâneas leriam 1199 e ambas inseririam. O
 * advisory lock transacional serializa só este trecho, garantindo o teto exato.
 *
 * @returns {{id:number|null, duplicate:boolean, full:boolean, total:number}}
 */
export async function insertSignup(dados, limite) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [LOCK_WAITLIST]);

    /* Quem já está na fila não consome vaga nova e não é barrado pelo limite —
       reenviar o próprio e-mail deve continuar funcionando mesmo lotado. */
    const jaExiste = await client.query(
      "SELECT id FROM waitlist_signup WHERE email_norm = $1",
      [dados.emailNorm]
    );
    const { rows: [{ total }] } = await client.query(
      "SELECT count(*)::int AS total FROM waitlist_signup"
    );

    if (jaExiste.rowCount) {
      await client.query("COMMIT");
      return { id: null, duplicate: true, full: false, total };
    }

    if (limite > 0 && total >= limite) {
      await client.query("COMMIT");
      return { id: null, duplicate: false, full: true, total };
    }

    const ins = await client.query(
      `INSERT INTO waitlist_signup
         (email, email_norm, source, referer, user_agent, ip, utm_source, utm_medium, utm_campaign)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        dados.email,
        dados.emailNorm,
        dados.source || null,
        dados.referer || null,
        dados.userAgent || null,
        dados.ip || null,
        dados.utmSource || null,
        dados.utmMedium || null,
        dados.utmCampaign || null,
      ]
    );
    await client.query("COMMIT");
    return { id: Number(ins.rows[0].id), duplicate: false, full: false, total: total + 1 };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** Situação das vagas — consumido pelo front no carregamento da página. */
export async function situacao(limite) {
  const total = await contar();
  return {
    total,
    limite,
    restantes: limite > 0 ? Math.max(0, limite - total) : null,
    esgotado: limite > 0 && total >= limite,
  };
}

export async function marcarNotificado(id) {
  await pool.query(`UPDATE waitlist_signup SET notified_at = now() WHERE id = $1`, [id]);
}

export async function contar() {
  const { rows } = await pool.query(`SELECT count(*)::int AS total FROM waitlist_signup`);
  return rows[0].total;
}

/** Todas as inscrições, mais recentes primeiro — usado pela exportação. */
export async function listarTodos() {
  const { rows } = await pool.query(
    `SELECT id, email, source, referer, utm_source, utm_medium, utm_campaign,
            notified_at, created_at
       FROM waitlist_signup
      ORDER BY created_at DESC`
  );
  return rows;
}
