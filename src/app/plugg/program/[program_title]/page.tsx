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
import {
	buildProgramYearHref,
	buildSpecialisationHref,
} from "@/utils/pluggHrefBuilders";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
		<div className="prose max-w-none text-sm leading-relaxed dark:prose-invert">
			<Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
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
		<div className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
			<div className="mb-6 flex items-start justify-between gap-4">
				<div className="space-y-2">
					<Button variant="outline" onClick={() => router.push("/plugg")}>
						<ArrowLeft />
						{t("program.back")}
					</Button>
					<h1 className="text-3xl font-bold leading-tight md:text-4xl">
						{localizedTitle}
					</h1>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary">
							{programYears.length} {t("program.program_page.years_label")}
						</Badge>
						<Badge variant="secondary">
							{specialisations.length} {t("program.specialisations")}
						</Badge>
					</div>
				</div>
			</div>

			<Card className="mb-8 overflow-hidden">
				{program.associated_img_id ? (
					<div className="relative h-56 w-full bg-muted md:h-72">
						<ImageDisplay
							type="associated_img"
							imageId={program.associated_img_id}
							alt={`Associated image for ${localizedTitle}`}
							className="object-cover"
							size="large"
							fill
						/>
					</div>
				) : null}
				<CardContent className="pt-6">
					<LocalizedDescription
						text={localizedDescription}
						fallback={t("program.program_page.program_description_fallback")}
					/>
				</CardContent>
			</Card>

			<section className="mb-10">
				<h2 className="text-2xl font-semibold">
					{t("program.program_page.program_years_title")}
				</h2>
				{programYears.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						{t("program.program_page.program_years_empty")}
					</p>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{programYears.map((year: ProgramYearRead) => {
							const yearTitle = isSwedish ? year.title_sv : year.title_en;
							const yearDescription = isSwedish
								? year.description_sv
								: year.description_en;
							const yearHref = buildProgramYearHref(localizedTitle, yearTitle);

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

			<section>
				<h2 className="text-2xl font-semibold">
					{t("program.specialisations")}
				</h2>
				{specialisations.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						{t("program.program_page.specialisations_empty")}
					</p>
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
	);
}
