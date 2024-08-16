import { BaseCommand } from "../../baseCommand.js";

export default class ContextList extends BaseCommand<typeof ContextList> {
  static override description = "List the files sent to the LLM as context";

  static override examples = ["<%= config.bin %> <%= command.id %>"];

  public async run(): Promise<void> {
    const context = await this.commandConfig.getContext();

    context.files.forEach((file) => {
      this.log(`${file.path} ${file.content.length} bytes`);
    });
    this.log(
      "Total bytes: ",
      context.files.reduce((acc, file) => acc + file.content.length, 0)
    );
  }
}
