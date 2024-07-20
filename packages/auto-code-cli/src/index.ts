import { program } from "@commander-js/extra-typings";
import codeCommand from "./commands/code.js";
import { showContextCommand } from "./commands/context.js";

program
  .command("code")
  .description("Generate code")
  .argument("[message]", "Message to generate code for")
  .option("-x, --exclude <patterns...>", "Exclude files matching patterns")
  .option("--include <patterns...>", "Include files matching patterns")
  .option(
    "--exclude-from <file>",
    "Exclude files matching patterns contained in file"
  )
  .option("-i, --input-file <file>", "Read message from file")
  .option(
    "-m, --model <name>",
    "Model name or alias to use (opus, sonnet, haiku)",
    "sonnet"
  )
  .action(codeCommand);

program
  .command("show-context")
  .description("Show the context sent to the LLM")
  .option("-x, --exclude <patterns...>", "Exclude files matching patterns")
  .option("--include <patterns...>", "Include files matching patterns")
  .option(
    "--exclude-from <file>",
    "Exclude files matching patterns contained in file"
  )
  .description("Show the context sent to the LLM")
  .action(showContextCommand);

program.parseAsync().catch((error) => {
  console.error(error);
  process.exit(1);
});
