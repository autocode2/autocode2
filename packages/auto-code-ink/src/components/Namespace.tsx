import { NamespaceInfo } from "@autocode2/core/db/Database.js";
import { Box, Text } from "ink";
import React from "react";

export default function Namespace({ namespace }: { namespace: NamespaceInfo }) {
  return (
    <Box flexDirection="row" columnGap={2}>
      <Text>{namespace.lastRun}</Text>
      <Text bold>{namespace.namespace}</Text>
      <Text>{namespace.runs} runs</Text>
      <Text>{namespace.threads} threads</Text>
    </Box>
  );
}
