import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage
} from "@langchain/core/messages";
import {
  END,
  START,
  StateGraph,
  Annotation,
  MessagesAnnotation,
  CompiledStateGraph,
  CompiledGraph
} from "@langchain/langgraph";
import { StructuredTool } from "langchain/tools";
import { ToolCall } from "@langchain/core/messages/tool";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createFile, removeFile, replaceFile } from "../tools/filetools.js";
import { sendMessage } from "../tools/messages.js";
import { Context, encodeContextAsXML } from "../context/context.js";
import {
  getAIResponse,
  getLastAIMessage,
  getMessage
} from "../llm/messageTools.js";
import { CommandConfig } from "../config/index.js";
import { zodToJsonSchema } from "zod-to-json-schema";

export const systemPrompt = `You are an AI coding tool. Help the user with their coding tasks using the tools provided.

You will be given information about the current project in a <Context></Context> element.  This will include the full contents of files in the project, using <File></File> elements.

Use the tools to perform the task. Ensure that the content of files is complete and will run as-is.  Do not leave any placeholders or elide the code. Guess sensible defaults if required.

You may call multiple tools in a single response.  You may also call the same tool multiple times. Call all the necessary tools to complete the users request.
`;

export type UsageMetadata = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
};

export const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec
});
export type GraphState = typeof StateAnnotation.State;

export type Events = {
  response: {
    message: string | null;
    actions: ToolCall[];
    usage: { input_tokens?: number; output_tokens?: number };
  };
  ai_message: { message: AIMessage };
  start: { agent: CodeAgent; run_id: string; thread_id: string };
  end: { agent: CodeAgent };
};

export type EventTypes = keyof Events;

type Listeners = {
  [key in EventTypes]: ((response: Events[key]) => void | Promise<void>)[];
};

export class CodeAgent {
  graph: ReturnType<typeof this.buildGraph>;
  toolsExecutor: ToolNode<GraphState>;
  listeners: Listeners;
  config: CommandConfig;
  usage: UsageMetadata & {
    llm_calls: number;
  } = {
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
    llm_calls: 0
  };
  context: Context;
  compiledGraph: {
    invoke: (input: Partial<GraphState>) => Promise<GraphState>;
  };
  thread_id: string;
  run_id: string;

  constructor({ config }: { config: CommandConfig }) {
    this.config = config;
    this.graph = this.buildGraph();
    this.toolsExecutor = new ToolNode<GraphState>(this.tools());
  }

  on<T extends EventTypes>(
    event: T,
    listener: (response: Events[T]) => void | Promise<void>
  ) {
    this.listeners = this.listeners || {};
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(listener);
  }

  async emit<T extends EventTypes>(event: T, response: Events[T]) {
    this.listeners = this.listeners || {};
    const listeners = this.listeners[event] || [];
    for (const listener of listeners) {
      await listener(response);
    }
  }

  async run(prompt?: string) {
    const { isRestart } = await this.initRun();

    const query = prompt || this.config.getPrompt();
    const messages = [];
    if (!isRestart) {
      this.context = await this.config.getContext();
      messages.push(this.systemPrompt({ context: this.context }));
    }
    messages.push(new HumanMessage(query));

    await this.runGraph(messages);
  }

  async initRun() {
    const db = this.config.getDatabase();

    const { run_id, thread_id, isRestart } = db.startRun(this.config);
    this.run_id = run_id;
    this.thread_id = thread_id;
    const checkpointer = db.checkpointSaver(run_id);

    this.compiledGraph = this.graph
      .compile({
        checkpointer
      })
      .withConfig({
        recursionLimit: 5,
        configurable: {
          thread_id
        }
      });

    return { run_id, thread_id, isRestart };
  }

  async continueRun(prompt: string) {
    const messages = [new HumanMessage(prompt)];
    await this.runGraph(messages);
  }

  async runGraph(messages: BaseMessage[]) {
    const input = {
      messages
    };
    await this.emit("start", {
      agent: this,
      run_id: this.run_id,
      thread_id: this.thread_id
    });

    await this.compiledGraph.invoke(input);

    await this.emit("end", { agent: this });
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

  debugPrompt() {
    return {
      systemPrompt,
      tools: this.tools().map((tool) => ({
        name: tool.name,
        description: tool.description,
        schema: zodToJsonSchema(tool.schema)
      }))
    };
  }

  systemPrompt({ context }: { context: Context }): SystemMessage {
    return new SystemMessage({
      content: [
        {
          type: "text",
          text: `${systemPrompt}\n${encodeContextAsXML(context)}`,
          cache_control: { type: "ephemeral" }
        }
      ]
    });
  }

  updateUsage({
    input_tokens,
    output_tokens,
    cache_creation_input_tokens,
    cache_read_input_tokens
  }: UsageMetadata) {
    this.usage.input_tokens += input_tokens;
    this.usage.output_tokens += output_tokens;
    this.usage.cache_creation_input_tokens += cache_creation_input_tokens;
    this.usage.cache_read_input_tokens += cache_read_input_tokens;
    this.usage.llm_calls += 1;
  }

  async modelNode(state: GraphState): Promise<Partial<GraphState>> {
    const model = this.config.getModel().bind({
      tools: this.tools(),
      tool_choice: "auto"
    });

    let messages: BaseMessage[] = [];
    let response: AIMessage = await model.invoke(state.messages);
    const stopReason = response.response_metadata["stop_reason"] as string;

    if (stopReason === "max_tokens") {
      console.log("Max tokens reached, recovering response");
      console.log("Original response", response.content);
      response = new AIMessage({
        content: response.content && response.content.slice(0, -1),
        tool_calls: response.tool_calls && response.tool_calls.slice(0, -1)
      });
      //const humanMessage = new HumanMessage("The last message was cut off due to reaching the maximum token limit. Please continue.");
      //const nextResponse = await model.invoke([...state.messages, partialResponse, humanMessage]);
      //messages = mergeMessageRuns([response, nextResponse]);
      //console.log("Joined response", messages);
    }

    messages = [response];
    await this.emit("ai_message", { message: response });

    const usage_metadata = response.response_metadata.usage as UsageMetadata;
    if (usage_metadata) {
      const {
        input_tokens,
        output_tokens,
        cache_creation_input_tokens,
        cache_read_input_tokens
      } = usage_metadata;
      this.updateUsage({
        input_tokens,
        output_tokens,
        cache_read_input_tokens,
        cache_creation_input_tokens
      });
    } else {
      console.log("No usage metadata found in response");
    }

    return { messages };
  }

  async toolsNode(state: GraphState) {
    const response = getAIResponse(state.messages);

    const message = getMessage(response);
    const actions = response.tool_calls || [];
    const { input_tokens, output_tokens } = response.usage_metadata || {};

    await this.emit("response", {
      message,
      actions,
      usage: { input_tokens, output_tokens }
    });

    if (actions.length === 0) {
      return { messages: [] };
    }
    const toolsResponse = (await this.toolsExecutor.invoke(state)) as {
      messages: ToolMessage[];
    };
    if (!this.config.getModelName().startsWith("claude")) {
      return toolsResponse;
    }
    // This is anthropic specific
    const toolMessage = new HumanMessage({
      content: toolsResponse.messages.map((m) => ({
        type: "tool_result",
        tool_use_id: m.tool_call_id,
        content: m.content
      }))
    });
    return { messages: [toolMessage] };
  }

  isFinishedTool(toolCall: ToolCall): boolean {
    return toolCall.name === sendMessage.name;
  }

  isFinished(state: GraphState): "finished" | "continue" {
    const lastMessage = getLastAIMessage(state.messages);
    const toolCalls = lastMessage?.tool_calls || [];

    return toolCalls.length === 0 ||
      toolCalls.every(this.isFinishedTool.bind(this))
      ? "finished"
      : "continue";
  }

  buildGraph() {
    const graph = new StateGraph(StateAnnotation)
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
}
