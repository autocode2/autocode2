import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import chalk from "chalk";

export default function Menu({
  items,
  onSelect
}: {
  items: string[];
  onSelect: (index: number) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.return) {
      onSelect(selectedIndex);
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    }
  });

  return (
    <Box flexDirection="column">
      {items.map((item, index) => (
        <Text key={item}>
          {index === selectedIndex ? chalk.blue("❯ " + item) : `  ${item}`}
        </Text>
      ))}
    </Box>
  );
}
