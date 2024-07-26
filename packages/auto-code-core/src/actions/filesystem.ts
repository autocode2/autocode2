import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { CommandConfig } from "../config";

export async function createFile(
  args: { filename: string; contents: string },
  config: CommandConfig
) {
  const workDir = config.getWorkDir();
  const filePath = path.join(workDir, args.filename);
  if (!existsSync(path.dirname(filePath))) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
  }
  if (existsSync(filePath)) {
    //throw new Error(`File already exists: ${filePath}`);
    console.warn(`File already exists: ${filePath}`);
  } else {
    await fs.writeFile(filePath, args.contents);
  }
}

export async function replaceFile(
  args: { filename: string; contents: string },
  config: CommandConfig
) {
  const workDir = config.getWorkDir();
  const filePath = path.join(workDir, args.filename);
  if (!existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  } else {
    await fs.writeFile(filePath, args.contents);
  }
}

export async function removeFile(
  args: { filename: string },
  config: CommandConfig
) {
  const workDir = config.getWorkDir();
  const filePath = path.join(workDir, args.filename);
  if (!existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  } else {
    await fs.unlink(filePath);
  }
}
