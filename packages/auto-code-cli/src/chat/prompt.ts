import { CodeAgent, CommandConfig } from "@autocode2/core";
import {
  createPrompt,
  useState,
  useKeypress,
  isEnterKey,
  KeypressEvent,
  useEffect
} from "@inquirer/core";
import { confirm, editor, search } from "@inquirer/prompts";
import type { Prompt } from "@inquirer/type";
import chalk from "chalk";
import ansiEscapes from "ansi-escapes";

type PromptConfig = {
  config?: CommandConfig;
  codeAgent?: CodeAgent;
  message?: string;
};

// ctrl+space
const isCommandKey = (key: KeypressEvent) => key.name === "`" && key.ctrl;

export type MenuItem = {
  name: string;
  description: string;
};
const menuItems = [
  { name: "editor", description: "Open prompt in editor", value: "editor" },
  { name: "usage", description: "Show usage", value: "usage" },
  { name: "paste", description: "Paste from clipboard", value: "paste" },
  { name: "attach", description: "Attach File", value: "attach" }
];

type ChatInput = {
  message: string;
  action: "message" | "menu";
};

const chatPrompt: Prompt<ChatInput, PromptConfig> = createPrompt<
  ChatInput,
  PromptConfig
>((config, done) => {
  const [value, setValue] = useState<string>(config.message || "");
  const [state, setState] = useState<string>("idle");
  const promptString = "\uf061";
  const prefix =
    state === "idle"
      ? chalk.red.bold(promptString)
      : chalk.green.bold(promptString);
  const modelName = config.config?.getModelName();

  useEffect((rl) => {
    rl.write(value);
  }, []);

  useKeypress((key, readline) => {
    if (isEnterKey(key)) {
      setState("done");
      done({ message: value, action: "message" });
    }
    if (isCommandKey(key)) {
      setState("waiting");
      done({ message: value, action: "menu" });
    } else {
      setValue(readline.line);
    }
  });

  return `${prefix} ${chalk.blue(`(${modelName})`)}: ${chalk.bold(value)}`;
});

const prompt = async (
  { config, codeAgent }: PromptConfig,
  previousMessage?: string
) => {
  // eslint-disable-next-line prefer-const
  let { message, action } = await chatPrompt({
    config,
    codeAgent,
    message: previousMessage
  });
  if (action === "menu") {
    const menuChoice = await search({
      message: "Choose an action",
      source: async (term: string | undefined) => {
        return menuItems.filter((item) =>
          term ? item.name.startsWith(term) : true
        );
      }
    });
    if (menuChoice === "editor") {
      const editedMessage = await editor({
        default: message,
        waitForUseInput: false,
        message: "Open in Editor"
      });
      process.stdout.write(chalk.bold(editedMessage) + "\n");

      const shouldContinue = await confirm({
        message: "Send?",
        default: true
      });
      if (shouldContinue) {
        return editedMessage;
      }
    }
    console.log(menuChoice);
    process.stdout.write(ansiEscapes.eraseLines(4));
    return await prompt({ config, codeAgent }, message);
  }

  console.log("message", message);
  return message;
};

export default prompt;
