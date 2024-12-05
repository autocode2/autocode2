import React from "react";
import { Box, Text } from "ink";
import { BaseMessage } from "@langchain/core/messages";
import { MessageContent } from "./MessageContent.js";

export function Message({
  message,
  prefix,
  marginLeft,
  color,
  children
}: {
  message: BaseMessage;
  prefix: string;
  marginLeft: number;
  color: string;
  children?: React.ReactNode;
}) {
  return (
    <Box width="90%">
      <Box flexDirection="row" marginBottom={1}>
        <Box marginLeft={marginLeft} marginRight={2}>
          <Text color={color}>{prefix}</Text>
        </Box>
        <Box flexDirection="column">
          <MessageContent content={message.content} color={color} />
          <Box flexDirection="column">{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}
