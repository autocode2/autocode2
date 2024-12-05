import React from "react";
import { Text } from "ink";
import { ToolCall as ToolCallType } from "@langchain/core/messages/tool";

export function ToolCall({ tool_call }: { tool_call: ToolCallType }) {
  return (
    <Text color="blue">
      <Text bold>Tool Call</Text>
      <Text>{` ${tool_call.name}`}</Text>
      {tool_call.args && tool_call.args.filename && (
        <Text>{` ${tool_call.args.filename}`}</Text>
      )}
    </Text>
  );
}
