"use client";
import CouncilGrid from "@/components/councilgrid";
import CustomTitle from "@/components/CustomTitle";
import TwoColumnLayout from "@/components/TwoColumnLayout";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function AboutCouncil() {
	const { t } = useTranslation();

	return (
		<div className="p-14 space-y-10">
			<TwoColumnLayout
				leftColumnContent={
					<div className="relative w-full aspect-[3/4]">
						{/* 16:9 aspect ratio container */}
						<Image
							src="/images/utskott/utskott-temp.png"
							alt={t("utskott:aboutAlt")} // always include alt text
							fill // makes the image cover the container
							sizes="(min-width: 768px) 66vw, 100vw" // responsive sizing
							className="object-cover rounded-lg"
						/>
					</div>
				}
				rightColumnContent={
					<>
						<h2 className="text-2xl font-semibold">
							<CustomTitle text={t("utskott:title")} />
						</h2>
						<p className="mt-4">{t("utskott:about")}</p>
					</>
				}
				leftFlex={1}
				rightFlex={2}
				className="gap-12"
			/>

			<CustomTitle text={t("utskott:sub_title")} />
			<CouncilGrid />
		</div>
	);
}
