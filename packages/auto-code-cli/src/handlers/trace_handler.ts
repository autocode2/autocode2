import { CodeAgent, CommandConfig } from "@autocode2/core";

export type Trace = {
  config: {
    model: string;
  };
  context: string[];
  system: ReturnType<typeof CodeAgent.prototype.debugPrompt>;
  responses: {
    message: string | null;
    actions: { name: string; args: Record<string, string> }[];
    time: Date;
    usage?: { input_tokens?: number; output_tokens?: number };
  }[];
};

function traceableArgs(action: {
  name: string;
  args: Record<string, string>;
}): Record<string, string> {
  if (action.name === "thinking") {
    return action.args;
  }
  if (
    action.name === "create-file" ||
    action.name === "replace-file" ||
    action.name === "remove-file"
  ) {
    return { filename: action.args.filename };
  }
  return action.args;
}

export default function traceHandler(agent: CodeAgent, config: CommandConfig) {
  const trace: Trace = {
    config: {
      model: config.getModelName()
    },
    system: agent.debugPrompt(),
    context: [],
    responses: []
  };

  agent.on("start", async () => {
    const context = await config.getContext();
    trace.context = context.files.map((file) => file.path);
  });

  agent.on("response", async (response) => {
    const message = {
      message: response.message,
      actions: response.actions.map((action) => ({
        name: action.name,
        args: traceableArgs(action)
      })),
      usage: response.usage,
      time: new Date()
    };
    trace.responses.push(message);
  });

  return trace;
}
