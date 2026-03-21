"use client";

import type { ComponentPropsWithoutRef } from "react";
import CopyButton from "@/components/CopyButton";

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node || typeof node !== "object") return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  const el = node as React.ReactElement<{ children?: React.ReactNode }>;
  return extractText(el.props?.children);
}

export default function CodeBlock({
  children,
  ...props
}: ComponentPropsWithoutRef<"pre">) {
  const text = extractText(children).trimEnd();

  return (
    <div className="group relative">
      <pre {...props}>{children}</pre>
      <CopyButton text={text} />
    </div>
  );
}
