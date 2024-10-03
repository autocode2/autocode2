import React from "react";
import { render, Text } from "ink";
import { CodeAgent, CommandConfig } from "@autocode2/core";
import filesystemHandler from "./handlers/filesystem.js";

export function Hello() {
  return (
    <Text>
      Hello, <Text color="green">WAAAAA</Text>
    </Text>
  );
}

export class Chat {
  constructor(private codeAgent: CodeAgent, private config: CommandConfig) {}

  public async run(): Promise<void> {
    filesystemHandler(this.codeAgent, this.config);

    //this.codeAgent.on('response', response => this.handleResponse(response));
    //await this.getNextInput();
    const { waitUntilExit } = render(<Hello />);
    await waitUntilExit();
  }
}
