-- Future student cabinet auth schema (PostgreSQL).
-- NOT wired to production yet. Apply only when payment + SMS auth are connected.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164 text NOT NULL UNIQUE CHECK (phone_e164 ~ '^\\+[1-9][0-9]{7,14}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_slug text NOT NULL,
  purchase_phone_e164 text NOT NULL CHECK (purchase_phone_e164 ~ '^\\+[1-9][0-9]{7,14}$'),
  payment_id text UNIQUE,
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'refunded', 'cancelled')),
  access_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS course_purchases_phone_idx
  ON course_purchases (purchase_phone_e164, status);

CREATE TABLE IF NOT EXISTS student_otp_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164 text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts_left integer NOT NULL DEFAULT 5 CHECK (attempts_left >= 0),
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS student_otp_phone_created_idx
  ON student_otp_challenges (phone_e164, created_at DESC);

CREATE TABLE IF NOT EXISTS student_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS student_sessions_user_idx
  ON student_sessions (user_id, expires_at DESC);
