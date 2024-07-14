import {
  AIMessage,
  BaseMessage,
  MessageContentComplex,
  MessageContentText
} from "@langchain/core/messages";
import invariant from "tiny-invariant";

export function isAIMessage(message: BaseMessage): message is AIMessage {
  return message._getType() === "ai";
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
