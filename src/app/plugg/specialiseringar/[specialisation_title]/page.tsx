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
import PluggContactReminder from "@/components/PluggContactReminder";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax";
import Image from "next/image";

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
		<div className="min-h-[calc(100vh-5rem)] pb-16">
			<section className="relative left-1/2 right-1/2 -mx-[50vw] mb-12 w-screen overflow-hidden border-b border-primary/25">
				{specialisation.associated_img_id ? (
					<>
						<div className="absolute inset-0">
							<ImageDisplay
								type="associated_img"
								imageId={specialisation.associated_img_id}
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
						<div className="absolute inset-0">
							<Image
								src="/images/background.svg"
								alt="Background pattern"
								className="absolute inset-0 h-full w-full object-cover"
								width={800}
								height={600}
								loading="eager"
							/>
						</div>
						<div className="absolute inset-0 bg-black/5 dark:bg-white/5" />
					</>
				)}

				<div className="relative mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-12 text-primary-foreground md:px-6 md:py-16">
					<Button
						variant="secondary"
						onClick={() => router.back()}
						className="w-fit border border-primary-foreground/35 bg-background/15 text-primary-foreground backdrop-blur-sm hover:bg-background/25"
					>
						<ArrowLeft />
						{t("plugg:specialisations.back")}
					</Button>

					<div className="space-y-3">
						<h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">
							{localizedTitle}
						</h1>
						<div className="flex flex-wrap gap-2.5">
							<Badge variant="secondary">
								{courses.length} {t("plugg:specialisations.courses_label")}
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
								fallback={t("plugg:specialisations.description_fallback")}
							/>
						</div>
					</section>

					<PluggContactReminder />
				</div>

				<section className="space-y-5">
					<h2 className="text-2xl font-semibold md:text-3xl">
						{t("plugg:specialisations.courses_title")}
					</h2>
					{courses.length === 0 ? (
						<Card className="border-dashed border-primary/30">
							<CardContent className="py-8 text-sm text-muted-foreground">
								{t("plugg:specialisations.no_courses")}
							</CardContent>
						</Card>
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
		</div>
	);
}
