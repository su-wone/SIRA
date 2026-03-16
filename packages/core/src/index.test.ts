import { describe, it, expect } from "vitest";
import { SIRA_VERSION } from "./index.js";

describe("@sira/core", () => {
  it("exports SIRA_VERSION", () => {
    expect(SIRA_VERSION).toBe("0.0.1");
  });
});
