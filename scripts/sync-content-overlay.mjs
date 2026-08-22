/**
 * Кладёт копию контент-пака в public/content/content.json.
 *
 * Кабинет и админка читают этот файл на лету: подменив только его на хостинге,
 * можно поменять видео уроков без пересборки сайта. Файл генерируется на
 * каждой сборке, поэтому в git его держать не нужно (см. .gitignore).
 */
import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "src", "content", "content.json");
const targetDir = path.join(root, "public", "content");

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, path.join(targetDir, "content.json"));
console.log("✓ public/content/content.json");
