import * as fs from "fs";
import * as path from "path";
import Anthropic from "@anthropic-ai/sdk";

// Load .env.local so ANTHROPIC_API_KEY is available when running the script directly
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      // Strip surrounding single or double quotes (e.g. KEY="value" → value)
      const value = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
      process.env[match[1].trim()] = value;
    }
  }
}

function blogDir(locale: string) {
  return path.join(process.cwd(), "content", "blog", locale);
}

async function translateMDX(
  content: string,
  targetLang: "es" | "en"
): Promise<string> {
  const client = new Anthropic();
  const langName = targetLang === "es" ? "Spanish" : "English";

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Translate this Catalan MDX blog post to ${langName}. Keep the MDX structure intact (frontmatter format, markdown syntax). Only translate the frontmatter fields (title, description) and the content body. Keep date, tags, and published fields exactly as-is.

${content}

Return only the translated MDX content, no explanations.`,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

async function main() {
  const slug = process.argv[2];

  if (!slug) {
    console.error("\nÚs: pnpm run translate-post <slug>\n");
    console.error("  Exemple: pnpm run translate-post hola-mon\n");
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "\nError: ANTHROPIC_API_KEY no trobat.\nAfegeix-lo a .env.local:\n\n  ANTHROPIC_API_KEY=sk-ant-...\n"
    );
    process.exit(1);
  }

  const caPath = path.join(blogDir("ca"), `${slug}.mdx`);
  if (!fs.existsSync(caPath)) {
    console.error(`\nError: no s'ha trobat content/blog/ca/${slug}.mdx\n`);
    process.exit(1);
  }

  const caContent = fs.readFileSync(caPath, "utf-8");
  console.log(`\n🤖 Traduint "${slug}" a Spanish i English...\n`);

  try {
    console.log("Traduint a Spanish...");
    const esContent = await translateMDX(caContent, "es");
    const esDir = blogDir("es");
    if (!fs.existsSync(esDir)) fs.mkdirSync(esDir, { recursive: true });
    fs.writeFileSync(path.join(esDir, `${slug}.mdx`), esContent);
    console.log(`✅ Spanish: content/blog/es/${slug}.mdx`);

    console.log("Traduint a English...");
    const enContent = await translateMDX(caContent, "en");
    const enDir = blogDir("en");
    if (!fs.existsSync(enDir)) fs.mkdirSync(enDir, { recursive: true });
    fs.writeFileSync(path.join(enDir, `${slug}.mdx`), enContent);
    console.log(`✅ English: content/blog/en/${slug}.mdx`);

    console.log(`\n✅ Totes les traduccions creades!\n`);
  } catch (error) {
    console.error("\nError traduint:", error);
    process.exit(1);
  }
}

main();
