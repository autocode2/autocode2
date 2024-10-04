import React, { useEffect } from "react";
import { CodeAgent, CommandConfig } from "@autocode2/core";
import { Box, Static, Text } from "ink";
import TextInput from "ink-text-input";
import StaticMessageDisplay, { type StaticMessage } from "./StaticMessage.js";
import { v4 as uuid } from "uuid";

export default function App({
  config,
  codeAgent
}: {
  config: CommandConfig;
  codeAgent: CodeAgent;
}) {
  const [firstRun, setFirstRun] = React.useState(true);
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState<StaticMessage[]>([]);
  const appendMessage = (message: StaticMessage) =>
    setMessages((messages) => [...messages, message]);

  const modelName = config.getModelName();

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

  return (
    <Box flexDirection="column">
      <Static items={messages}>
        {(message) => (
          <StaticMessageDisplay message={message} key={message.id} />
        )}
      </Static>
      {firstRun && <Text>Welcome to Autocode</Text>}
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
    </Box>
  );
}
