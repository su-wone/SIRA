import { SiraError } from "./SiraError.js";

export class IndexCorruptError extends SiraError {
  constructor(message: string) {
    super("INDEX_CORRUPT", message);
    this.name = "IndexCorruptError";
  }
}
