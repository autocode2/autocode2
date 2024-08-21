import { CodeAgent, CommandConfig } from "@autocode2/core";

export default function messageHandler(
  agent: CodeAgent,
  config: CommandConfig
) {
  agent.on("start", async ({ run_id, thread_id }) => {
    console.log(`Starting run: ${run_id} - ${thread_id}`);
    const context = await config.getContext();
    console.log("Context: ");
    context.files.forEach((file) => {
      console.log(`${file.path} ${file.content.length} bytes`);
    });
  });

  agent.on("end", async () => {
    const usage = agent.usage;
    const costs = config.getModelCosts();
    const modelName = config.getModelName();
    const inputCost = (usage.input_tokens * costs.input) / 1000000;
    const outputCost = (usage.output_tokens * costs.output) / 1000000;
    const totalCost = inputCost + outputCost;

    console.log(`Model: ${modelName}`);
    console.log(
      `Tokens: ${usage.total_tokens} (${usage.input_tokens} input, ${usage.output_tokens} output)`
    );
    console.log(
      `Cost:  ${totalCost} (${inputCost} input, ${outputCost} output)`
    );
  });

  agent.on("response", async (response) => {
    if (response.message) {
      console.log(response.message);
    }
    for (const action of response.actions) {
      if (action.name === "message") {
        console.log(action.args.message);
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
