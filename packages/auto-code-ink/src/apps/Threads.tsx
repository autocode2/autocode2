import React from "react";
import { Static } from "ink";
import { ThreadInfo } from "@autocode2/core/db/Database.js";
import Thread from "../components/Thread.js";

export default function Threads({ threads }: { threads: ThreadInfo[] }) {
  return (
    <Static items={threads}>
      {(thread) => <Thread thread={thread} key={thread.threadId} />}
    </Static>
  );
}
