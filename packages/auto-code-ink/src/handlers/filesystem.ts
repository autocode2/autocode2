import { CodeAgent, CommandConfig, filesystem } from "@autocode2/core";

export default function filesystemHandler(
  agent: CodeAgent,
  config: CommandConfig
) {
  agent.on("response", async (response) => {
    for (const action of response.actions) {
      if (action.name === "create-file") {
        await filesystem.createFile(
          {
            filename: action.args.filename as string,
            contents: action.args.contents as string
          },
          config
        );
      } else if (action.name === "replace-file") {
        await filesystem.replaceFile(
          {
            filename: action.args.filename as string,
            contents: action.args.contents as string
          },
          config
        );
      } else if (action.name === "remove-file") {
        await filesystem.removeFile(
          {
            filename: action.args.filename as string
          },
          config
        );
      }
    }
  });
}
