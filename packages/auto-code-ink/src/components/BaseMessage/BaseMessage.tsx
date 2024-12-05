import React from "react";
import {
  BaseMessage as BaseMessageType,
  isAIMessage,
  isHumanMessage,
  isSystemMessage,
  isToolMessage
} from "@langchain/core/messages";
import { AIMessage } from "./AIMessage.js";
import { HumanMessage } from "./HumanMessage.js";
import { SystemMessage } from "./SystemMessage.js";
import { ToolMessage } from "./ToolMessage.js";

export default function BaseMessage({ message }: { message: BaseMessageType }) {
  if (isAIMessage(message)) {
    return <AIMessage message={message} />;
  } else if (isHumanMessage(message)) {
    return <HumanMessage message={message} />;
  } else if (isSystemMessage(message)) {
    return <SystemMessage message={message} />;
  } else if (isToolMessage(message)) {
    return <ToolMessage message={message} />;
  } else {
    const _exhaustiveCheck: never = message;
    return _exhaustiveCheck;
  }
}
