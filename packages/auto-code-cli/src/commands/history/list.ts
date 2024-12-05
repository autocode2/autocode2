import { Flags } from "@oclif/core";
import { BaseCommand } from "../../baseCommand.js";
import { renderThreads } from "@autocode2/ink";

export default class List extends BaseCommand<typeof List> {
  static override description = "List all Agent threads";

  static override examples = ["<%= config.bin %> <%= command.id %>"];

  static override flags = {
    namespace: Flags.string({
      default: process.cwd(),
      description: "Agent namespace",
      helpGroup: "GLOBAL",
      summary: "Specify .",
      char: "n"
    })
  };

  public async run(): Promise<void> {
    const db = this.commandConfig.getDatabase();
    const namespace = this.flags.namespace;
    const threadInfo = db.getThreads({ namespace });

    await renderThreads(threadInfo);
  }
}
