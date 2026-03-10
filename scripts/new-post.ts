import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { slugify } from "../src/lib/utils";

const VALID_LOCALES = ["ca", "es", "en"];

function blogDir(locale: string) {
  return path.join(process.cwd(), "content", "blog", locale);
}

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

  console.log("\n\u{1F4DD} Nou article del blog\n");

  const locale = await ask(rl, `Idioma (${VALID_LOCALES.join("/")}): [ca] `);
  const selectedLocale = locale || "ca";

  if (!VALID_LOCALES.includes(selectedLocale)) {
    console.error(
      `Error: idioma invàlid "${selectedLocale}". Opcions: ${VALID_LOCALES.join(", ")}`
    );
    rl.close();
    process.exit(1);
  }

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
    ? tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
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

  const dir = blogDir(selectedLocale);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${slug}.mdx`);

  if (fs.existsSync(filePath)) {
    console.error(`Error: ja existeix un article amb el slug "${slug}" per a ${selectedLocale}.`);
    process.exit(1);
  }

  fs.writeFileSync(filePath, frontmatter);
  console.log(
    `\n\u2705 Article creat: content/blog/${selectedLocale}/${slug}.mdx\n`
  );
}

main();
