import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";

export const defaultModel = "sonnet";

export type TokenCostsPerMillion = {
  input: number;
  output: number;
  cache_creation_input?: number;
  cache_read_input?: number;
};

export const modelAliases: { [key: string]: string } = {
  opus: "claude-3-opus-20240229",
  sonnet: "claude-3-5-sonnet-20240620",
  haiku: "claude-3-haiku-20240307",
  gpt: "gpt-4o",
  "gpt-4o": "gpt-4o",
  "gpt-mini": "gpt-4o-mini",
  "gpt-4o-mini": "gpt-4o-mini"
};

export const modelCosts = {
  "claude-3-opus-20240229": { input: 15.0, output: 75.0 },
  "claude-3-sonnet-20240229": { input: 3.0, output: 15.0 },
  "claude-3-5-sonnet-20240620": {
    input: 3.0,
    output: 15.0,
    cache_read_input: 0.3,
    cache_creation_input: 3.75
  },
  "claude-3-haiku-20240307": {
    input: 0.25,
    output: 1.25,
    cache_read_input: 0.03,
    cache_creation_input: 0.3
  },
  "gpt-4o": { input: 5.0, output: 15.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 }
} as Record<
  string,
  {
    input: number;
    output: number;
    cache_creation_input?: number;
    cache_read_input?: number;
  }
>;

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
      temperature: 0.0,
      maxTokens: 4096,
      clientOptions: {
        defaultHeaders: {
          "anthropic-beta": "prompt-caching-2024-07-31"
        }
      }
      //headers: {
      //'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
      //}
    });
  } else {
    return new ChatOpenAI({
      model: name,
      temperature: 0.0,
      maxTokens: name === "gpt-4o" ? 4096 : 16384
    });
  }
}
