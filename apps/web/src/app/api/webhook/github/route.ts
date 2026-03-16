import { NextResponse } from "next/server";
import {
  verifyGitHubSignature,
  extractChangedTaskFiles,
  pullLatest,
  incrementalUpdate,
  writeIndex,
} from "@sira/core";
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

    const root = getProjectRoot();

    // Pull latest changes
    await pullLatest(root);

    // Update index
    const index = incrementalUpdate(root);
    writeIndex(root, index);

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
    broadcastSSE("index:rebuilt", { entries: index.entries.length });

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
