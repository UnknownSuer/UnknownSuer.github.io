import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { leadSchema } from "@/shared/api/lead-schema";

export const runtime = "nodejs";

const MAX_BRIEF_ATTACHMENTS_BYTES = 100 * 1024 * 1024;
const DEFAULT_UPLOAD_DIR = path.join(process.cwd(), "storage", "brief-uploads");

/**
 * Мок-бэкенд приёма заявок.
 *
 * Бриф принимает multipart/form-data с вложениями до 100 МБ суммарно.
 * В текущей VPS/dev-конфигурации файлы сохраняются на локальный диск в
 * storage/brief-uploads/<lead-id>. Перед масштабированием это место можно
 * заменить на S3-совместимое хранилище или Directus, не меняя форму.
 */
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return handleMultipartBrief(request);
  }

  const json = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  console.log("[lead]", JSON.stringify(parsed.data));
  return NextResponse.json({ ok: true, id: crypto.randomUUID() });
}

async function handleMultipartBrief(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ ok: false, error: "Не удалось прочитать форму" }, { status: 400 });
  }

  const payload = formData.get("payload");
  if (typeof payload !== "string") {
    return NextResponse.json({ ok: false, error: "В брифе отсутствуют данные" }, { status: 400 });
  }

  const json = (() => {
    try {
      return JSON.parse(payload) as unknown;
    } catch {
      return null;
    }
  })();
  const parsed = leadSchema.safeParse(json);

  if (!parsed.success || parsed.data.type !== "brief") {
    return NextResponse.json(
      { ok: false, errors: parsed.success ? "Ожидался бриф" : parsed.error.flatten() },
      { status: 400 },
    );
  }

  const files = formData
    .getAll("attachments")
    .filter((value): value is File => typeof File !== "undefined" && value instanceof File && value.size > 0);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  if (totalBytes > MAX_BRIEF_ATTACHMENTS_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Суммарный размер вложений не должен превышать 100 МБ" },
      { status: 413 },
    );
  }

  const id = crypto.randomUUID();
  const uploadRoot = process.env.BRIEF_UPLOAD_DIR || DEFAULT_UPLOAD_DIR;
  const leadDir = path.join(uploadRoot, id);

  try {
    await mkdir(leadDir, { recursive: true });
    await writeFile(
      path.join(leadDir, "lead.json"),
      JSON.stringify(
        {
          ...parsed.data,
          createdAt: new Date().toISOString(),
          attachments: files.map((file) => ({ name: file.name, size: file.size, type: file.type })),
        },
        null,
        2,
      ),
      "utf8",
    );

    for (const [index, file] of files.entries()) {
      const filename = `${String(index + 1).padStart(2, "0")}-${safeFilename(file.name)}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(leadDir, filename), buffer);
    }
  } catch (error) {
    console.error("[brief:upload]", error);
    return NextResponse.json(
      { ok: false, error: "Не удалось сохранить вложения" },
      { status: 500 },
    );
  }

  console.log(
    "[brief]",
    JSON.stringify({ id, ...parsed.data, attachments: files.map((file) => file.name) }),
  );

  return NextResponse.json({ ok: true, id });
}

function safeFilename(name: string) {
  const base = path.basename(name).replace(/[^a-zA-Z0-9а-яА-ЯёЁ._-]+/g, "_");
  return base.slice(0, 120) || "attachment";
}
