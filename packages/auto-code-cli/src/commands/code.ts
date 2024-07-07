import { runCodeAgent } from "@gingerhendrix/auto-code-core";

export type CodeCommandOptions = {
  inputFile: string;
  model: string;
};

export default async function codeCommand(
  query: string,
  opts: CodeCommandOptions
) {
  const response = await runCodeAgent(query);

  console.log(response);
}
