import { CodeAgentResponse } from "@autocode2/core";
import { Box, Text } from "ink";
import React from "react";

export type StaticMessage = StaticHumanMessage | StaticAIMessage;

export type StaticHumanMessage = {
  id: string;
  type: "human";
  content: string;
};

export type StaticAIMessage = {
  id: string;
  type: "ai";
  response: CodeAgentResponse;
};

export function isHumanMessage(
  message: StaticMessage
): message is StaticHumanMessage {
  return message.type === "human";
}

export function isAIMessage(
  message: StaticMessage
): message is StaticAIMessage {
  return message.type === "ai";
}

export function HumanMessageDisplay({
  message
}: {
  message: StaticHumanMessage;
}) {
  return (
    <Box key={message.id} marginBottom={1}>
      <Text color="whiteBright">󰍡 {message.content}</Text>
    </Box>
  );
}

export function AIMessageDisplay({ message }: { message: StaticAIMessage }) {
  const text = message.response.message;
  return (
    <Box flexDirection="column" flexGrow={1} marginLeft={2} marginBottom={1}>
      {text && text.length > 0 && (
        <Text color="blue">󰍧 {message.response.message}</Text>
      )}
      {message.response.actions.map((action, index) => (
        <Action action={action} key={index} />
      ))}
    </Box>
  );
}

export function Action({
  action
}: {
  action: CodeAgentResponse["actions"][0];
}) {
  if (action.name === "message") {
    return (
      <Box>
        <Text color="blue">󰇮 {action.args.message}</Text>
      </Box>
    );
  }
  if (action.name === "thinking") {
    return (
      <Box>
        <Text color="grey" dimColor>
           {action.args.message}
        </Text>
      </Box>
    );
  }
  if (action.name === "create-file") {
    return (
      <Box>
        <Text color="green">󰝒 {action.args.filename}</Text>
      </Box>
    );
  }
  if (action.name === "replace-file") {
    return (
      <Box>
        <Text color="green">󱇧 {action.args.filename}</Text>
      </Box>
    );
  }
  if (action.name === "remove-file") {
    return (
      <Box>
        <Text color="green">󱪡 {action.args.filename}</Text>
      </Box>
    );
  }
  return (
    <Box>
      <Text color="red">Unknown action - {action.name}</Text>
    </Box>
  );
}

export default function StaticMessageDisplay({
  message
}: {
  message: StaticMessage;
}) {
  if (isHumanMessage(message)) {
    return <HumanMessageDisplay message={message} />;
  }
  if (isAIMessage(message)) {
    return <AIMessageDisplay message={message} />;
  }
}
