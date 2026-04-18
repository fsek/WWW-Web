"use client";

import ImageDisplay from "@/components/ImageDisplay";
import { getSpecialisationByUrlTitleOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import type { CourseRead } from "@/api";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import urlFormatter from "@/utils/urlFormatter";
import NotFound from "@/components/NotFound";
import { buildCourseHref } from "@/utils/pluggHrefBuilders";
import InfoThumbnailCard from "@/components/InfoThumbnailCard";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function getSlug(param: string | string[] | undefined) {
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

export default function SpecialisationPage() {
	const { t, i18n } = useTranslation("plugg");
	const router = useRouter();
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
		<div className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
			<div className="mb-6 flex items-start justify-between gap-4">
				<div className="space-y-2">
					<Button variant="outline" onClick={() => router.back()}>
						<ArrowLeft />
						{t("plugg:specialisations.back")}
					</Button>
					<h1 className="text-3xl font-bold leading-tight md:text-4xl">
						{localizedTitle}
					</h1>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary">
							{courses.length} {t("plugg:specialisations.courses_label")}
						</Badge>
					</div>
				</div>
			</div>

			<Card className="mb-8 overflow-hidden">
				{specialisation.associated_img_id ? (
					<div className="relative h-56 w-full bg-muted md:h-72">
						<ImageDisplay
							type="associated_img"
							imageId={specialisation.associated_img_id}
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
						fallback={t("plugg:specialisations.description_fallback")}
					/>
				</CardContent>
			</Card>

			<section>
				<h2 className="text-2xl font-semibold">
					{t("plugg:specialisations.courses_title")}
				</h2>
				{courses.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						{t("plugg:specialisations.no_courses")}
					</p>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{courses.map((course: CourseRead) => {
							const courseTitle = course.course_code
								? `${course.course_code} - ${course.title}`
								: course.title;
							const courseHref = buildCourseHref(course.title);

							return (
								<InfoThumbnailCard
									key={course.course_id}
									title={courseTitle}
									description={course.description}
									imageId={course.associated_img_id}
									href={courseHref}
									emptyDescriptionText={t(
										"plugg:specialisations.course_description_fallback",
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
