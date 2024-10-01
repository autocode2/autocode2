import React from "react";
import Table from "./Table.js";
import { CodeAgent } from "@autocode2/core";

export default function Usage({ agent }: { agent: CodeAgent }) {
  const usage = agent.usage;
  const costs = agent.config.getModelCosts();

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

  const data = [
    { type: "Input", tokens: usage.input_tokens, cost: inputCost.toFixed(5) },
    {
      type: "Cache Read",
      tokens: usage.cache_read_input_tokens,
      cost: cacheReadCost.toFixed(5)
    },
    {
      type: "Cache Creation",
      tokens: usage.cache_creation_input_tokens,
      cost: cacheCreationCost.toFixed(5)
    },
    {
      type: "Output",
      tokens: usage.output_tokens,
      cost: outputCost.toFixed(5)
    },
    { type: "Total", tokens: totalTokens, cost: totalCost.toFixed(5) }
  ];

  return <Table data={data} />;
}
