import { edit } from "external-editor";
import React, { useEffect } from "react";
import { CodeAgent, CommandConfig } from "@autocode2/core";
import { Box, Static, Text, useApp, useInput } from "ink";
import TextInput from "./components/TextInput.js";
import StaticMessageDisplay, { type StaticMessage } from "./StaticMessage.js";
import { v4 as uuid } from "uuid";
import { Select } from "@inkjs/ui";

export default function App({
  config,
  codeAgent
}: {
  config: CommandConfig;
  codeAgent: CodeAgent;
}) {
  const [firstRun, setFirstRun] = React.useState(true);
  const [showMenu, setShowMenu] = React.useState(false);
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
    await codeAgent.run(message);
  }

  async function selectMenuItem(value: string) {
    setShowMenu(false);
    if (value === "exit") {
      exit();
      return;
    }
    if (value === "editor") {
      const update = edit(message, {
        postfix: ".md"
      });
      setMessage(update);
    }
  }

  useInput((input, key) => {
    if (key.ctrl && input === "`") {
      setShowMenu((show) => !show);
    }
  });

  return (
    <Box flexDirection="column">
      <Static items={messages}>
        {(message) => (
          <StaticMessageDisplay message={message} key={message.id} />
        )}
      </Static>
      {firstRun && <Text>Welcome to Autocode</Text>}
      {!showMenu && (
        <Box flexDirection="row" gap={2}>
          <Text color="blue">{">>>"}</Text>
          <Box flexGrow={1}>
            <TextInput
              onChange={setMessage}
              value={message}
              onSubmit={sendMessage}
            />
          </Box>
          <Text>{modelName}</Text>
        </Box>
      )}
      {showMenu && (
        <Box padding={2} flexDirection="column" gap={1}>
          <Select
            options={[
              {
                label: "Open in editor",
                value: "editor"
              },
              {
                label: "Exit",
                value: "exit"
              }
            ]}
            onChange={selectMenuItem}
          />
        </Box>
      )}
    </Box>
  );
}
