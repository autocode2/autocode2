import { ThreadInfo } from "@autocode2/core/db/Database.js";
import { Box, Text } from "ink";
import React from "react";

export default function Thread({ thread }: { thread: ThreadInfo }) {
  return (
    <Box flexDirection="row" columnGap={2}>
      <Text>{thread.lastRun}</Text>
      <Text bold>{thread.threadId}</Text>
      <Text>{thread.runs}</Text>
    </Box>
  );
}
