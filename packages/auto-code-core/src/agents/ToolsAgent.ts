import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { END, START, StateGraph, StateGraphArgs } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import EventEmitter from "events";
import { DynamicStructuredTool } from "langchain/tools";
import { ToolCall } from "@langchain/core/messages/tool";
import { ToolNode } from "@langchain/langgraph/prebuilt";

export type GraphState = {
  messages: BaseMessage[];
};

const graphStateChannels: StateGraphArgs<GraphState>["channels"] = {
  messages: {
    value: (x?: BaseMessage[], y?: BaseMessage[]) => (x ?? []).concat(y ?? []),
    default: () => []
  }
};

export type NodeFunction = (state: GraphState) => Promise<Partial<GraphState>>;

export abstract class ToolsAgent {
  emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  abstract tools(): DynamicStructuredTool[];
  abstract systemPrompt(): string;

  async modelNode(state: GraphState): Promise<Partial<GraphState>> {
    const model = new ChatOpenAI({
      temperature: 0,
      model: "gpt-4o"
    }).bind({
      tools: this.tools(),
      tool_choice: "required"
    });
    const response = await model.invoke([
      this.systemPrompt(),
      ...state.messages
    ]);
    return { messages: [response] };
  }

  async toolsNode(state: GraphState) {
    const prebuilt = new ToolNode<GraphState>(this.tools());
    return prebuilt.invoke(state);
  }

  async responseNode() {
    return {};
  }

  getLatestToolCalls(state: GraphState): ToolCall[] {
    const lastAIMessage = state.messages.findLast(
      (m) => m._getType() === "ai"
    ) as AIMessage;
    if (!lastAIMessage) {
      return [];
    }
    return lastAIMessage.tool_calls || [];
  }

  shouldRespond(state: GraphState): "response" | "continue" {
    const toolCalls = this.getLatestToolCalls(state);
    if (toolCalls.some(this.isResponseTool.bind(this))) {
      return "response";
    } else {
      return "continue";
    }
  }

  isFinishedTool(toolCall: ToolCall): boolean {
    return false;
  }

  isResponseTool(toolCall: ToolCall): boolean {
    return false;
  }

  isFinished(state: GraphState): "finished" | "continue" {
    const toolCalls = this.getLatestToolCalls(state);
    return toolCalls.some(this.isFinishedTool.bind(this))
      ? "finished"
      : "continue";
  }

  buildGraph() {
    const graph = new StateGraph<GraphState>({
      channels: this.graphStateChannels
    })
      .addNode("model", this.modelNode.bind(this))
      .addNode("tools", this.toolsNode.bind(this))
      .addNode("responseNode", this.responseNode.bind(this))
      .addEdge(START, "model")
      .addEdge("model", "tools")
      .addConditionalEdges("tools", this.shouldRespond.bind(this), {
        response: "responseNode",
        continue: "model"
      })
      .addConditionalEdges("responseNode", this.isFinished.bind(this), {
        continue: "model",
        finished: END
      });

    return graph;
  }

  graphStateChannels = graphStateChannels;
}
