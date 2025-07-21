"use client";

import CustomTitle from "@/components/CustomTitle";
import TwoColumnLayout from "@/components/TwoColumnLayout";
import mh from "@/assets/mh.jpg";
import TitleBanner from "@/components/TitleBanner";
import { Trans, useTranslation } from "react-i18next";

export default function FnuPage() {
	// Nämnden
	// for inline links I consulted:
	// https://stackoverflow.com/questions/43587838/react-i18next-interpolation-of-link-in-html-tag-in-the-middle-of-the-text
	const { t } = useTranslation();
	return (
		<div className="flex flex-col min-h-screen">
			<TitleBanner
				title={t("utskott:fnu.self")}
				imageUrl={mh.src} // this errors in my typecheck but works somehow
				className="relative h-[30vh] bg-cover bg-center"
			/>
			<div className="flex-grow bg-white dark:bg-black p-14 gap-12 ">
				<TwoColumnLayout
					leftColumnContent={
						<>
							<CustomTitle
								text={`Om ${t("utskott:fnu.self")}`}
								className="mt-4"
								size={3}
							/>
							<p className="mt-4">
								{/*Inline translated link example*/}
								<Trans i18nKey="utskott:fnu.about">
									<a
										href="/admin" //TODO: UPDATERA DENNA TILL ATT PEKA RÄTT
										className="underline text-orange-500 hover:text-orange-400"
										target="_blank"
										rel="noreferrer"
									>
										Ingen text kunde hittas :/
										{/* When writing the language file for a component like this, the elements within Trans are numbered
                    and you can write the text to be inputted to them <0>in xlm</0> tags, then 1, 2, 3 etc.
                    NOTE 2: Comments in curly brackets (like this one) count as elements. Yes, really. */}
									</a>
								</Trans>
							</p>
						</>
					}
					rightColumnContent={
						<>
							<CustomTitle
								text={t("utskott:contact_title")}
								className="mt-4"
								size={3}
							/>
							<p className="mt-4">{t("utskott:fnu.contact")}</p>
						</>
					}
					className=""
				/>

				<CustomTitle text={t("utskott:poster")} />

				<TwoColumnLayout
					leftColumnContent={
						<div className="">
							<CustomTitle
								size={2}
								text={t("utskott:beskrivning")}
								className="mt-4"
							/>
							<p className="mt-4">{t("utskott:fnu.post_besk")}</p>
						</div>
					}
					rightColumnContent={
						<>
							<CustomTitle
								text={t("utskott:vemhar")}
								className="mt-4"
								size={2}
							/>
							<p className="mt-4">{t("utskott:fnu.contact")}</p>
						</>
					}
					className=""
				/>
			</div>
		</div>
	);
}
