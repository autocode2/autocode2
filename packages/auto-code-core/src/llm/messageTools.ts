import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  MessageContentComplex,
  MessageContentText
} from "@langchain/core/messages";
import invariant from "tiny-invariant";

export function isAIMessage(message: BaseMessage): message is AIMessage {
  return message._getType() === "ai";
}

export function isHumanMessage(message: BaseMessage): message is HumanMessage {
  return message._getType() === "human";
}

export function getLastAIMessage(messages: BaseMessage[]): AIMessage | null {
  return messages.reverse().find(isAIMessage) ?? null;
}

export function getAIResponse(messages: BaseMessage[]): AIMessage {
  const lastMessage = messages[messages.length - 1];
  invariant(
    isAIMessage(lastMessage),
    `Expected last message to be an AI message ${lastMessage._getType()}`
  );
  return lastMessage;
}

export function isTextMessage(
  content: MessageContentComplex
): content is MessageContentText {
  return content.type === "text";
}

export function getMessage(response: AIMessage): string | null {
  if (!Array.isArray(response.content)) {
    return response.content;
  }
  const textMessages = response.content.filter(isTextMessage);
  if (textMessages.length === 0) {
    return null;
  }
  return textMessages.map((m) => m.text).join("\n");
}

export function cachedMessageContent(text: string): MessageContentComplex {
  return {
    type: "text",
    text,
    cache_control: { type: "ephemeral" }
  };
}

export function hasCacheControl(message: BaseMessage): boolean {
  return (
    Array.isArray(message.content) &&
    message.content.some((m) => Object.hasOwn(m, "cache_control"))
  );
}

export function addCacheControl(message: HumanMessage): HumanMessage {
  let content: MessageContentComplex[];
  // Ideally we'd duplicate the message and add the cache control
  if (Array.isArray(message.content)) {
    //const [...rest, last] = message.content;
    const last = message.content[message.content.length - 1];
    const rest = message.content.slice(0, -1);
    content = [
      ...rest,
      {
        ...last,
        cache_control: { type: "ephemeral" }
      }
    ];
  } else {
    content = [cachedMessageContent(message.content)];
  }
  return new HumanMessage({
    additional_kwargs: message.additional_kwargs,
    id: message.id,
    name: message.name,
    content
  });
}

export function applyCachingToMessages(messages: BaseMessage[]): BaseMessage[] {
  // Add cache metadata to the last 2 human messages (the first for retrieval,
  // the second as input for the next message.
  let cached = 0;
  return messages
    .toReversed()
    .map((m) => {
      if (cached < 2 && isHumanMessage(m)) {
        cached += 1;
        return addCacheControl(m);
      }
      return m;
    })
    .toReversed();
}
