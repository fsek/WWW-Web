"use client";

import ImageDisplay from "@/components/ImageDisplay";
import { getProgramByUrlTitleOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import type { ProgramRead, ProgramYearRead, SpecialisationRead } from "@/api";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import urlFormatter from "@/utils/urlFormatter";
import NotFound from "@/components/NotFound";
import InfoThumbnailCard from "@/components/InfoThumbnailCard";
import PluggContactReminder from "@/components/PluggContactReminder";
import {
	buildProgramYearHref,
	buildSpecialisationHref,
} from "@/utils/pluggHrefBuilders";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax";
import Image from "next/image";

function getProgramSlug(param: string | string[] | undefined) {
	if (Array.isArray(param)) {
		return param[0] ?? "";
	}
	return param ?? "";
}

function LocalizedDescription({
	text,
	fallback,
}: {
	text: string | null | undefined;
	fallback: string;
}) {
	if (!text) {
		return <p className="text-sm text-muted-foreground italic">{fallback}</p>;
	}

	return (
		<div className="prose prose-sm max-w-none leading-relaxed prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-a:text-primary md:prose-base dark:prose-invert">
			<Markdown
				remarkPlugins={[remarkGfm, remarkMath]}
				rehypePlugins={[rehypeMathjax]}
			>
				{text}
			</Markdown>
		</div>
	);
}

export default function ProgramPage() {
	const { t, i18n } = useTranslation("plugg");
	const router = useRouter();
	const params = useParams();
	const isSwedish = (i18n.resolvedLanguage ?? i18n.language)
		.toLowerCase()
		.startsWith("sv");
	const programSlug = urlFormatter(
		decodeURIComponent(getProgramSlug(params?.program_title)),
	);

	const {
		data: detailedProgram,
		error: programError,
		isPending,
		isFetching,
	} = useQuery({
		...getProgramByUrlTitleOptions({
			path: { title: programSlug },
		}),
		refetchOnWindowFocus: false,
		staleTime: 60 * 60 * 1000, // 1 hour
		refetchOnMount: "always",
	});

	const isLoadingProgram = !detailedProgram && (isPending || isFetching);

	if (isLoadingProgram) {
		return <LoadingErrorCard />;
	}

	if (programError) {
		return <LoadingErrorCard error={programError} />;
	}

	if (!detailedProgram) {
		const random = Math.random();
		return <NotFound random={random} />;
	}

	const program: ProgramRead = detailedProgram;
	const localizedTitle = isSwedish ? program.title_sv : program.title_en;
	const localizedDescription = isSwedish
		? program.description_sv
		: program.description_en;

	const programYears = [...(program.program_years ?? [])].sort((a, b) => {
		const first = isSwedish ? a.title_sv : a.title_en;
		const second = isSwedish ? b.title_sv : b.title_en;
		// Swedish has a different sorting order than English, kinda
		return first.localeCompare(second, isSwedish ? "sv" : "en", {
			sensitivity: "base",
		});
	});

	const specialisations = [...(program.specialisations ?? [])].sort((a, b) => {
		const first = isSwedish ? a.title_sv : a.title_en;
		const second = isSwedish ? b.title_sv : b.title_en;
		return first.localeCompare(second, isSwedish ? "sv" : "en", {
			sensitivity: "base",
		});
	});

	return (
		<div className="min-h-[calc(100vh-5rem)] pb-16">
			<section className="relative left-1/2 right-1/2 -mx-[50vw] mb-12 w-screen overflow-hidden border-b border-primary/25">
				{program.associated_img_id ? (
					<>
						<div className="absolute inset-0">
							<ImageDisplay
								type="associated_img"
								imageId={program.associated_img_id}
								alt={`Associated image for ${localizedTitle}`}
								className="object-cover"
								size="large"
								fill
							/>
						</div>
						<div className="absolute inset-0 bg-black/20 dark:bg-white/20" />
					</>
				) : (
					<>
						<div
							className="absolute inset-0"
							style={{
								backgroundColor: "#FFA64D",
								backgroundImage: 'url("/images/line-in-motion.svg")',
								backgroundRepeat: "repeat",
								backgroundSize: "128px 128px",
							}}
						/>
						<div className="absolute inset-0 bg-black/10 dark:bg-white/10" />
					</>
				)}

				<div className="relative mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-12 text-primary-foreground md:px-6 md:py-16">
					<Button
						variant="secondary"
						onClick={() => router.push("/plugg")}
						className="w-fit border border-primary-foreground/35 bg-background/15 text-primary-foreground backdrop-blur-sm hover:bg-background/25"
					>
						<ArrowLeft />
						{t("program.back")}
					</Button>

					<div className="space-y-3">
						<h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">
							{localizedTitle}
						</h1>
						<div className="flex flex-wrap gap-2.5">
							<Badge variant="secondary">
								{programYears.length} {t("program.program_page.years_label")}
							</Badge>
							<Badge variant="secondary">
								{specialisations.length} {t("program.specialisations")}
							</Badge>
						</div>
					</div>
				</div>
			</section>

			<div className="mx-auto w-full max-w-6xl space-y-12 px-4 md:px-6">
				<div className="flex flex-col gap-5">
					<section className="rounded-3xl border border-border/70 bg-card px-5 py-8 md:px-10 md:py-10">
						<div className="mx-auto min-h-24">
							<LocalizedDescription
								text={localizedDescription}
								fallback={t(
									"program.program_page.program_description_fallback",
								)}
							/>
						</div>
					</section>

					<PluggContactReminder />
				</div>

				<section className="space-y-5">
					<h2 className="text-2xl font-semibold md:text-3xl">
						{t("program.program_page.program_years_title")}
					</h2>

					{programYears.length === 0 ? (
						<Card className="border-dashed border-primary/30">
							<CardContent className="py-8 text-sm text-muted-foreground">
								{t("program.program_page.program_years_empty")}
							</CardContent>
						</Card>
					) : (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
							{programYears.map((year: ProgramYearRead) => {
								const yearTitle = isSwedish ? year.title_sv : year.title_en;
								const yearDescription = isSwedish
									? year.description_sv
									: year.description_en;
								const yearHref = buildProgramYearHref(
									localizedTitle,
									yearTitle,
								);

								return (
									<InfoThumbnailCard
										key={year.program_year_id}
										title={yearTitle}
										description={yearDescription}
										imageId={year.associated_img_id}
										href={yearHref}
										emptyDescriptionText={t(
											"program.program_page.year_description_fallback",
										)}
									/>
								);
							})}
						</div>
					)}
				</section>

				<section className="space-y-5">
					<h2 className="text-2xl font-semibold md:text-3xl">
						{t("program.specialisations")}
					</h2>

					{specialisations.length === 0 ? (
						<Card className="border-dashed border-primary/30">
							<CardContent className="py-8 text-sm text-muted-foreground">
								{t("program.program_page.specialisations_empty")}
							</CardContent>
						</Card>
					) : (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
							{specialisations.map((specialisation: SpecialisationRead) => {
								const specialisationTitle = isSwedish
									? specialisation.title_sv
									: specialisation.title_en;
								const specialisationDescription = isSwedish
									? specialisation.description_sv
									: specialisation.description_en;
								const specialisationHref =
									buildSpecialisationHref(specialisationTitle);

								return (
									<InfoThumbnailCard
										key={specialisation.specialisation_id}
										title={specialisationTitle}
										description={specialisationDescription}
										imageId={specialisation.associated_img_id}
										href={specialisationHref}
										emptyDescriptionText={t(
											"program.program_page.specialisation_description_fallback",
										)}
									/>
								);
							})}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
