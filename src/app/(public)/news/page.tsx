// main news page
"use client";

import mh from "@/assets/mh.jpg";
import TitleBanner from "@/components/TitleBanner";
import MainPageNews from "@/components/MainPageNews";
import { useTranslation } from "react-i18next";

export default function NewsPage() {
	const { t } = useTranslation();
	return (
		<>
			<TitleBanner
				title={t("main:news.self")}
				imageUrl={mh.src}
				className="relative h-[30vh] bg-cover bg-center mt-4"
			/>
			<div className="mx-20 my-10">
				<MainPageNews mini={false} />
			</div>
		</>
	);
}
