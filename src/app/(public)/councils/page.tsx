"use client";
import CouncilGrid from "@/components/councilgrid";
import CustomTitle from "@/components/CustomTitle";
import TwoColumnLayout from "@/components/TwoColumnLayout";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";

const MDXPages: Record<string, React.ComponentType> = {
	sv: dynamic(() => import("./page.sv.mdx")),
	en: dynamic(() => import("./page.en.mdx")),
};

export default function AboutCouncil() {
	const { t, i18n } = useTranslation();
	const SelectedPage = MDXPages[i18n.language] ?? MDXPages.sv;

	return (
		<div className="p-14 space-y-10">
			<SelectedPage />
		</div>
	);
}
