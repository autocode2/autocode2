import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import { StructuredTool } from "@langchain/core/tools";
import { END, START, StateGraph, StateGraphArgs } from "@langchain/langgraph";
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
`;

export type State = {
  messages: BaseMessage[];
};

export const stateChannels: StateGraphArgs<State>["channels"] = {
  messages: {
    value: (x?: BaseMessage[], y?: BaseMessage[]) => (x ?? []).concat(y ?? []),
    default: () => []
  }
};

export const initialState: State = {
  messages: [new SystemMessage(systemPrompt)]
};

export const allTools: StructuredTool[] = [
  sendMessage,
  thinking,
  createFile,
  removeFile,
  replaceFile
];

const toolsNode = new ToolNode<State>(allTools);

const modelNode = async (state: State) => {
  const model = getModel().bind({
    tools: allTools
    //tool_choice: "required", // required is only supported by openai
  });
  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    ...state.messages
  ]);
  return { messages: [response] };
};

export const graph = new StateGraph<State>({
  channels: stateChannels
})
  .addNode("model", modelNode)
  .addNode("tools", toolsNode)
  .addEdge(START, "model")
  .addEdge("model", "tools")
  .addEdge("tools", END);
