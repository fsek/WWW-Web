"use client";

// TODO: When we get language to work properly in the future, 
// (for example using cookies)
// we might want to switch these pages to be serverside
// for now it just works

// This also feels like a hacky way to do it, ideally there should be no need to
// use a page.tsx file, but rather just import the MDX files directly.
// This works only if a single file "page.mdx" is used, which breaks localization.

import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

const MDXPages: Record<string, React.ComponentType> = {
  sv: dynamic(() => import("./page.sv.mdx")),
  en: dynamic(() => import("./page.en.mdx")),
};

export default function AboutPage() {
  const { i18n } = useTranslation();
  const SelectedPage = MDXPages[i18n.language] ?? MDXPages.sv;

  return (
    <main className="p-8">
      <SelectedPage />
    </main>
  );
}