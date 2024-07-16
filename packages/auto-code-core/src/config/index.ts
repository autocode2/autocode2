import fs from "fs/promises";
import { Context, context, ContextType } from "../context/context";
import { getModel } from "../llm/getModel";
import { xdgConfig } from "xdg-basedir";

export type CommandConfigOptions = {
  contextType?: ContextType;
  contextExcludes?: string[];
  contextFocus?: string[];
  inputFile?: string;
  model?: string;
  prompt?: string;
};

export type ConfigFile = {
  env: Record<string, string>;
};

export class CommandConfig {
  constructor(public opts: CommandConfigOptions) {}

  async getPrompt() {
    if (this.opts.inputFile) {
      return await fs.readFile(this.opts.inputFile, "utf8");
    } else {
      return this.opts.prompt || "";
    }
  }

  async loadConfigFile(): Promise<void> {
    if (!xdgConfig) {
      console.warn("No XDG_CONFIG_HOME found, skipping config file load");
      return;
    }
    if (!(await fs.stat(`${xdgConfig}/auto-code/config.json`)).isFile()) {
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

  getWorkDir() {
    return process.cwd();
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
    return this.opts.contextFocus;
  }

  getContextExcludes(): string[] | undefined {
    return this.opts.contextExcludes;
  }
}
