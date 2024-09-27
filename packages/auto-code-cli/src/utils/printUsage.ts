import { UsageMetadata } from "@autocode2/core/agents/CodeAgent.js";
import { TokenCostsPerMillion } from "@autocode2/core/llm/getModel.js";
import { default as TtyTable } from "tty-table";

export default function printUsage({
  usage,
  costs,
  modelName
}: {
  usage: UsageMetadata;
  costs: TokenCostsPerMillion;
  modelName: string;
}) {
  const A_MILLION = 1000000;

  const inputCost = (usage.input_tokens * costs.input) / A_MILLION;
  const outputCost = (usage.output_tokens * costs.output) / A_MILLION;
  const cacheCreationCost =
    (usage.cache_creation_input_tokens * (costs.cache_creation_input || 0)) /
    A_MILLION;
  const cacheReadCost =
    (usage.cache_read_input_tokens * (costs.cache_read_input || 0)) / A_MILLION;
  const totalCost = inputCost + cacheCreationCost + cacheReadCost + outputCost;
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
    usage.cache_creation_input_tokens > 0 || usage.cache_read_input_tokens > 0;
  const rows = [
    ["Input", usage.input_tokens, inputCost],
    hasCache
      ? ["Cache Creation", usage.cache_creation_input_tokens, cacheCreationCost]
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
}
