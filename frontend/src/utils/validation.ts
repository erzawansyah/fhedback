// validation.ts
import { ZodError } from "zod";

export type ValidationIssue = {
  path: string;   // contoh: "questions[2].response.labels[0].id"
  message: string;
};

export function formatZodError(err: ZodError): ValidationIssue[] {
  return err.issues.map(issue => ({
    path: issue.path
      .map(p => (typeof p === "number" ? `[${p}]` : `${p}`))
      .join(".")
      .replace(/\.\[/g, "["),
    message: issue.message,
  }));
}


