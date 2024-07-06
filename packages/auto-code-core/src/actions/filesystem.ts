export function createFile(args: { filename: string; contents: string }) {
  return {
    type: "create-file",
    args
  };
}
