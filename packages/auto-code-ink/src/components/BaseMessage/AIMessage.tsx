import React from "react";
import { AIMessage as AIMessageType } from "@langchain/core/messages";
import { Message } from "./Message.js";
import { ToolCall } from "./ToolCall.js";

export function AIMessage({ message }: { message: AIMessageType }) {
  return (
    <Message message={message} prefix="󰍧" marginLeft={2} color="blue">
      {message.tool_calls &&
        message.tool_calls.map((tool_call, index) => (
          <ToolCall key={index} tool_call={tool_call} />
        ))}
    </Message>
  );
}
