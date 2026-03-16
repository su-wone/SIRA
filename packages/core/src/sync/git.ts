import { simpleGit, type SimpleGit } from "simple-git";
import { SiraError } from "../errors/SiraError.js";

const MAX_RETRIES = 3;

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt === retries) throw e;
      const delay = Math.pow(2, attempt) * 100;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new SiraError("GIT_ERROR", "Max retries exceeded");
}

export function getGit(projectRoot: string): SimpleGit {
  return simpleGit(projectRoot);
}

export async function commitAndPush(
  projectRoot: string,
  filePaths: string[],
  message: string,
): Promise<{ commitHash: string }> {
  const git = getGit(projectRoot);

  await git.add(filePaths);
  const result = await git.commit(message);
  const commitHash = result.commit || "unknown";

  await withRetry(async () => {
    const remotes = await git.getRemotes();
    if (remotes.length > 0) {
      await git.push();
    }
  });

  return { commitHash };
}

export async function pullLatest(projectRoot: string): Promise<void> {
  const git = getGit(projectRoot);
  const remotes = await git.getRemotes();
  if (remotes.length > 0) {
    await withRetry(() => git.pull());
  }
}

export async function getFileHistory(
  projectRoot: string,
  filePath: string,
  maxCount = 10,
): Promise<{ hash: string; date: string; message: string; author: string }[]> {
  const git = getGit(projectRoot);
  const log = await git.log({ file: filePath, maxCount });
  return log.all.map((entry) => ({
    hash: entry.hash,
    date: entry.date,
    message: entry.message,
    author: entry.author_name,
  }));
}
