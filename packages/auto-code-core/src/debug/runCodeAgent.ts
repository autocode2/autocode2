import { MemorySaver } from "@langchain/langgraph";
import { graph as codeAgentGraph, State } from "../agents/codeAgent";
import { HumanMessage } from "@langchain/core/messages";
import { prettyPrintMessages } from "../llm/prettyPrintMessages";

async function runCodeAgent(query: string) {
  const checkpointer = new MemorySaver();

  const runnable = codeAgentGraph
    .compile({
      checkpointer
    })
    .withConfig({
      recursionLimit: 5,
      configurable: {
        thread_id: "test"
      }
    });
  const initialState: State = {
    messages: [new HumanMessage(query)]
  };
  const finalState = (await runnable.invoke(initialState)) as State;

  return {
    ...finalState
  };
}

const query = process.argv[2];

runCodeAgent(query)
  .then((result) => {
    prettyPrintMessages(result.messages);
  })
  .catch((error) => {
    console.error(error);
  });
