import fs from "fs/promises";
import { Context, context, ContextType } from "../context/context.js";
import { getModel, getModelName, getModelCosts } from "../llm/getModel.js";
import { xdgConfig, xdgData } from "xdg-basedir";
import { existsSync } from "node:fs";

import path from "path";
import { Database } from "../db/Database.js";

export const XDG_NAME = "auto-code";

export type CommandConfigOptions = {
  contextType?: ContextType;
  inputFile?: string;
  outputFile?: string;
  model?: string;
  prompt?: string;
  include?: string[];
  exclude?: string[];
  excludeFrom?: string;
  dataDir?: string;
  configDir?: string;
  checkpointer?: "memory" | "sqlite";
  thread?: string;
};

export type ConfigFile = {
  env: Record<string, string>;
};

export class CommandConfig {
  private dataDir: string;
  private configDir: string;
  private threadId: string;
  private _database: Database;

  constructor(public opts: CommandConfigOptions) {}

  async init() {
    await this.setupDirectories();
    await this.loadConfigFile();
    await this.loadExcludeFrom();
    if (this.opts.inputFile) {
      this.opts.prompt = await fs.readFile(this.opts.inputFile, "utf8");
    }
  }

  async setupDirectories() {
    if (!this.opts.dataDir) {
      if (!xdgData) {
        throw new Error(
          "No XDG_DATA_HOME found, data directory can't be created"
        );
      }
      this.dataDir = this.opts.dataDir = path.join(xdgData, XDG_NAME);
    }
    await fs.mkdir(this.dataDir, { recursive: true });

    if (!this.opts.configDir) {
      if (!xdgConfig) {
        throw new Error(
          "No XDG_CONFIG_HOME found, config directory can't be created"
        );
      }
      this.configDir = this.opts.configDir = path.join(xdgConfig, XDG_NAME);
    }
    await fs.mkdir(this.configDir, { recursive: true });
  }

  async loadConfigFile(): Promise<void> {
    const configFile = path.join(this.configDir, "config.json");
    if (!existsSync(configFile)) {
      await fs.writeFile(configFile, JSON.stringify({ env: {} }));
    }
    const configJson = await fs.readFile(
      `${xdgConfig}/auto-code/config.json`,
      "utf8"
    );
    const config = JSON.parse(configJson) as ConfigFile;
    // TODO: zod validation
    Object.assign(process.env, config.env);
  }

  async loadExcludeFrom(): Promise<void> {
    if (this.opts.excludeFrom) {
      const excludeFile = await fs.readFile(this.opts.excludeFrom, "utf8");
      this.opts.exclude = (this.opts.exclude || []).concat(
        excludeFile.split("\n").map((line) => line.trim())
      );
    }
  }

  getThread() {
    return this.opts.thread;
  }

  getPrompt() {
    return this.opts.prompt || "";
  }

  getOutputFile() {
    return this.opts.outputFile;
  }

  getWorkDir() {
    return process.cwd();
  }

  getModelCosts() {
    return getModelCosts(this.opts.model);
  }

  getModelName() {
    return getModelName(this.opts.model);
  }

  getThreadId() {
    return this.threadId;
  }

  getModel() {
    return getModel(this.opts.model);
  }

  getContext(): Promise<Context> {
    return context(this);
  }

  getContextType(): ContextType {
    return this.opts.contextType || "fs";
  }

  getContextFocus(): string[] | undefined {
    return this.opts.include || [];
  }

  getContextExcludes(): string[] | undefined {
    return this.opts.exclude || [];
  }

  getDatabase() {
    const dbPath = path.join(this.dataDir, "db.sqlite");
    this._database = Database.fromConnString(dbPath);
    return this._database;
  }

  toJSON() {
    return { ...this.opts };
  }
}
