import React from "react";
import { Static } from "ink";
import { BaseMessage as BaseMessageType } from "@langchain/core/messages";
import BaseMessage from "../components/BaseMessage/index.js";

export default function App({ history }: { history: BaseMessageType[] }) {
  return (
    <Static items={history}>
      {(message) => <BaseMessage message={message} key={message.id} />}
    </Static>
  );
}
