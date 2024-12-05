import React from "react";
export { default as Chat } from "./chat.js";
import { render } from "ink";
import History from "./apps/History.js";
import { BaseMessage } from "@langchain/core/messages";
import { NamespaceInfo, ThreadInfo } from "@autocode2/core/db/Database.js";
import Threads from "./apps/Threads.js";
import Namespaces from "./apps/Namespaces.js";

export async function renderHistory(history: BaseMessage[]): Promise<void> {
  const { waitUntilExit } = render(<History history={history} />);
  await waitUntilExit();
}

export async function renderThreads(threads: ThreadInfo[]): Promise<void> {
  const { waitUntilExit } = render(<Threads threads={threads} />);
  await waitUntilExit();
}

export async function renderNamespaces(
  namespaces: NamespaceInfo[]
): Promise<void> {
  const { waitUntilExit } = render(<Namespaces namespaces={namespaces} />);
  await waitUntilExit();
}
