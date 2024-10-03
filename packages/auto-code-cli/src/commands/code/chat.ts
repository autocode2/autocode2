import { Flags } from "@oclif/core";
import { BaseCommand } from "../../baseCommand.js";
import { CodeAgent } from "@autocode2/core";
import { CommandConfigOptions } from "@autocode2/core/config/index.js";
import { Chat } from "@autocode2/ink";

export default class CodeChat extends BaseCommand<typeof CodeChat> {
  static override description = "Chat with the code agent";

  static override flags = {
    thread: Flags.string({
      char: "t",
      description: "Thread ID to use"
    }),
    model: Flags.string({
      char: "m",
      description: "Model name or alias to use (opus, sonnet, haiku)",
      default: "sonnet"
    })
  };

  protected override getConfigOptions(): CommandConfigOptions {
    const { model, thread } = this.flags;

    return {
      ...super.getConfigOptions(),
      thread,
      model
    };
  }

  public async run(): Promise<void> {
    const config = this.commandConfig;
    const codeAgent = new CodeAgent({ config });

    const chat = new Chat(codeAgent, config);
    await chat.run();
  }
}
