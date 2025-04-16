"use client";

import CustomTitle from "@/components/CustomTitle";
import TwoColumnLayout from "@/components/TwoColumnLayout";
import mh from "@/assets/mh.jpg";
import Image from "next/image";
import TitleBanner from "@/components/TitleBanner";
import { Trans, useTranslation } from "react-i18next";

export default function NamndenPage() {
	// Nämnden
	// for inline links I consulted:
	// https://stackoverflow.com/questions/43587838/react-i18next-interpolation-of-link-in-html-tag-in-the-middle-of-the-text
	const { t } = useTranslation();
	return (
		<div className="flex flex-col min-h-screen">
			<TitleBanner
				title={t("main:namnden.title")}
				imageUrl={mh.src} // this errors in my typecheck but works somehow
				className="relative h-[30vh] bg-cover bg-center"
			/>
			<div className="flex-grow bg-white dark:bg-black">
				<TwoColumnLayout
					leftColumnContent={
						<>
							<CustomTitle
								text={t("main:namnden.about_title")}
								className="mt-4"
								size={3}
							/>
							<p className="mt-4"> {/*Inline translated link example*/}
								<Trans i18nKey="main:namnden.about"> 
									<a
										href="/admin"
										className="underline text-orange-500 hover:text-orange-400"
										target="_blank"
										rel="noreferrer"
									>
										This text here can be whatever, it will however show up if the translation is not found.
										This is a fake link to the page of the vice president (replace with real link).
										NOTE: You do need some text, even just a single character here, otherwise the translation will not work.
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
								text={t("main:namnden.contact_title")}
								className="mt-4"
								size={3}
							/>
							<p className="mt-4">{t("main:namnden.contact")}</p>
						</>
					}
					className="p-14 gap-12"
				/>
			</div>
		</div>
	);
}
