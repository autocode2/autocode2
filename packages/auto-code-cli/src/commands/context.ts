import { CommandConfig } from "@autocode2/core/config/index.js";

export type ContextCommandOptions = {
  exclude?: string[];
  include?: string[];
  excludeFrom?: string;
};

export async function showContextCommand(opts: ContextCommandOptions) {
  console.log("Context:");
  const config = new CommandConfig({
    ...opts
  });
  await config.init();

  const context = await config.getContext();
  context.files.forEach((file) => {
    console.log(`${file.path} ${file.content.length} bytes`);
  });
  console.log(
    "Total bytes: ",
    context.files.reduce((acc, file) => acc + file.content.length, 0)
  );
}
