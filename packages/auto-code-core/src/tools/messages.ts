import { DynamicStructuredTool } from "langchain/tools";
import z from "zod";

export const sendMessage = new DynamicStructuredTool({
  name: "message",
  description: "Send a message to the user",
  schema: z.object({
    message: z.string()
  }),
  func: async () => {
    return await new Promise((resolve) => resolve("OK"));
  }
});

export const thinking = new DynamicStructuredTool({
  name: "thinking",
  description: "Use this tool to think about your actions before proceeding",
  schema: z.object({
    thoughts: z.string()
  }),
  func: async () => {
    return await new Promise((resolve) => resolve("OK"));
  }
});
