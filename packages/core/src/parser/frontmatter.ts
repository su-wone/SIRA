import matter from "gray-matter";
import { z } from "zod";
import { SchemaValidationError } from "../errors/index.js";

export interface ParsedMarkdown<T> {
  data: T;
  content: string;
}

export function parseMarkdown(raw: string): { data: Record<string, unknown>; content: string } {
  const { data, content } = matter(raw);
  return { data, content };
}

export function parseAndValidate<T>(
  raw: string,
  schema: z.ZodType<T>,
): ParsedMarkdown<T> {
  const { data, content } = parseMarkdown(raw);
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new SchemaValidationError(
      `Frontmatter validation failed: ${result.error.message}`,
      result.error.issues,
    );
  }
  return { data: result.data, content };
}

export function stringifyMarkdown(data: Record<string, unknown>, content: string): string {
  return matter.stringify(content, data);
}
