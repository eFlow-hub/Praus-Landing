-- Waitlist da landing PRAUS.
-- Tabela isolada: não depende de nada do schema do produto, então pode viver
-- no mesmo Postgres sem risco de colidir com as migrations do Prisma.

CREATE TABLE IF NOT EXISTS waitlist_signup (
  id           BIGSERIAL   PRIMARY KEY,
  email        TEXT        NOT NULL,
  -- email_norm existe só para o índice único: dedupe sem perder o que a
  -- pessoa digitou de fato (maiúsculas, espaços) no campo email.
  email_norm   TEXT        NOT NULL,
  source       TEXT,
  referer      TEXT,
  user_agent   TEXT,
  ip           TEXT,
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  -- carimbado quando a notificação sai; NULL = e-mail ainda não notificado,
  -- o que permite reenviar os pendentes depois sem duplicar.
  notified_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_signup_email_norm_key
  ON waitlist_signup (email_norm);

CREATE INDEX IF NOT EXISTS waitlist_signup_created_at_idx
  ON waitlist_signup (created_at DESC);

CREATE INDEX IF NOT EXISTS waitlist_signup_pending_notify_idx
  ON waitlist_signup (notified_at) WHERE notified_at IS NULL;
