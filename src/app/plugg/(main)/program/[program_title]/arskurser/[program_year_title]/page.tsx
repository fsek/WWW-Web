"use client";

import {
	getAllProgramsOptions,
	getProgramYearByUrlTitleOptions,
} from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import type { CourseRead, ProgramYearRead } from "@/api";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { useParams } from "next/navigation";
import urlFormatter from "@/utils/urlFormatter";
import NotFound from "@/components/NotFound";
import { buildCourseHref, buildProgramHref } from "@/utils/pluggHrefBuilders";
import PluggIndexRow from "@/components/PluggIndexRow";
import PluggContactReminder from "@/components/PluggContactReminder";
import PluggDescription from "@/components/PluggDescription";
import PluggHero from "@/components/PluggHero";
import PluggSection from "@/components/PluggSection";

function getSlug(param: string | string[] | undefined) {
	if (Array.isArray(param)) {
		return param[0] ?? "";
	}
	return param ?? "";
}

export default function ProgramYearPage() {
	const { t, i18n } = useTranslation("plugg");
	const params = useParams();
	const isSwedish = (i18n.resolvedLanguage ?? i18n.language)
		.toLowerCase()
		.startsWith("sv");
	const programSlug = urlFormatter(
		decodeURIComponent(getSlug(params?.program_title)),
	);
	const programYearSlug = urlFormatter(
		decodeURIComponent(getSlug(params?.program_year_title)),
	);

	const {
		data: detailedProgramYear,
		error: programYearError,
		isPending,
		isFetching,
	} = useQuery({
		...getProgramYearByUrlTitleOptions({
			path: {
				program_title: programSlug,
				program_year_title: programYearSlug,
			},
		}),
		refetchOnWindowFocus: false,
		staleTime: 60 * 60 * 1000, // 1 hour
		refetchOnMount: "always",
	});

	// Shares its cache with the navbar, only used for the breadcrumb label
	const { data: programs } = useQuery({
		...getAllProgramsOptions(),
		staleTime: 60 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	const isLoadingProgramYear =
		!detailedProgramYear && (isPending || isFetching);

	if (isLoadingProgramYear) {
		return <LoadingErrorCard />;
	}

	if (programYearError) {
		return <LoadingErrorCard error={programYearError} />;
	}

	if (!detailedProgramYear) {
		const random = Math.random();
		return <NotFound random={random} />;
	}

	const programYear: ProgramYearRead = detailedProgramYear;
	const localizedTitle = isSwedish
		? programYear.title_sv
		: programYear.title_en;
	const localizedDescription = isSwedish
		? programYear.description_sv
		: programYear.description_en;

	const parentProgram = programs?.find(
		(program) => program.program_id === programYear.program_id,
	);
	const parentProgramTitle = parentProgram
		? isSwedish
			? parentProgram.title_sv
			: parentProgram.title_en
		: null;

	const courses = [...(programYear.courses ?? [])].sort(
		(a: CourseRead, b: CourseRead) => {
			const firstCode = a.course_code ?? "";
			const secondCode = b.course_code ?? "";
			const codeOrder = firstCode.localeCompare(secondCode, "en", {
				sensitivity: "base",
			});
			if (codeOrder !== 0) {
				return codeOrder;
			}

			return a.title.localeCompare(b.title, isSwedish ? "sv" : "en", {
				sensitivity: "base",
			});
		},
	);

	return (
		<div className="min-h-[calc(100vh-5rem)] pb-16">
			<PluggHero
				title={localizedTitle}
				context={parentProgramTitle}
				imageId={programYear.associated_img_id}
				breadcrumbs={[
					{ label: t("breadcrumb.home"), href: "/plugg" },
					{
						label: parentProgramTitle ?? t("program.back"),
						href: parentProgramTitle
							? buildProgramHref(parentProgramTitle)
							: `/plugg/program/${programSlug}`,
					},
				]}
				meta={[
					`${courses.length} ${t("program.program_year_page.courses_label")}`,
				]}
			/>

			<div className="mx-auto mt-10 w-full max-w-6xl space-y-16 px-4 md:mt-14 md:space-y-20 md:px-6">
				<PluggDescription
					text={localizedDescription}
					fallback={t("program.program_year_page.year_description_fallback")}
				/>

				<PluggSection
					title={t("program.program_year_page.courses_title")}
					count={courses.length}
					emptyText={t("program.program_year_page.no_courses")}
				>
					{courses.map((course: CourseRead) => (
						<PluggIndexRow
							key={course.course_id}
							code={course.course_code ?? null}
							title={course.title}
							description={course.description}
							href={buildCourseHref(course.title)}
							emptyDescriptionText={t(
								"program.program_year_page.course_description_fallback",
							)}
						/>
					))}
				</PluggSection>

				<PluggContactReminder />
			</div>
		</div>
	);
}
