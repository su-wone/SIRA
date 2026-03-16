import { SiraError } from "./SiraError.js";

export class SchemaValidationError extends SiraError {
  issues: unknown[];

  constructor(message: string, issues: unknown[] = []) {
    super("SCHEMA_VALIDATION_ERROR", message);
    this.name = "SchemaValidationError";
    this.issues = issues;
  }
}
