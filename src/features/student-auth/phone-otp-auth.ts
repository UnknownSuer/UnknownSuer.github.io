/**
 * ЗАГОТОВКА ДЛЯ БУДУЩЕЙ ИНТЕГРАЦИИ — НЕ ПОДКЛЮЧЕНА К ПРОДАКШЕН-ВХОДУ.
 *
 * Целевая схема:
 * 1. При успешной покупке нормализованный телефон сохраняется в БД вместе с
 *    userId / courseSlug / purchaseId и становится логином ученика.
 * 2. Ученик вводит телефон, сервис ищет активную покупку и создаёт OTP challenge.
 * 3. SMS-провайдер отправляет одноразовый код на тот же телефон.
 * 4. Код используется как одноразовый пароль; после проверки создаётся сессия.
 *
 * Этот модуль специально не зависит от конкретной БД и SMS-провайдера:
 * достаточно реализовать адаптеры StudentAuthRepository, SmsGateway и OtpCodec.
 */

export const PHONE_OTP_AUTH_ENABLED = false;

export const PHONE_OTP_POLICY = {
  ttlSeconds: 5 * 60,
  maxAttempts: 5,
  resendCooldownSeconds: 60,
} as const;

export interface PurchasedCourseAccess {
  userId: string;
  purchaseId: string;
  phoneE164: string;
  courseSlug: string;
  accessUntil: Date | null;
  isActive: boolean;
}

export interface OtpChallenge {
  id: string;
  phoneE164: string;
  codeHash: string;
  expiresAt: Date;
  attemptsLeft: number;
  consumedAt: Date | null;
}

export interface StudentSession {
  token: string;
  userId: string;
  courseSlugs: string[];
  expiresAt: Date;
}

export interface StudentAuthRepository {
  /** Вызывается после подтверждённой оплаты курса. */
  upsertPurchaseAccess(input: PurchasedCourseAccess): Promise<void>;
  findActiveAccessByPhone(phoneE164: string): Promise<PurchasedCourseAccess[]>;
  createOtpChallenge(input: Omit<OtpChallenge, "id">): Promise<OtpChallenge>;
  findOtpChallenge(id: string): Promise<OtpChallenge | null>;
  decrementOtpAttempts(id: string): Promise<void>;
  consumeOtpChallenge(id: string): Promise<void>;
  createSession(input: Omit<StudentSession, "token">): Promise<StudentSession>;
}

export interface SmsGateway {
  sendLoginCode(phoneE164: string, code: string): Promise<void>;
}

export interface OtpCodec {
  generateCode(): string;
  hashCode(code: string): Promise<string>;
  verifyCode(code: string, codeHash: string): Promise<boolean>;
}

export function normalizeRuPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 10) return `+7${digits}`;
  return null;
}

export function createPhoneOtpAuthService(deps: {
  repository: StudentAuthRepository;
  sms: SmsGateway;
  otp: OtpCodec;
  now?: () => Date;
}) {
  const now = deps.now ?? (() => new Date());

  return {
    async requestCode(rawPhone: string) {
      const phoneE164 = normalizeRuPhone(rawPhone);
      if (!phoneE164) return { ok: false as const, reason: "invalid_phone" as const };

      const access = await deps.repository.findActiveAccessByPhone(phoneE164);
      if (access.length === 0) {
        // В реальном API ответ наружу лучше сделать нейтральным, чтобы не
        // раскрывать, зарегистрирован ли номер в базе покупок.
        return { ok: false as const, reason: "no_active_purchase" as const };
      }

      const code = deps.otp.generateCode();
      const codeHash = await deps.otp.hashCode(code);
      const createdAt = now();
      const challenge = await deps.repository.createOtpChallenge({
        phoneE164,
        codeHash,
        expiresAt: new Date(createdAt.getTime() + PHONE_OTP_POLICY.ttlSeconds * 1000),
        attemptsLeft: PHONE_OTP_POLICY.maxAttempts,
        consumedAt: null,
      });

      await deps.sms.sendLoginCode(phoneE164, code);
      return { ok: true as const, challengeId: challenge.id };
    },

    async verifyCode(challengeId: string, code: string) {
      const challenge = await deps.repository.findOtpChallenge(challengeId);
      if (!challenge || challenge.consumedAt || challenge.expiresAt <= now()) {
        return { ok: false as const, reason: "expired" as const };
      }
      if (challenge.attemptsLeft <= 0) {
        return { ok: false as const, reason: "attempts_exhausted" as const };
      }

      const valid = await deps.otp.verifyCode(code, challenge.codeHash);
      if (!valid) {
        await deps.repository.decrementOtpAttempts(challenge.id);
        return { ok: false as const, reason: "invalid_code" as const };
      }

      const access = await deps.repository.findActiveAccessByPhone(challenge.phoneE164);
      if (access.length === 0) return { ok: false as const, reason: "no_active_purchase" as const };

      await deps.repository.consumeOtpChallenge(challenge.id);
      const session = await deps.repository.createSession({
        userId: access[0].userId,
        courseSlugs: [...new Set(access.map((item) => item.courseSlug))],
        expiresAt: new Date(now().getTime() + 30 * 24 * 60 * 60 * 1000),
      });

      return { ok: true as const, session };
    },
  };
}
