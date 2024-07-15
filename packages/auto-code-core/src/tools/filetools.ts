import { DynamicStructuredTool } from "langchain/tools";
import z from "zod";

export const createFile = new DynamicStructuredTool({
  name: "create-file",
  description: "Create a new file",
  schema: z.object({
    filename: z.string(),
    contents: z.string()
  }),
  func: async () => {
    return await new Promise((resolve) => resolve("OK"));
  }
});

export const replaceFile = new DynamicStructuredTool({
  name: "replace-file",
  description: "Replace the contents of a file",
  schema: z.object({
    filename: z.string(),
    contents: z.string()
  }),
  func: async () => {
    return await new Promise((resolve) => resolve("OK"));
  }
});

export const removeFile = new DynamicStructuredTool({
  name: "remove-file",
  description: "Remove a file",
  schema: z.object({
    filename: z.string()
  }),
  func: async () => {
    return await new Promise((resolve) => resolve("OK"));
  }
});
