import fs from "fs/promises";
import { Context, context, ContextType } from "../context/context";
import { getModel } from "../llm/getModel";

export type CommandConfigOptions = {
  contextType?: ContextType;
  contextExcludes?: string[];
  contextFocus?: string[];
  inputFile?: string;
  model?: string;
  prompt?: string;
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
