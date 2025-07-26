"use client";

import mh from "@/assets/mh.jpg";
import TitleBanner from "@/components/TitleBanner";
import { useTranslation } from "react-i18next";
import MainPageCalendar from "@/components/main-page-calendar";

export default function BigCalendar() {
	const { t } = useTranslation();

	return (
		<>
			<TitleBanner
				title={t("main:calendar")}
				imageUrl={mh.src}
				className="relative h-[30vh] bg-cover bg-center mt-4"
			/>
			{/* Desktop */}
			<div className="max-md:hidden mx-20 my-10 h-[85vh]">
				<MainPageCalendar mini={false} zoomWorkHours={true} />
			</div>
			{/* Mobile */}
			<div className="md:hidden my-10 overflow-hidden h-[85vh]">
				<MainPageCalendar mini={false} zoomWorkHours={true} isMobile={true} />
			</div>
		</>
	);
}
