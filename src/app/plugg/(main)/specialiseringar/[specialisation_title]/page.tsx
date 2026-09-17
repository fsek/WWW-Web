"use client";

import { getSpecialisationByUrlTitleOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import type { CourseRead } from "@/api";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { useParams } from "next/navigation";
import urlFormatter from "@/utils/urlFormatter";
import NotFound from "@/components/NotFound";
import { buildCourseHref, buildProgramHref } from "@/utils/pluggHrefBuilders";
import PluggIndexRow from "@/components/PluggIndexRow";
import PluggContactReminder from "@/components/PluggContactReminder";
import PluggDescription from "@/components/PluggDescription";
import PluggHero, { type PluggBreadcrumb } from "@/components/PluggHero";
import PluggSection from "@/components/PluggSection";

function getSlug(param: string | string[] | undefined) {
	if (Array.isArray(param)) {
		return param[0] ?? "";
	}
	return param ?? "";
}

export default function SpecialisationPage() {
	const { t, i18n } = useTranslation("plugg");
	const params = useParams();
	const isSwedish = (i18n.resolvedLanguage ?? i18n.language)
		.toLowerCase()
		.startsWith("sv");
	const specialisationSlug = urlFormatter(
		decodeURIComponent(getSlug(params?.specialisation_title)),
	);

	const {
		data: specialisation,
		error: specialisationError,
		isPending,
		isFetching,
	} = useQuery({
		...getSpecialisationByUrlTitleOptions({
			path: {
				title: specialisationSlug,
			},
		}),
		refetchOnWindowFocus: false,
		staleTime: 60 * 60 * 1000, // 1 hour
		refetchOnMount: "always",
	});

	const isLoadingSpecialisation = !specialisation && (isPending || isFetching);

	if (isLoadingSpecialisation) {
		return <LoadingErrorCard />;
	}

	if (specialisationError) {
		return <LoadingErrorCard error={specialisationError} />;
	}

	if (!specialisation) {
		const random = Math.random();
		return <NotFound random={random} />;
	}
	const localizedTitle = isSwedish
		? specialisation.title_sv
		: specialisation.title_en;
	const localizedDescription = isSwedish
		? specialisation.description_sv
		: specialisation.description_en;

	const programTitles = (specialisation.programs ?? []).map((program) =>
		isSwedish ? program.title_sv : program.title_en,
	);
	const breadcrumbs: Array<PluggBreadcrumb> = [
		{ label: t("breadcrumb.home"), href: "/plugg" },
	];
	// Only link to the parent program when there is exactly one
	if (programTitles.length === 1) {
		breadcrumbs.push({
			label: programTitles[0],
			href: buildProgramHref(programTitles[0]),
		});
	}

	const courses = [...(specialisation.courses ?? [])].sort(
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
				context={programTitles.join(", ") || null}
				imageId={specialisation.associated_img_id}
				breadcrumbs={breadcrumbs}
				meta={[`${courses.length} ${t("specialisations.courses_label")}`]}
			/>

			<div className="mx-auto mt-10 w-full max-w-6xl space-y-16 px-4 md:mt-14 md:space-y-20 md:px-6">
				<PluggDescription
					text={localizedDescription}
					fallback={t("specialisations.description_fallback")}
				/>

				<PluggSection
					title={t("specialisations.courses_title")}
					count={courses.length}
					emptyText={t("specialisations.no_courses")}
				>
					{courses.map((course: CourseRead) => (
						<PluggIndexRow
							key={course.course_id}
							code={course.course_code ?? null}
							title={course.title}
							description={course.description}
							href={buildCourseHref(course.title)}
							emptyDescriptionText={t(
								"specialisations.course_description_fallback",
							)}
						/>
					))}
				</PluggSection>

				<PluggContactReminder />
			</div>
		</div>
	);
}
