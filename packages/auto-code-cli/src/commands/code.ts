import fs from "fs/promises";
import { CommandConfig, CodeAgent } from "@autocode2/core";
import filesystemHandler from "../handlers/filesystem.js";
import messageHandler from "../handlers/message.js";
import traceHandler from "../handlers/trace_handler.js";

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

  const codeAgent = new CodeAgent({ config });

  filesystemHandler(codeAgent, config);
  messageHandler(codeAgent, config);
  const trace = traceHandler(codeAgent, config);

  await codeAgent.run();

  const outputFile = config.getOutputFile();
  if (outputFile) {
    await fs.writeFile(outputFile, JSON.stringify(trace, null, 2));
  }
}
