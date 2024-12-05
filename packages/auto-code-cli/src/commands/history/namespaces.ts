import { renderNamespaces } from "@autocode2/ink";
import { BaseCommand } from "../../baseCommand.js";

export default class Namespaces extends BaseCommand<typeof Namespaces> {
  static override description = "List all namespaces";

  static override examples = ["<%= config.bin %> <%= command.id %>"];

  public async run(): Promise<void> {
    const db = this.commandConfig.getDatabase();
    const namespaces = db.getNamespaces();
    await renderNamespaces(namespaces);
  }
}
