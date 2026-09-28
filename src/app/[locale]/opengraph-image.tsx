import { getTranslations } from "next-intl/server";
import { ogCard, ogSize } from "@/lib/og";
import { BUILD_SEED } from "@/lib/mark";

// Default card for every route under [locale] that has no image of its own.
export const size = ogSize;
export const contentType = "image/png";
export const alt = "Pau Bartrina";

export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  return ogCard({
    seed: BUILD_SEED,
    eyebrow: "paubartrina.cat",
    title: t("headline"),
    meta: "Pau Bartrina",
  });
}
