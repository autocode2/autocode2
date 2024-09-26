import { CodeAgent, CommandConfig } from "@autocode2/core";
import { default as TtyTable } from "tty-table";

const A_MILLION = 1000000;

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
    const inputCost = (usage.input_tokens * costs.input) / A_MILLION;
    const outputCost = (usage.output_tokens * costs.output) / A_MILLION;
    const cacheCreationCost =
      (usage.cache_creation_input_tokens * (costs.cache_creation_input || 0)) /
      A_MILLION;
    const cacheReadCost =
      (usage.cache_read_input_tokens * (costs.cache_read_input || 0)) /
      A_MILLION;
    const totalCost =
      inputCost + cacheCreationCost + cacheReadCost + outputCost;
    const totalTokens =
      usage.input_tokens +
      usage.cache_read_input_tokens +
      usage.cache_creation_input_tokens +
      usage.output_tokens;

    const header = [
      { value: modelName, width: 20 },
      { value: "Tokens", width: 20 },
      { value: "Cost", width: 20 }
    ];
    const hasCache =
      usage.cache_creation_input_tokens > 0 ||
      usage.cache_read_input_tokens > 0;
    const rows = [
      ["Input", usage.input_tokens, inputCost],
      hasCache
        ? [
            "Cache Creation",
            usage.cache_creation_input_tokens,
            cacheCreationCost
          ]
        : null,
      hasCache
        ? ["Cache Read", usage.cache_read_input_tokens, cacheReadCost]
        : null,
      ["Output", usage.output_tokens, outputCost],
      ["Total", totalTokens, totalCost]
    ].filter(Boolean);
    const options = {};

    const usageTable = TtyTable(header, rows, options).render();
    console.log(`Model: ${modelName}\n`);
    console.log(usageTable);
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
