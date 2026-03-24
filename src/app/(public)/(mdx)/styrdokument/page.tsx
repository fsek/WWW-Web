"use client";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

// Don't copy this file, it's not generic

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
