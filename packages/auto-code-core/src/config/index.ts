import fs from "fs/promises";
import { Context, context, ContextType } from "../context/context.js";
import { getModel, getModelName, getModelCosts } from "../llm/getModel.js";
import { xdgConfig } from "xdg-basedir";
import { existsSync } from "node:fs";
import { BaseCheckpointSaver, MemorySaver } from "@langchain/langgraph";

export type CommandConfigOptions = {
  contextType?: ContextType;
  inputFile?: string;
  outputFile?: string;
  model?: string;
  prompt?: string;
  include?: string[];
  exclude?: string[];
  excludeFrom?: string;
};

export type ConfigFile = {
  env: Record<string, string>;
};

export class CommandConfig {
  constructor(public opts: CommandConfigOptions) {}

  async init() {
    await this.loadConfigFile();
    await this.loadExcludeFrom();
    if (this.opts.inputFile) {
      this.opts.prompt = await fs.readFile(this.opts.inputFile, "utf8");
    }
  }

  async loadConfigFile(): Promise<void> {
    if (!xdgConfig) {
      console.warn("No XDG_CONFIG_HOME found, skipping config file load");
      return;
    }
    if (!existsSync(`${xdgConfig}/auto-code/config.json`)) {
      await fs.mkdir(`${xdgConfig}/auto-code`, { recursive: true });
      await fs.writeFile(
        `${xdgConfig}/auto-code/config.json`,
        JSON.stringify({ env: {} })
      );
    }
    const configFile = await fs.readFile(
      `${xdgConfig}/auto-code/config.json`,
      "utf8"
    );
    const config = JSON.parse(configFile) as ConfigFile;
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

  getCheckpointer(): BaseCheckpointSaver {
    return new MemorySaver();
  }
}
