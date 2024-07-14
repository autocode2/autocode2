import { readdir, readFile } from "fs/promises";
import { exec } from "node:child_process";
import { minimatch } from "minimatch";
import { CommandConfig } from "../config";
import { lstatSync } from "fs";

export type ContextType = "git" | "fs";

export type Context = {
  files: ContextFile[];
};

export type ContextFile = {
  path: string;
  content: string;
};

export async function context(config: CommandConfig): Promise<Context> {
  const excludes = config.getContextExcludes();
  const focus = config.getContextFocus();
  const workDir = config.getWorkDir();
  const allFiles = await getAllFiles({
    workDir,
    type: config.getContextType()
  });

  const contextFiles = await Promise.all(
    allFiles.filter(matchesFilter({ excludes, focus })).map(async (path) => {
      const content = await readFile(path, "utf-8");
      return {
        path,
        content
      } as ContextFile;
    })
  );

  return {
    files: contextFiles
  };
}

export function getAllFiles({
  workDir,
  type
}: {
  workDir: string;
  type: ContextType;
}): Promise<string[]> {
  if (type === "git") {
    return getGitFiles({ cwd: workDir });
  } else {
    return getFsFiles({ cwd: workDir });
  }
}

export async function getFsFiles({ cwd }: { cwd: string }): Promise<string[]> {
  const files = await readdir(cwd, { recursive: true });
  return files.filter((file) => {
    const stats = lstatSync(file);
    return stats.isFile();
  });
}

export function getGitFiles({ cwd }: { cwd: string }): Promise<string[]> {
  return new Promise((resolve, reject) => {
    exec(
      "git ls-files",
      {
        cwd: cwd
      },
      (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          const filePaths = stdout.trim().split("\n");
          resolve(filePaths);
        }
      }
    );
  });
}

export function matchesFilter({
  excludes = [],
  focus = []
}: {
  excludes?: string[];
  focus?: string[];
}) {
  return (file: string): boolean =>
    !excludes.some((pattern) => minimatch(file, pattern)) &&
    (focus.length === 0 || focus.some((pattern) => minimatch(file, pattern)));
}

export const encodeContextAsXML = (context: Context): string => {
  return `<Context>${context.files
    .map((file) => `<File path="${file.path}">${file.content}</File>`)
    .join("")}</Context>`;
};
