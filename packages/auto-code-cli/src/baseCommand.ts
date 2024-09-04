import {
  CommandConfig,
  CommandConfigOptions
} from "@autocode2/core/config/index.js";
import { Command, Flags, Interfaces } from "@oclif/core";

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<
  (typeof BaseCommand)["baseFlags"] & T["flags"]
>;
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T["args"]>;

export abstract class BaseCommand<T extends typeof Command> extends Command {
  // add the --json flag
  static enableJsonFlag = true;

  // define flags that can be inherited by any command that extends BaseCommand
  static baseFlags = {
    exclude: Flags.string({
      multiple: true,
      char: "x",
      description: "exclude files matching pattern"
    }),
    include: Flags.string({
      multiple: true,
      description: "include files matching pattern"
    }),
    excludeFrom: Flags.string({
      description: "exclude files matching patterns contained in file",
      aliases: ["exclude-from"]
    }),
    continue: Flags.boolean({
      description: "continue from the last run in this folder",
      char: "c"
    })
  };

  protected flags!: Flags<T>;
  protected args!: Args<T>;
  protected commandConfig!: CommandConfig;

  public async init(): Promise<void> {
    await super.init();
    const { args, flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      enableJsonFlag: this.ctor.enableJsonFlag,
      args: this.ctor.args,
      strict: this.ctor.strict
    });
    this.flags = flags as Flags<T>;
    this.args = args as Args<T>;
    this.commandConfig = await this.getCommandConfig();
  }

  protected async getCommandConfig(): Promise<CommandConfig> {
    const config = new CommandConfig(this.getConfigOptions());
    await config.init();
    return config;
  }

  protected getConfigOptions(): CommandConfigOptions {
    return {
      exclude: this.flags.exclude,
      include: this.flags.include,
      excludeFrom: this.flags.excludeFrom,
      continue: this.flags.continue
    };
  }

  protected async catch(err: Error & { exitCode?: number }): Promise<unknown> {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err);
  }

  protected async finally(_: Error | undefined): Promise<unknown> {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(_);
  }
}
