import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  MessageContentText,
  SystemMessage
} from "@langchain/core/messages";
import { StructuredTool } from "@langchain/core/tools";
import {
  END,
  MemorySaver,
  START,
  StateGraph,
  StateGraphArgs
} from "@langchain/langgraph";
import { getModel } from "../llm/getModel";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { sendMessage, thinking } from "../tools/messages";
import { createFile, removeFile, replaceFile } from "../tools/filetools";

export const systemPrompt = `You are an AI coding tool. Help the user with their coding tasks using the tools provided.

You will be given information about the current project in a <Context></Context> element.  This will include the full contents of files in the project, using <File></File> elements.

Use the following tools to perform the task:
 - message: Send a message to the user
 - replace-file: Replace the contents of a file, ensure that the full contents of the file are provided.
 - add-file: Add a new file
 - remove-file: Remove a file

You may call multiple tools in a single response.  You may also call the same tool multiple times. Call all the necessary tools to complete the users request.
`;

export const allTools: StructuredTool[] = [
  sendMessage,
  //thinking,
  createFile,
  removeFile,
  replaceFile
];

export type ToolAction = {
  name: string;
  args: any;
};

export type CodeAgentResponse = {
  message: string;
  actions: ToolAction[];
};

export async function runCodeAgent(query: string) {
  const model = getModel().bind({
    tools: allTools
    //tool_choice: "required", // required is only supported by openai
  });
  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(query)
  ]);
  const message = Array.isArray(response.content)
    ? response.content
        .filter((m) => m.type === "text")
        .map((m) => (m as MessageContentText).text)
        .join("\n")
    : response.content;

  return {
    message,
    actions: (response.tool_calls || []).map((toolCall) => ({
      name: toolCall.name,
      args: toolCall.args
    }))
  };
}
