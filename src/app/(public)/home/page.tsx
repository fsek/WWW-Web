"use client";

import mh from "@/assets/mh.jpg";
import WaveAnimation from "@/components/WaveAnimation";

import CustomTitle from "@/components/CustomTitle";
import TitleBanner from "@/components/TitleBanner";
import { useTranslation } from "react-i18next";
import MainPageCalendar from "@/components/main-page-calendar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MainLanding() {
	const { t } = useTranslation();

	return (
		<>
			<TitleBanner
				title={t("main:fsek")}
				imageUrl={mh.src}
				className="relative h-[30vh] bg-cover bg-center mt-4"
			/>
			<div className="container mx-auto flex flex-col px-4 pt-25 gap-4">
				<div className="md:mx-[10%]">
					<CustomTitle
						text={t("main:welcome")}
						className="text-center text-2xl font-bold mt-4 mb-2"
					/>
					<div className="text-left text-lg mb-8">{t("main:welcomeText")}</div>
					<div className="text-left text-lg mb-8">{t("main:welcomeAdmin")}</div>
					<Button className="mx-auto mb-4 text-xl p-5" variant="outline">
						<Link href="https://old.fsektionen.se" className="text-inherit">
							{t("main:oldWebsiteButton")}
						</Link>
					</Button>
					<Button className="mx-auto mb-4 text-xl p-5 ml-5" variant="outline">
						<Link href="/admin" className="text-inherit">
							{t("main:adminButton")}
						</Link>
					</Button>

					<CustomTitle
						text={t("main:newsTitle")}
						className="text-center text-2xl font-bold mt-4 mb-2"
					/>
					<div className="text-left text-lg mb-8">{t("main:newsText")}</div>

					<CustomTitle
						text={t("main:calendar")}
						className="text-center text-2xl font-bold mt-4 mb-2"
					/>
					<div className="my-10 mx-[10%] overflow-hidden h-[35vh]">
						<MainPageCalendar mini={true} />
					</div>

					<CustomTitle
						text={t("main:cafeTitle")}
						className="text-center text-2xl font-bold mt-4 mb-2"
					/>
					<div className="text-left text-lg mb-8">{t("main:cafeText")}</div>

					<CustomTitle
						text={t("main:coolThing")}
						className="text-center text-2xl font-bold mt-4 mb-2"
					/>
					<WaveAnimation />
				</div>
			</div>
		</>
	);
}
