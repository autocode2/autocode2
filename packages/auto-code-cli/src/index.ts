import { program } from "@commander-js/extra-typings";
import codeCommand from "./commands/code";

program
  .command("code")
  .description("Generate code")
  .argument("[message]", "Message to generate code for")
  .option("-i, --input-file <file>", "Read message from file")
  .option(
    "-m, --model <name>",
    "Model name or alias to use (opus, sonnet, haiku)",
    "sonnet"
  )
  .action(codeCommand);

program.parseAsync().catch((error) => {
  console.error(error);
  process.exit(1);
});
