import { CommandConfig, CodeAgent } from "@gingerhendrix/auto-code-core";
import * as filesystem from "@gingerhendrix/auto-code-core/dist/actions/filesystem";

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
  const context = await config.getContext();
  const resolvedPrompt = await config.getPrompt();
  const codeAgent = new CodeAgent();
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
}
