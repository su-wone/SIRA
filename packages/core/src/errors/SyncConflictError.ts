import { SiraError } from "./SiraError.js";

export class SyncConflictError extends SiraError {
  localData: unknown;
  remoteData: unknown;

  constructor(message: string, localData: unknown, remoteData: unknown) {
    super("SYNC_CONFLICT", message);
    this.name = "SyncConflictError";
    this.localData = localData;
    this.remoteData = remoteData;
  }
}
