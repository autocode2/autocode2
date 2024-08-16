// src/commands/hello.ts
import { Command } from "@oclif/core";

export default class Test extends Command {
  public async run(): Promise<void> {
    this.log("Hello from oclif!");
  }
}
