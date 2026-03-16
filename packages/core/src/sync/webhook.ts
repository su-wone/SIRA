import crypto from "node:crypto";

export interface WebhookPayload {
  ref: string;
  commits: {
    id: string;
    message: string;
    added: string[];
    modified: string[];
    removed: string[];
  }[];
}

export function verifyGitHubSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")}`;
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

export function extractChangedTaskFiles(payload: WebhookPayload): {
  added: string[];
  modified: string[];
  removed: string[];
} {
  const added: string[] = [];
  const modified: string[] = [];
  const removed: string[] = [];

  for (const commit of payload.commits) {
    for (const f of commit.added) {
      if (f.startsWith("tasks/") && f.endsWith(".md")) added.push(f);
    }
    for (const f of commit.modified) {
      if (f.startsWith("tasks/") && f.endsWith(".md")) modified.push(f);
    }
    for (const f of commit.removed) {
      if (f.startsWith("tasks/") && f.endsWith(".md")) removed.push(f);
    }
  }

  return {
    added: [...new Set(added)],
    modified: [...new Set(modified)],
    removed: [...new Set(removed)],
  };
}
