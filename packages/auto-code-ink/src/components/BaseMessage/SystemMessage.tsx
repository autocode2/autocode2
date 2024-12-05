import React from "react";
import { Text } from "ink";
import { BaseMessage as BaseMessageType } from "@langchain/core/messages";

export function SystemMessage({ message }: { message: BaseMessageType }) {
  let textContent = "";
  if (typeof message.content === "string") {
    textContent = message.content;
  } else if (Array.isArray(message.content)) {
    textContent = message.content
      .map((part) => (part.type === "text" ? part.text : "") as string)
      .join("");
  }
  const lines = textContent.split("\n");
  const contextStart = lines.findIndex((line) => line.includes("<Context>"));
  const systemMessage = [...lines.slice(0, contextStart)].join("\n");
  return <Text color="yellow">{systemMessage}</Text>;
}
