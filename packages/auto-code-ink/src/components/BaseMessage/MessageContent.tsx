import React from "react";
import { Box, Text } from "ink";
import { MessageContent as MessageContentType } from "@langchain/core/messages";
import { ContentPart } from "./ContentPart.js";

export function MessageContent({
  content,
  color
}: {
  content: MessageContentType;
  color?: string;
}) {
  if (typeof content === "string") {
    return <Text color={color}>{content}</Text>;
  } else {
    return (
      <Box flexDirection="column">
        {content.map((part, index) => (
          <ContentPart part={part} key={index} color={color} />
        ))}
      </Box>
    );
  }
}
