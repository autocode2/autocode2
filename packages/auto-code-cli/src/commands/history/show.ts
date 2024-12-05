import { Args } from "@oclif/core";
import { BaseCommand } from "../../baseCommand.js";
import { CommandConfigOptions } from "@autocode2/core/config/index.js";
import { CodeAgent } from "@autocode2/core";
import { renderHistory } from "@autocode2/ink";

export default class Show extends BaseCommand<typeof Show> {
  static override description = "Show thread history";

  static override examples = ["<%= config.bin %> <%= command.id %>"];

  static override args = {
    thread: Args.string({
      name: "thread",
      description: "Thread ID to use"
    })
  };

  public async run(): Promise<void> {
    const config = this.commandConfig;
    const codeAgent = new CodeAgent({ config });

    await codeAgent.initRun();

    await renderHistory(await codeAgent.getMessages());
  }

  protected override getConfigOptions(): CommandConfigOptions {
    const { thread } = this.args;

    return {
      ...super.getConfigOptions(),
      ...(thread ? { thread } : { continue: true })
    };
  }
}
