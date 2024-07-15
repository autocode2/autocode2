import {
  BaseMessage,
  HumanMessage,
  SystemMessage
} from "@langchain/core/messages";
import {
  END,
  MemorySaver,
  START,
  StateGraph,
  StateGraphArgs
} from "@langchain/langgraph";
import { StructuredTool } from "langchain/tools";
import { ToolCall } from "@langchain/core/messages/tool";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createFile, removeFile, replaceFile } from "../tools/filetools";
import { sendMessage } from "../tools/messages";
import { Context, encodeContextAsXML } from "../context/context";
import { getModel } from "../llm/getModel";
import {
  getAIResponse,
  getLastAIMessage,
  getMessage
} from "../llm/messageTools";

export const systemPrompt = `You are an AI coding tool. Help the user with their coding tasks using the tools provided.

You will be given information about the current project in a <Context></Context> element.  This will include the full contents of files in the project, using <File></File> elements.

Use the following tools to perform the task:
 - message: Send a message to the user
 - replace-file: Replace the contents of a file, ensure that the full contents of the file are provided.
 - add-file: Add a new file
 - remove-file: Remove a file

You may call multiple tools in a single response.  You may also call the same tool multiple times. Call all the necessary tools to complete the users request.
`;

export type GraphState = {
  messages: BaseMessage[];
};

const graphStateChannels: StateGraphArgs<GraphState>["channels"] = {
  messages: {
    value: (x?: BaseMessage[], y?: BaseMessage[]) => (x ?? []).concat(y ?? []),
    default: () => []
  }
};

export type Events = {
  response: { message: string | null; actions: ToolCall[] };
};

export class CodeAgent {
  graph: StateGraph<
    GraphState,
    Partial<GraphState>,
    "__start__" | "model" | "tools"
  >;
  toolsExecutor: ToolNode<GraphState>;
  listeners: {
    [key: string]: ((response: Events["response"]) => void | Promise<void>)[];
  };

  constructor() {
    this.graph = this.buildGraph();
    this.toolsExecutor = new ToolNode<GraphState>(this.tools());
  }

  on(
    event: "response",
    listener: (response: Events["response"]) => void | Promise<void>
  ) {
    this.listeners = this.listeners || {};
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(listener);
  }

  async emit(event: "response", response: Events["response"]) {
    this.listeners = this.listeners || {};
    const listeners = this.listeners[event] || [];
    for (const listener of listeners) {
      await listener(response);
    }
  }

  async run({ query, context }: { query: string; context: Context }) {
    const checkpointer = new MemorySaver();
    const compiledGraph = this.graph
      .compile({
        checkpointer
      })
      .withConfig({
        recursionLimit: 5,
        configurable: {
          threadId: "1"
        }
      });
    const input = {
      messages: [this.systemPrompt({ context }), new HumanMessage(query)]
    };
    (await compiledGraph.invoke(input)) as GraphState;
  }

  tools(): StructuredTool[] {
    return [
      sendMessage,
      //thinking,
      createFile,
      removeFile,
      replaceFile
    ];
  }

  systemPrompt({ context }: { context: Context }): SystemMessage {
    return new SystemMessage(`${systemPrompt}\n${encodeContextAsXML(context)}`);
  }

  async modelNode(state: GraphState): Promise<Partial<GraphState>> {
    const model = getModel().bind({
      tools: this.tools(),
      tool_choice: "auto"
    });
    console.log("Invoking model with messages", state.messages);
    const response = await model.invoke([...state.messages]);
    return { messages: [response] };
  }

  async toolsNode(state: GraphState) {
    const response = getAIResponse(state.messages);

    const message = getMessage(response);
    const actions = response.tool_calls || [];

    await this.emit("response", { message, actions });

    if (actions.length === 0) {
      return {};
    }
    return this.toolsExecutor.invoke(state);
  }

  isFinishedTool(toolCall: ToolCall): boolean {
    return toolCall.name === sendMessage.name;
  }

  isFinished(state: GraphState): "finished" | "continue" {
    const lastMessage = getLastAIMessage(state.messages);
    const toolCalls = lastMessage?.tool_calls || [];
    console.log("***********************\nChecking if finished", {
      lastMessage,
      toolCalls
    });
    return toolCalls.length === 0 ||
      toolCalls.every(this.isFinishedTool.bind(this))
      ? "finished"
      : "continue";
  }

  buildGraph() {
    const graph = new StateGraph<GraphState>({
      channels: this.graphStateChannels
    })
      .addNode("model", this.modelNode.bind(this))
      .addNode("tools", this.toolsNode.bind(this))
      .addEdge(START, "model")
      .addEdge("model", "tools")
      .addConditionalEdges("tools", this.isFinished.bind(this), {
        continue: "model",
        finished: END
      });

    return graph;
  }

  graphStateChannels = graphStateChannels;
}
