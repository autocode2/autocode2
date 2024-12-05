import React from "react";
import { BaseMessage as BaseMessageType } from "@langchain/core/messages";
import { Message } from "./Message.js";

export function HumanMessage({ message }: { message: BaseMessageType }) {
  return (
    <Message message={message} prefix="󰍡" marginLeft={0} color="whiteBright" />
  );
}
