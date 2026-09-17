"use client";

import { getProgramByUrlTitleOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import type { ProgramRead, ProgramYearRead, SpecialisationRead } from "@/api";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { useParams } from "next/navigation";
import urlFormatter from "@/utils/urlFormatter";
import NotFound from "@/components/NotFound";
import PluggContactReminder from "@/components/PluggContactReminder";
import PluggDescription from "@/components/PluggDescription";
import PluggHero from "@/components/PluggHero";
import PluggIndexRow from "@/components/PluggIndexRow";
import PluggSection from "@/components/PluggSection";
import {
	buildProgramYearHref,
	buildSpecialisationHref,
} from "@/utils/pluggHrefBuilders";

function getProgramSlug(param: string | string[] | undefined) {
	if (Array.isArray(param)) {
		return param[0] ?? "";
	}
	return param ?? "";
}

export default function ProgramPage() {
	const { t, i18n } = useTranslation("plugg");
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
			<PluggHero
				title={localizedTitle}
				imageId={program.associated_img_id}
				breadcrumbs={[{ label: t("breadcrumb.home"), href: "/plugg" }]}
				meta={[
					`${programYears.length} ${t("program.program_page.years_label")}`,
					`${specialisations.length} ${t("program.program_page.specialisations_label")}`,
				]}
			/>

			<div className="mx-auto mt-10 w-full max-w-6xl space-y-16 px-4 md:mt-14 md:space-y-20 md:px-6">
				<PluggDescription
					text={localizedDescription}
					fallback={t("program.program_page.program_description_fallback")}
				/>

				<PluggSection
					title={t("program.program_page.program_years_title")}
					count={programYears.length}
					emptyText={t("program.program_page.program_years_empty")}
				>
					{programYears.map((year: ProgramYearRead) => {
						const yearTitle = isSwedish ? year.title_sv : year.title_en;
						const yearDescription = isSwedish
							? year.description_sv
							: year.description_en;

						return (
							<PluggIndexRow
								key={year.program_year_id}
								title={yearTitle}
								description={yearDescription}
								href={buildProgramYearHref(localizedTitle, yearTitle)}
								emptyDescriptionText={t(
									"program.program_page.year_description_fallback",
								)}
							/>
						);
					})}
				</PluggSection>

				<PluggSection
					title={t("program.specialisations")}
					count={specialisations.length}
					emptyText={t("program.program_page.specialisations_empty")}
				>
					{specialisations.map((specialisation: SpecialisationRead) => {
						const specialisationTitle = isSwedish
							? specialisation.title_sv
							: specialisation.title_en;
						const specialisationDescription = isSwedish
							? specialisation.description_sv
							: specialisation.description_en;

						return (
							<PluggIndexRow
								key={specialisation.specialisation_id}
								title={specialisationTitle}
								description={specialisationDescription}
								href={buildSpecialisationHref(specialisationTitle)}
								emptyDescriptionText={t(
									"program.program_page.specialisation_description_fallback",
								)}
							/>
						);
					})}
				</PluggSection>

				<PluggContactReminder />
			</div>
		</div>
	);
}
