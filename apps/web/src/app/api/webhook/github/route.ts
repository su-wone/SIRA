import { NextResponse } from "next/server";
import {
  verifyGitHubSignature,
  extractChangedTaskFiles,
} from "@sira/core";
import { isGitHubMode, invalidateCache } from "@/lib/github";
import { broadcastSSE } from "@/lib/sse";

function getProjectRoot(): string {
  return process.env.SIRA_PROJECT_ROOT ?? process.cwd();
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

    // Verify signature if secret is configured
    if (webhookSecret) {
      if (!verifyGitHubSignature(body, signature, webhookSecret)) {
        return NextResponse.json(
          { error: { code: "UNAUTHORIZED", message: "Invalid webhook signature" } },
          { status: 401 },
        );
      }
    }

    const payload = JSON.parse(body);
    const changes = extractChangedTaskFiles(payload);

    const hasTaskChanges =
      changes.added.length > 0 ||
      changes.modified.length > 0 ||
      changes.removed.length > 0;

    if (!hasTaskChanges) {
      return NextResponse.json({ data: { message: "No task changes" } });
    }

    if (isGitHubMode()) {
      // On Vercel: just invalidate cache, no local git pull needed
      invalidateCache();
    } else {
      // Local mode: pull and rebuild index
      const { pullLatest, incrementalUpdate, writeIndex } = await import("@sira/core");
      const root = getProjectRoot();
      await pullLatest(root);
      const index = incrementalUpdate(root);
      writeIndex(root, index);
    }

    // Broadcast SSE events
    for (const f of changes.added) {
      broadcastSSE("task:created", { file: f });
    }
    for (const f of changes.modified) {
      broadcastSSE("task:updated", { file: f });
    }
    for (const f of changes.removed) {
      broadcastSSE("task:deleted", { file: f });
    }
    broadcastSSE("index:rebuilt", {
      added: changes.added.length,
      modified: changes.modified.length,
      removed: changes.removed.length,
    });

    return NextResponse.json({
      data: {
        added: changes.added.length,
        modified: changes.modified.length,
        removed: changes.removed.length,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: { code: "INTERNAL", message } },
      { status: 500 },
    );
  }
}
