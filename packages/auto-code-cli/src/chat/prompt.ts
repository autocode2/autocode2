import { CodeAgent, CommandConfig } from "@autocode2/core";
import {
  createPrompt,
  useState,
  useKeypress,
  isEnterKey
} from "@inquirer/core";
import type { Prompt } from "@inquirer/type";
import chalk from "chalk";

type PromptConfig = {
  config?: CommandConfig;
  codeAgent?: CodeAgent;
};

const chatPrompt: Prompt<string, PromptConfig> = createPrompt<
  string,
  PromptConfig
>((config, done) => {
  const [value, setValue] = useState<string>("");
  const [state, setState] = useState<string>("idle");
  const promptString = "\uf061";
  const prefix =
    state === "idle"
      ? chalk.red.bold(promptString)
      : chalk.green.bold(promptString);
  const modelName = config.config?.getModelName();

  useKeypress((key, readline) => {
    if (isEnterKey(key)) {
      setState("done");
      done(value);
    } else {
      setValue(readline.line);
    }
  });

  return `${prefix} ${chalk.blue(`(${modelName})`)}: ${chalk.bold(value)}`;
});

export default chatPrompt;
