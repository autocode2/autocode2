import { BaseMessage } from "@langchain/core/messages";

export function prettyPrintMessages(messages: BaseMessage[]) {
  for (const m of messages) {
    const type = m._getType();
    const content =
      typeof m.content === "string" ? m.content : JSON.stringify(m.content);
    console.log(`${type}: ${content}`);
  }
}
