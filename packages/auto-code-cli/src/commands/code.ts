import { runCodeAgent } from "@gingerhendrix/auto-code-core";
import { CommandConfig } from "../config";

export type CodeCommandOptions = {
  inputFile?: string;
  model?: string;
};

export default async function codeCommand(
  prompt: string | undefined,
  opts: CodeCommandOptions
) {
  const config = new CommandConfig({
    ...opts,
    prompt
  });
  // Get config
  // Do pre-checks
  // Build Context
  // Send Request
  // Apply
  // Verify -> Fix
  // Complete
  const resolvedPrompt = await config.getPrompt();
  const response = await runCodeAgent(resolvedPrompt);

  console.log(response);
}
