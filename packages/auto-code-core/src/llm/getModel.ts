import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";

export const defaultModel = "sonnet";

export const modelAliases: { [key: string]: string } = {
  opus: "claude-3-opus-20240229",
  sonnet: "claude-3-5-sonnet-20240620",
  haiku: "claude-3-haiku-20240307",
  gpt: "gpt-4o"
};

export const modelCosts = {
  "claude-3-opus-20240229": { input: 15.0, output: 75.0 },
  "claude-3-sonnet-20240229": { input: 3.0, output: 15.0 },
  "claude-3-5-sonnet-20240620": { input: 3.0, output: 15.0 },
  "claude-3-haiku-20240307": { input: 0.25, output: 1.25 },
  "gpt-4o": { input: 5.0, output: 15.0 }
} as Record<string, { input: number; output: number }>;

export function getModelName(model: string = defaultModel) {
  return modelAliases[model] || model;
}

export function getModelCosts(model: string = defaultModel) {
  const name = modelAliases[model] || model;
  return modelCosts[name] || { input: 0, output: 0 };
}

export function getModel(
  model: string = defaultModel
): ChatOpenAI | ChatAnthropic {
  const name = modelAliases[model] || model;
  if (name.startsWith("claude")) {
    return new ChatAnthropic({
      model: name,
      temperature: 0.0
    });
  } else {
    return new ChatOpenAI({
      model: name,
      temperature: 0.0
    });
  }
}
