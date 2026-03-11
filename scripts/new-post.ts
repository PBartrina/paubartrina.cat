import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { slugify } from "../src/lib/utils";
import Anthropic from "@anthropic-ai/sdk";

// Load .env.local so ANTHROPIC_API_KEY is available when running the script directly
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

const VALID_LOCALES = ["ca", "es", "en"];

function blogDir(locale: string) {
  return path.join(process.cwd(), "content", "blog", locale);
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function translateMDX(
  content: string,
  targetLang: "es" | "en"
): Promise<string> {
  const client = new Anthropic();

  const langName = targetLang === "es" ? "Spanish" : "English";
  const langCode = targetLang === "es" ? "es" : "en";

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Translate this Catalan MDX blog post to ${langName}. Keep the MDX structure intact, only translate the frontmatter fields (title, description) and the content body. Use "${langCode}" for the language code in the locale references.

${content}

Return only the translated MDX content, no explanations.`,
      },
    ],
  });

  const translatedContent =
    message.content[0].type === "text" ? message.content[0].text : "";
  return translatedContent;
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n\u{1F4DD} Nou article del blog (Català)\n");

  const title = await ask(rl, "Títol (en Català): ");
  if (!title) {
    console.error("Error: el títol és obligatori.");
    rl.close();
    process.exit(1);
  }

  const description = await ask(rl, "Descripció (en Català): ");
  const tagsInput = await ask(rl, "Tags (separats per comes): ");

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

  const dir = blogDir("ca");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${slug}.mdx`);

  if (fs.existsSync(filePath)) {
    console.error(`Error: ja existeix un article amb el slug "${slug}".`);
    rl.close();
    process.exit(1);
  }

  fs.writeFileSync(filePath, frontmatter);
  console.log(
    `\n\u2705 Article Català creat: content/blog/ca/${slug}.mdx\n`
  );

  const translateNow = await ask(
    rl,
    "Vols traduir aquest article a Spanish i English ara? (s/n): [s] "
  );

  if (translateNow.toLowerCase() === "n") {
    console.log(
      "\n\u{1F44B} Pots traduir més tard executant: npm run translate-post -- " +
        slug
    );
    rl.close();
    return;
  }

  rl.close();

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "\nError: ANTHROPIC_API_KEY no trobat.\nAfegeix-lo a .env.local:\n\n  ANTHROPIC_API_KEY=sk-ant-...\n"
    );
    process.exit(1);
  }

  console.log("\n\u{1F916} Traduint a Spanish i English (això pot trigar)...\n");

  // Read the Catalan file
  const caContent = fs.readFileSync(filePath, "utf-8");

  try {
    // Translate to Spanish
    console.log("Traduint a Spanish...");
    const esContent = await translateMDX(caContent, "es");
    const esPath = path.join(blogDir("es"), `${slug}.mdx`);
    if (!fs.existsSync(blogDir("es"))) {
      fs.mkdirSync(blogDir("es"), { recursive: true });
    }
    fs.writeFileSync(esPath, esContent);
    console.log(`\u2705 Spanish: content/blog/es/${slug}.mdx`);

    // Translate to English
    console.log("Traduint a English...");
    const enContent = await translateMDX(caContent, "en");
    const enPath = path.join(blogDir("en"), `${slug}.mdx`);
    if (!fs.existsSync(blogDir("en"))) {
      fs.mkdirSync(blogDir("en"), { recursive: true });
    }
    fs.writeFileSync(enPath, enContent);
    console.log(`\u2705 English: content/blog/en/${slug}.mdx`);

    console.log(`\n\u2705 Totes les traduccions creades!\n`);
  } catch (error) {
    console.error("\nError traduint:", error);
    console.log(
      "\nLes traduccions no es van crear. Pots intentar-ho més tard."
    );
    process.exit(1);
  }
}

main();
