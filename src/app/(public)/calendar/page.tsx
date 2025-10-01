"use client";

import MainPageCalendar from "@/components/main-page-calendar";
import { useTranslation } from "react-i18next";

export default function BigCalendar() {
	const { t } = useTranslation();

	return (
		<div className="fixed inset-0 top-20 flex flex-col overflow-hidden">
			{/* Desktop */}
			<div className="max-md:hidden h-full">
				<MainPageCalendar mini={false} zoomWorkHours={true} fullMode={true} />
			</div>
			{/* Mobile */}
			<div className="md:hidden h-full">
				<MainPageCalendar
					mini={false}
					zoomWorkHours={true}
					isMobile={true}
					fullMode={true}
				/>
			</div>
		</div>
	);
}
