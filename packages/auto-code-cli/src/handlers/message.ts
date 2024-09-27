import { CodeAgent, CommandConfig } from "@autocode2/core";
import printUsage from "../utils/printUsage.js";

export default function messageHandler(
  agent: CodeAgent,
  config: CommandConfig
) {
  agent.on("start", async ({ run_id, thread_id }) => {
    console.log(`Starting run: ${run_id} - ${thread_id}`);
  });

  agent.on("end", async () => {
    const usage = agent.usage;
    const costs = config.getModelCosts();
    const modelName = config.getModelName();
    printUsage({ usage, costs, modelName });
  });

  agent.on("response", async (response) => {
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
  });
}
