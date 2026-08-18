# API da waitlist — PRAUS landing

Recebe o e-mail dos formulários da landing, grava no PostgreSQL e notifica
`MAIL_TO` pelo Resend.

**Regra central:** o cadastro é gravado *antes* de tentar o e-mail. Se o Resend
estiver fora, o lead não se perde — a linha fica com `notified_at NULL`.

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| `GET`  | `/api/health` | Estado do banco e do mailer |
| `GET`  | `/api/waitlist/status` | `{ total, limite, restantes, esgotado }` — público |
| `POST` | `/api/waitlist` | `{ email, source?, utm_* }` → grava e notifica |
| `GET`  | `/api/waitlist/export` | CSV (ou `?format=json`); exige `x-export-token` |

`POST /api/waitlist` responde `200 {ok:true, duplicate:bool}`. E-mail repetido
devolve `duplicate:true` **sem** erro — para o visitante, reenviar deve parecer
sucesso. Rate limit: `RATE_LIMIT` envios por IP a cada 10 minutos.

## Limite de vagas

`WAITLIST_LIMIT` (padrão **1200**, `0` desliga). Ao atingir o teto:

- `POST /api/waitlist` devolve `403 {ok:false, esgotado:true}`
- `GET /api/waitlist/status` devolve `esgotado:true`
- a landing pinta todos os CTAs de cinza com **"Acessos Esgotados"** e
  desativa os campos de e-mail

Contar e inserir em statements separados abriria uma corrida — em 1199 vagas,
duas requisições simultâneas leriam 1199 e ambas passariam. Por isso a
inserção roda dentro de uma transação com `pg_advisory_xact_lock`, o que
garante o teto exato. Testado com 20 requisições concorrentes e 2 vagas: 2
aceitas, 18 recusadas.

Quem **já está na fila** continua conseguindo reenviar o próprio e-mail mesmo
com a fila lotada — não consome vaga nova.

Para reabrir, basta aumentar `WAITLIST_LIMIT` e reiniciar o serviço.

## Rodar local

```bash
cd server
cp .env.example .env          # preencha DATABASE_URL e as chaves
npm install
npm run migrate               # cria a tabela (idempotente)

npm start                     # terminal 1 — API na 4100
npm run dev:site              # terminal 2 — landing na 8080, com proxy /api
```

Sem Postgres à mão:

```bash
docker run -d --name praus-pg -e POSTGRES_PASSWORD=teste \
  -e POSTGRES_DB=praus_landing -p 5432:5432 postgres:16-alpine
```

## Puxar os e-mails

```bash
# no VPS, direto do banco — não depende de token nem da API estar de pé
npm run export > fila.csv
npm run export -- --json

# ou por HTTP
curl -H "x-export-token: SEU_TOKEN" https://SEU_DOMINIO/api/waitlist/export -o fila.csv
```

```sql
-- ou direto no psql
SELECT email, source, created_at FROM waitlist_signup ORDER BY created_at DESC;
```

## Deploy no VPS

```bash
rsync -av --exclude node_modules --exclude .env ./ root@VPS:/var/www/praus-landing/
ssh root@VPS
cd /var/www/praus-landing/server && npm ci --omit=dev
cp .env.example .env && nano .env          # preencher

cp ../deploy/praus-landing-api.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now praus-landing-api

cp ../deploy/nginx.conf /etc/nginx/sites-available/praus-landing
# troque SEU_DOMINIO no arquivo
ln -s /etc/nginx/sites-available/praus-landing /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d SEU_DOMINIO
```

## Remetente do Resend

Sem domínio verificado, o Resend só aceita `onboarding@resend.dev` como `FROM`
e **só entrega para o e-mail dono da conta Resend**. Para entregar em
`jumtcompetition@gmail.com`, ou essa é a conta dona, ou verifique um domínio em
Resend → Domains e use `MAIL_FROM=PRAUS <waitlist@seudominio.com>`.

## Reenviar notificações pendentes

```sql
SELECT id, email, created_at FROM waitlist_signup WHERE notified_at IS NULL;
```

## Segurança

- Validação e whitelist de `source` no servidor — o cliente não é confiável
- Dedupe por índice único no banco, não na aplicação (à prova de corrida)
- `EXPORT_TOKEN` comparado em tempo constante; rota desligada se vazio
- CSV escapa `=`/`+`/`-`/`@` contra injeção de fórmula no Excel
- `trust proxy = 1`: o rate limit não é burlável por `X-Forwarded-For` forjado
