import { CommandConfig, CodeAgent, filesystem } from "@autocode2/core";
import { modelCosts } from "@autocode2/core/llm/getModel.js";

export type CodeCommandOptions = {
  inputFile?: string;
  model?: string;
  exclude?: string[];
  include?: string[];
  excludeFrom?: string;
};

export default async function codeCommand(
  prompt: string | undefined,
  opts: CodeCommandOptions
) {
  const config = new CommandConfig({
    ...opts,
    prompt
  });
  await config.init();
  // Get config
  // Do pre-checks
  // Build Context
  // Send Request
  // Apply
  // Verify -> Fix
  // Complete
  const context = await config.getContext();
  const resolvedPrompt = await config.getPrompt();
  const codeAgent = new CodeAgent({ config });
  //const response = await runCodeAgent({ query: resolvedPrompt, context });
  codeAgent.on("response", async (response) => {
    console.log(response.message);
    for (const action of response.actions) {
      if (action.name === "thinking") {
        console.log("Thinking... ", action.args);
      } else if (action.name === "create-file") {
        console.log("Creating file: ", action.args.filename);
        await filesystem.createFile(
          {
            filename: action.args.filename as string,
            contents: action.args.contents as string
          },
          config
        );
      } else if (action.name === "replace-file") {
        console.log("Replacing file: ", action.args.filename);
        await filesystem.replaceFile(
          {
            filename: action.args.filename as string,
            contents: action.args.contents as string
          },
          config
        );
      } else if (action.name === "remove-file") {
        console.log("Removing file: ", action.args.filename);
        await filesystem.removeFile(
          {
            filename: action.args.filename as string
          },
          config
        );
      } else {
        console.log("Unknown action: ", action);
      }
    }
  });

  await codeAgent.run({ query: resolvedPrompt, context });

  const usage = codeAgent.usage;
  const costs = config.getModelCosts();
  const modelName = config.getModelName();
  const inputCost = (usage.input_tokens * costs.input) / 1000000;
  const outputCost = (usage.output_tokens * costs.output) / 1000000;
  const totalCost = inputCost + outputCost;

  console.log(`Model: ${modelName}`);
  console.log(
    `Tokens: ${usage.total_tokens} (${usage.input_tokens} input, ${usage.output_tokens} output)`
  );
  console.log(`Cost:  ${totalCost} (${inputCost} input, ${outputCost} output)`);
}
