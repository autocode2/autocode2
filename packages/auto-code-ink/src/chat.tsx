import React from "react";
import { render } from "ink";
import { CodeAgent, CommandConfig } from "@autocode2/core";
import filesystemHandler from "./handlers/filesystem.js";
import App from "./apps/Chat.js";

export default class Chat {
  constructor(
    private codeAgent: CodeAgent,
    private config: CommandConfig
  ) {}

  public async run(): Promise<void> {
    filesystemHandler(this.codeAgent, this.config);

    //this.codeAgent.on('response', response => this.handleResponse(response));
    //await this.getNextInput();
    const { waitUntilExit } = render(
      <App codeAgent={this.codeAgent} config={this.config} />
    );
    await waitUntilExit();
  }
}
