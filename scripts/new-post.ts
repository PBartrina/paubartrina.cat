import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { slugify } from "../src/lib/utils";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n📝 Nou article del blog\n");

  const title = await ask(rl, "Títol: ");
  if (!title) {
    console.error("Error: el títol és obligatori.");
    rl.close();
    process.exit(1);
  }

  const description = await ask(rl, "Descripció: ");
  const tagsInput = await ask(rl, "Tags (separats per comes): ");
  rl.close();

  const slug = slugify(title);
  const date = new Date().toISOString().split("T")[0];
  const tags = tagsInput
    ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const frontmatter = `---
title: "${title}"
date: "${date}"
description: "${description}"
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
published: true
---

Escriu el teu contingut aquí...
`;

  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }

  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  if (fs.existsSync(filePath)) {
    console.error(`Error: ja existeix un article amb el slug "${slug}".`);
    process.exit(1);
  }

  fs.writeFileSync(filePath, frontmatter);
  console.log(`\n✅ Article creat: content/blog/${slug}.mdx\n`);
}

main();
