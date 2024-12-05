import React from "react";
import { Text } from "ink";
import { MessageContentComplex } from "@langchain/core/messages";

export function ContentPart({
  part,
  color
}: {
  part: MessageContentComplex;
  color?: string;
}) {
  if (part.type === "text") {
    return <Text color={color}>{part.text}</Text>;
  }
  if (part.type === "tool_use") {
    return <Text></Text>;
  }
  return <Text color={color}>{JSON.stringify(part)}</Text>;
}
