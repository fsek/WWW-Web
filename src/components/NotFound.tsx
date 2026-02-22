"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import Obfuscate from "react-obfuscate";

export default function NotFound({ random }: { random: number }) {
	const { t } = useTranslation("notfound");

	const quotes = useMemo(
		() => [
			{
				text: t("notFound.quote_1"),
				author: t("notFound.quote_author_1"),
			},
			{
				text: t("notFound.quote_2"),
				author: t("notFound.quote_author_2"),
			},
			{
				text: t("notFound.quote_3"),
				author: t("notFound.quote_author_3"),
			},
		],
		[t],
	);

	const pickedQuote = useMemo(
		() => quotes[Math.floor(random * quotes.length)],
		[quotes, random],
	);

	return (
		<div className="flex items-center justify-center min-h-screen bg-background text-foreground">
			<section className="text-center">
				<h1 className="mb-4 text-7xl font-extrabold tracking-tight lg:text-9xl text-primary">
					404
				</h1>
				<p className="mb-4 text-3xl font-bold md:text-4xl">
					{t("notFound.title")}
				</p>
				<div className="mb-4 text-lg font-light text-muted-foreground">
					{t("notFound.description")}{" "}
					<Obfuscate email={"spindelman@fsektionen.se"}>
						<p className="inline-flex text-forange hover:bg-primary hover:text-white">
							{t("notFound.contact")}
						</p>
					</Obfuscate>
					.
				</div>
				<p className="mb-4 text-lg font-light text-muted-foreground">
					<i>"{pickedQuote.text}"</i> - {pickedQuote.author}
				</p>
				<Button
					type="button"
					onClick={() => window.history.back()}
					className="mt-2 inline-flex text-white bg-primary hover:bg-primary/80 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-primary-900"
				>
					{t("notFound.back")}
				</Button>
			</section>
		</div>
	);
}
