import { CodeAgent, CommandConfig } from "@autocode2/core";
import filesystemHandler from "../handlers/filesystem.js";
import { input } from "@inquirer/prompts";
import { Events } from "@autocode2/core/agents/CodeAgent.js";
import printUsage from "../utils/printUsage.js";

export class Chat {
  constructor(
    private codeAgent: CodeAgent,
    private config: CommandConfig
  ) {}

  public async run(): Promise<void> {
    filesystemHandler(this.codeAgent, this.config);

    this.codeAgent.on("response", (response) => this.handleResponse(response));
    await this.getNextInput();
  }

  public async getNextInput() {
    const message = await input({
      message: ">>>"
    });
    if (message === "exit") {
      await this.handleExit();
      return;
    }
    await this.codeAgent.run(message);
    await this.getNextInput();
  }

  public async handleExit() {
    const usage = this.codeAgent.usage;
    const costs = this.config.getModelCosts();
    const modelName = this.config.getModelName();
    printUsage({ usage, costs, modelName });
  }

  public async handleResponse(response: Events["response"]) {
    if (response.message) {
      console.log(response.message);
    }
    for (const action of response.actions) {
      if (action.name === "message") {
        console.log("Message:" + action.args.message);
      }
      if (action.name === "thinking") {
        console.log("Thinking... ", action.args);
      }
      if (action.name === "create-file") {
        console.log("Creating file: ", action.args.filename);
      }
      if (action.name === "replace-file") {
        console.log("Replacing file: ", action.args.filename);
      }
      if (action.name === "remove-file") {
        console.log("Removing file: ", action.args.filename);
      }
    }
  }
}
