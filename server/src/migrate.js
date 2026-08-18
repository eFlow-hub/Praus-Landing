/** Roda a migração isoladamente: `npm run migrate` */
import "dotenv/config";
import { pool, migrate, contar } from "./db.js";

try {
  await migrate();
  console.log(`migração ok — ${await contar()} inscrição(ões) na tabela.`);
} catch (err) {
  console.error("migração falhou:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
