import { edit } from "external-editor";
import React, { useEffect } from "react";
import { CodeAgent, CommandConfig } from "@autocode2/core";
import { Box, Static, Text, useApp, useInput } from "ink";
import Spinner from "ink-spinner";
import TextInput from "../components/TextInput.js";
import StaticMessageDisplay, {
  type StaticMessage
} from "../components/StaticMessage.js";
import { v4 as uuid } from "uuid";
import CommandMenu from "../components/CommandMenu.js";
import Usage from "../components/Usage.js";

export default function App({
  config,
  codeAgent
}: {
  config: CommandConfig;
  codeAgent: CodeAgent;
}) {
  const [firstRun, setFirstRun] = React.useState(true);
  const [showMenu, setShowMenu] = React.useState(false);
  const [showUsage, setShowUsage] = React.useState(false);
  const [working, setWorking] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState<StaticMessage[]>([]);
  const appendMessage = (message: StaticMessage) =>
    setMessages((messages) => [...messages, message]);

  const modelName = config.getModelName();
  const { exit } = useApp();

  useEffect(() => {
    codeAgent.on("response", (response) => {
      appendMessage({
        id: uuid(),
        response,
        type: "ai"
      });
    });
  }, [codeAgent]);

  async function sendMessage(message: string) {
    if (!message || message == "") return;
    setFirstRun(false);
    setMessage("");
    appendMessage({
      id: uuid(),
      content: message,
      type: "human"
    });
    setWorking(true);
    await codeAgent.run(message);
    setWorking(false);
  }

  function openInEditor() {
    const update = edit(message, {
      postfix: ".md"
    });
    setMessage(update);
  }

  async function selectMenuItem(value: string) {
    setShowMenu(false);
    if (value === "exit") {
      exit();
      return;
    }
    if (value === "editor") {
      openInEditor();
    }
    if (value === "usage") {
      setShowUsage(true);
    }
  }

  useInput((input, key) => {
    if (key.ctrl && input === "x") {
      openInEditor();
    }
    if (key.ctrl && input === "`") {
      setShowMenu((show) => !show);
    }
    if (showUsage) {
      setShowUsage(false);
    }
  });

  return (
    <Box flexDirection="column">
      <Static items={messages}>
        {(message) => (
          <StaticMessageDisplay message={message} key={message.id} />
        )}
      </Static>
      {firstRun && (
        <Box flexDirection="column">
          <Text>Welcome to Autocode</Text>
          <Text>{modelName}</Text>
        </Box>
      )}
      {!showMenu && !showUsage && (
        <Box flexDirection="row" gap={2}>
          {working && (
            <Text color="cyan">
              <Spinner type="dots" />
              {" >"}
            </Text>
          )}
          {!working && <Text color="blue">{">>>"}</Text>}
          <Box flexGrow={1}>
            <TextInput
              onChange={setMessage}
              value={message}
              onSubmit={sendMessage}
            />
          </Box>
        </Box>
      )}
      {showMenu && !showUsage && <CommandMenu onSelect={selectMenuItem} />}
      {showUsage && <Usage agent={codeAgent} />}
    </Box>
  );
}
