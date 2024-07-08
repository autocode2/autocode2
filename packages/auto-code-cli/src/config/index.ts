import fs from "fs/promises";

export type CommandConfigOptions = {
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
}
