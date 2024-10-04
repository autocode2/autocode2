import React, { useEffect } from "react";
import { CodeAgent, CommandConfig } from "@autocode2/core";
import { Box, Static, Text } from "ink";
import TextInput from "ink-text-input"

type Message = {
  id: string;
  content: string;
};

export default function App({
  config: _config,
  codeAgent: codeAgent,
}: {
  config: CommandConfig,
  codeAgent: CodeAgent,
}) {
  const [firstRun, setFirstRun] = React.useState(true);
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);

  useEffect(() => {
    codeAgent.on("response", (response) => console.log(response))
  }, [codeAgent]);

  async function sendMessage(message: string) {
    setFirstRun(false);
    setMessage("");
    setMessages([...messages, { id: `${Math.random()}`, content: message }]);
    //await codeAgent.run(message);
  }

  return (
    <Box flexDirection="column">
      <Static items={messages}>
				{message => (
					<Box key={message.id}>
						<Text color="green">✔ {message.content}</Text>
					</Box>
				)}
			</Static>
      {firstRun && (
        <Text>
          Welcome to Autocode
        </Text>
      )}
      <Box flexDirection="row" gap={2}>
        <Text color="blue">{">>>"}</Text>
        <Box flexGrow={1}>
          <TextInput onChange={setMessage} value={message} onSubmit={sendMessage} />
        </Box>
        <Text>claude</Text>
      </Box>
    </Box>
  );
};
