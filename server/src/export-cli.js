/**
 * Exportação pela linha de comando — o jeito mais direto de "puxar todos os
 * e-mails" no VPS, sem depender do token HTTP.
 *
 *   node src/export-cli.js            # CSV no stdout
 *   node src/export-cli.js --json     # JSON no stdout
 *   node src/export-cli.js > fila.csv
 */
import "dotenv/config";
import { pool, listarTodos } from "./db.js";

const COLUNAS = ["id", "email", "source", "referer", "utm_source", "utm_medium", "utm_campaign", "notified_at", "created_at"];

function csvCampo(v) {
  if (v === null || v === undefined) return "";
  let s = v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // anti injeção de fórmula
  return `"${s.replace(/"/g, '""')}"`;
}

try {
  const linhas = await listarTodos();
  if (process.argv.includes("--json")) {
    process.stdout.write(JSON.stringify(linhas, null, 2) + "\n");
  } else {
    process.stdout.write("﻿" + COLUNAS.join(",") + "\r\n");
    for (const l of linhas) process.stdout.write(COLUNAS.map((c) => csvCampo(l[c])).join(",") + "\r\n");
  }
  process.stderr.write(`\n${linhas.length} inscrição(ões) exportada(s).\n`);
} catch (err) {
  process.stderr.write(`falha ao exportar: ${err.message}\n`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
