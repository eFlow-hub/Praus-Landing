/**
 * Notificação de nova inscrição via Resend (mesmo provedor já usado no
 * produto PRAUS). Chamada direta na REST API — evita mais uma dependência.
 *
 * Atenção ao remetente: sem um domínio verificado no Resend, o único FROM
 * aceito é onboarding@resend.dev e a entrega fica restrita ao e-mail dono
 * da conta. Com domínio verificado, use algo como waitlist@seudominio.com.
 */

/* Sobrescrevível para apontar a um mock em teste/homologação. Em produção
   deixe a variável vazia e o padrão da Resend é usado. */
const RESEND_ENDPOINT = process.env.RESEND_ENDPOINT || "https://api.resend.com/emails";

const escapaHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

export function mailerConfigurado() {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_TO && process.env.MAIL_FROM);
}

/**
 * @returns {{ok:true, id:string} | {ok:false, erro:string}}
 * Nunca lança: quem chama decide o que fazer, e uma falha de e-mail não pode
 * derrubar o cadastro que já foi gravado.
 */
export async function notificarInscricao({ email, source, total, ip, referer, quando }) {
  if (!mailerConfigurado()) {
    return { ok: false, erro: "mailer não configurado (RESEND_API_KEY / MAIL_FROM / MAIL_TO)" };
  }

  const linha = (rot, val) =>
    `<tr><td style="padding:6px 14px 6px 0;color:#8A817A;font:500 12px/1.5 -apple-system,Segoe UI,sans-serif;white-space:nowrap">${rot}</td>` +
    `<td style="padding:6px 0;color:#F4EFEA;font:600 14px/1.5 -apple-system,Segoe UI,sans-serif">${escapaHtml(val ?? "—")}</td></tr>`;

  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#14110F;padding:28px">
  <div style="max-width:520px;margin:auto;background:#1B1714;border:1px solid #2A231E;padding:26px">
    <p style="margin:0 0 6px;color:#FF7A00;font:700 11px/1 ui-monospace,monospace;letter-spacing:.18em">PRAUS · WAITLIST</p>
    <h1 style="margin:0 0 20px;color:#F4EFEA;font:700 21px/1.25 -apple-system,Segoe UI,sans-serif">Nova inscrição no beta</h1>
    <table style="border-collapse:collapse;width:100%">
      ${linha("E-mail", email)}
      ${linha("Origem", source)}
      ${linha("Quando", quando)}
      ${linha("Página", referer)}
      ${linha("IP", ip)}
      ${linha("Total na fila", total)}
    </table>
  </div></body></html>`;

  const texto = [
    "PRAUS — nova inscrição no beta",
    `E-mail: ${email}`,
    `Origem: ${source || "—"}`,
    `Quando: ${quando}`,
    `Página: ${referer || "—"}`,
    `IP: ${ip || "—"}`,
    `Total na fila: ${total}`,
  ].join("\n");

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [process.env.MAIL_TO],
        reply_to: email,
        subject: `PRAUS · nova inscrição: ${email}`,
        html,
        text: texto,
      }),
      signal: ctrl.signal,
    });

    const corpo = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, erro: `Resend ${res.status}: ${corpo?.message || corpo?.name || "erro desconhecido"}` };
    }
    return { ok: true, id: corpo.id };
  } catch (err) {
    return { ok: false, erro: err.name === "AbortError" ? "timeout de 10s no Resend" : err.message };
  } finally {
    clearTimeout(timeout);
  }
}
