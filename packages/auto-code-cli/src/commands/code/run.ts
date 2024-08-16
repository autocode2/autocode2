import { Args, Flags } from "@oclif/core";
import { BaseCommand } from "../../baseCommand.js";
import fs from "fs/promises";
import { CodeAgent } from "@autocode2/core";
import filesystemHandler from "../../handlers/filesystem.js";
import messageHandler from "../../handlers/message.js";
import traceHandler from "../../handlers/trace_handler.js";
import { CommandConfigOptions } from "@autocode2/core/config/index.js";

export default class CodeRun extends BaseCommand<typeof CodeRun> {
  static override description = "Run the code agent";

  static override examples = ["<%= config.bin %> <%= command.id %>"];

  static override args = {
    prompt: Args.string({
      name: "prompt",
      description: "Message to send to the code agent"
    })
  };

  static override flags = {
    inputFile: Flags.string({
      char: "i",
      description: "Read message from file",
      allowStdin: true,
      aliases: ["input-file"]
    }),
    outputFile: Flags.string({
      char: "o",
      description: "Write trace output to file",
      aliases: ["output-file"]
    }),
    model: Flags.string({
      char: "m",
      description: "Model name or alias to use (opus, sonnet, haiku)",
      default: "sonnet"
    })
  };

  protected override getConfigOptions(): CommandConfigOptions {
    const { prompt } = this.args;
    const { inputFile, outputFile, model } = this.flags;

    return {
      ...super.getConfigOptions(),
      prompt,
      inputFile,
      outputFile,
      model
    };
  }

  public async run(): Promise<void> {
    const config = this.commandConfig;
    const codeAgent = new CodeAgent({ config });

    filesystemHandler(codeAgent, config);
    messageHandler(codeAgent, config);
    const trace = traceHandler(codeAgent, config);

    await codeAgent.run();

    const outputFile = config.getOutputFile();
    if (outputFile) {
      await fs.writeFile(outputFile, JSON.stringify(trace, null, 2));
    }
  }
}
