"use client";

import ImageDisplay from "@/components/ImageDisplay";
import { getCourseByUrlTitleOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import type { CourseDocumentRead } from "@/api";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ExternalLink, FileText } from "lucide-react";
import urlFormatter from "@/utils/urlFormatter";
import NotFound from "@/components/NotFound";
import { buildCourseDocumentFileHref } from "@/utils/pluggHrefBuilders";
import PluggContactReminder from "@/components/PluggContactReminder";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax";

const GENERAL_SUB_CATEGORY_KEY = "__general__";

function getCourseSlug(param: string | string[] | undefined) {
	if (Array.isArray(param)) {
		return param[0] ?? "";
	}
	return param ?? "";
}

function formatDocumentDate(value: Date, locale: string) {
	return new Date(value).toLocaleDateString(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function normalizeCourseCode(value: string) {
	return value?.trim().toUpperCase();
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

function CourseDocumentList({
	documents,
	isSwedish,
	currentCourseCode,
	authorLabel,
	updatedAtLabel,
	openLabel,
	legacyCourseCodeWarningLabel,
	onOpen,
}: {
	documents: Array<CourseDocumentRead>;
	isSwedish: boolean;
	currentCourseCode: string;
	authorLabel: string;
	updatedAtLabel: string;
	openLabel: string;
	legacyCourseCodeWarningLabel: string;
	onOpen: (courseDocumentId: number) => void;
}) {
	const locale = isSwedish ? "sv-SE" : "en-GB";
	const normalizedCurrentCourseCode = normalizeCourseCode(currentCourseCode);

	return (
		<Card className="overflow-hidden border-border/70 bg-card py-0 shadow-sm">
			<CardContent className="p-0">
				<ul>
					{documents.map((document, index) => (
						<li key={document.course_document_id}>
							{(() => {
								const normalizedDocumentCode = normalizeCourseCode(
									document.created_course_code,
								);
								const shouldShowLegacyCodeWarning =
									normalizedCurrentCourseCode.length > 0 &&
									normalizedDocumentCode.length > 0 &&
									normalizedDocumentCode !== normalizedCurrentCourseCode;

								return (
									<Button
										type="button"
										variant="ghost"
										onClick={() => onOpen(document.course_document_id)}
										className="group h-auto w-full items-start justify-between gap-3 rounded-none px-4 py-5 text-left whitespace-normal font-normal transition-colors hover:bg-muted/50 md:px-6"
									>
										<div className="flex min-w-0 items-start gap-3 md:gap-4">
											<div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
												<FileText className="size-4" />
											</div>
											<div className="min-w-0">
												<p className="truncate text-sm font-medium md:text-base group-hover:text-foreground">
													{document.title}
												</p>
												<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground md:text-sm">
													<p>
														{authorLabel}: {document.author}
													</p>
													<p>
														{updatedAtLabel}:{" "}
														{formatDocumentDate(document.updated_at, locale)}
													</p>
													{shouldShowLegacyCodeWarning ? (
														// ensure it's placed on new line
														<div className="w-full flex flex-row items-center gap-1 text-amber-700/50 dark:text-amber-300/50">
															<AlertCircle className="size-4" />
															<p className="font-medium">
																{legacyCourseCodeWarningLabel}{" "}
																{document.created_course_code}
															</p>
														</div>
													) : null}
												</div>
											</div>
										</div>
										<div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground group-hover:underline">
											{openLabel}
											<ExternalLink className="size-4" />
										</div>
									</Button>
								);
							})()}
							{index < documents.length - 1 ? <Separator /> : null}
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}

export default function CoursePage() {
	const { t, i18n } = useTranslation("plugg");
	const router = useRouter();
	const params = useParams();
	const isSwedish = (i18n.resolvedLanguage ?? i18n.language)
		.toLowerCase()
		.startsWith("sv");
	const courseSlug = urlFormatter(
		decodeURIComponent(getCourseSlug(params?.course_title)),
	);

	const {
		data: course,
		error: courseError,
		isPending,
		isFetching,
	} = useQuery({
		...getCourseByUrlTitleOptions({
			path: { title: courseSlug },
		}),
		refetchOnWindowFocus: false,
		staleTime: 60 * 60 * 1000, // 1 hour
		refetchOnMount: "always",
	});

	const translatedCategoryByValue: Record<
		CourseDocumentRead["category"],
		string
	> = {
		Notes: t("courses.documents.categories.notes"),
		Summary: t("courses.documents.categories.summary"),
		Solutions: t("courses.documents.categories.solutions"),
		Other: t("courses.documents.categories.other"),
	};

	const categorySortOrder: Record<CourseDocumentRead["category"], number> = {
		Notes: 0,
		Summary: 1,
		Solutions: 2,
		Other: 3,
	};

	const isLoadingCourse = !course && (isPending || isFetching);

	if (isLoadingCourse) {
		return <LoadingErrorCard />;
	}

	if (courseError) {
		return <LoadingErrorCard error={courseError} />;
	}

	if (!course) {
		const random = Math.random();
		return <NotFound random={random} />;
	}

	const courseDocuments = [...(course.documents ?? [])].sort((first, second) =>
		first.title.localeCompare(second.title, isSwedish ? "sv" : "en", {
			sensitivity: "base",
		}),
	);

	const groupedDocuments = (() => {
		const groupedByCategory = new Map<
			CourseDocumentRead["category"],
			Map<string, Array<CourseDocumentRead>>
		>();

		for (const document of courseDocuments) {
			const existingCategory = groupedByCategory.get(document.category);
			if (!existingCategory) {
				groupedByCategory.set(document.category, new Map());
			}

			const categoryMap = groupedByCategory.get(document.category);
			if (!categoryMap) {
				continue;
			}

			const rawSubCategory = document.sub_category?.trim() ?? "";
			const subCategoryKey = rawSubCategory || GENERAL_SUB_CATEGORY_KEY;

			if (!categoryMap.has(subCategoryKey)) {
				categoryMap.set(subCategoryKey, []);
			}

			categoryMap.get(subCategoryKey)?.push(document);
		}

		const locale = isSwedish ? "sv" : "en";

		return [...groupedByCategory.entries()]
			.map(([category, subCategoryMap]) => {
				const subCategories = [...subCategoryMap.entries()]
					.map(([subCategory, documents]) => ({
						id: subCategory,
						label:
							subCategory === GENERAL_SUB_CATEGORY_KEY
								? t("courses.documents.general_subcategory")
								: subCategory,
						documents,
					}))
					.sort((first, second) => {
						// Put the "general" (uncategorized) subcategory first, then sort the rest alphabetically
						if (first.id === GENERAL_SUB_CATEGORY_KEY) {
							return -1;
						}

						if (second.id === GENERAL_SUB_CATEGORY_KEY) {
							return 1;
						}

						return first.label.localeCompare(second.label, locale, {
							sensitivity: "base",
						});
					});

				return {
					id: category,
					label: translatedCategoryByValue[category] ?? category,
					subCategories,
				};
			})
			.sort((first, second) => {
				const rankDiff =
					categorySortOrder[first.id] - categorySortOrder[second.id];
				if (rankDiff !== 0) {
					return rankDiff;
				}

				return first.label.localeCompare(second.label, locale, {
					sensitivity: "base",
				});
			});
	})();

	const openCourseDocument = (courseDocumentId: number) => {
		window.open(
			buildCourseDocumentFileHref(courseDocumentId),
			"_blank",
			"noopener,noreferrer",
		);
	};

	const singleCourseCode = course.course_code?.trim() || "";
	const locale = isSwedish ? "sv-SE" : "en-GB";
	const courseUpdatedBadge = t("courses.updated_badge", {
		date: formatDocumentDate(course.updated_at, locale),
	});

	return (
		<div className="min-h-[calc(100vh-5rem)] pb-16">
			<section className="relative left-1/2 right-1/2 -mx-[50vw] mb-12 w-screen overflow-hidden border-b border-primary/25">
				{course.associated_img_id ? (
					<>
						<div className="absolute inset-0">
							<ImageDisplay
								type="associated_img"
								imageId={course.associated_img_id}
								alt={`Associated image for ${course.title}`}
								className="object-cover"
								size="large"
								fill
							/>
						</div>
						<div className="absolute inset-0 bg-black/15 dark:bg-white/15" />
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
						onClick={() => router.back()}
						className="w-fit border border-primary-foreground/35 bg-background/15 text-primary-foreground backdrop-blur-sm hover:bg-background/25"
					>
						<ArrowLeft />
						{t("courses.back")}
					</Button>

					<div className="space-y-3">
						<h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">
							{course.title} - {course.course_code}
						</h1>
						<div className="flex flex-wrap gap-2.5">
							<Badge variant="secondary">{courseUpdatedBadge}</Badge>
						</div>
					</div>
				</div>
			</section>

			<div className="mx-auto w-full max-w-6xl space-y-12 px-4 md:px-6">
				<div className="flex flex-col gap-5">
					<section className="rounded-3xl border border-border/70 px-5 py-8 md:px-10 bg-card md:py-10">
						<div className="mx-auto min-h-24">
							<LocalizedDescription
								text={course.description}
								fallback={t("courses.description_fallback")}
							/>
						</div>
					</section>

					<PluggContactReminder />
				</div>

				<section className="space-y-7">
					<div className="flex flex-wrap items-baseline justify-between gap-3">
						<h2 className="text-2xl font-semibold md:text-3xl">
							{t("courses.documents.title")}
						</h2>
					</div>

					{groupedDocuments.length === 0 ? (
						<Card className="border-dashed border-primary/30">
							<CardContent className="py-8 text-sm text-muted-foreground">
								{t("courses.documents.empty")}
							</CardContent>
						</Card>
					) : (
						<div className="space-y-8">
							{groupedDocuments.map((categoryGroup) => {
								const shouldShowTabs = categoryGroup.subCategories.length > 1;
								const firstSubCategory = categoryGroup.subCategories[0];

								return (
									<section
										key={categoryGroup.id}
										className="space-y-4 rounded-2xl border border-border/70 bg-card p-4 md:p-6"
									>
										<div className="flex flex-wrap items-baseline justify-between gap-2">
											<h3 className="text-xl font-semibold text-foreground">
												{categoryGroup.label}
											</h3>
										</div>

										{shouldShowTabs ? (
											<Tabs defaultValue={firstSubCategory?.id}>
												<TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-xl bg-muted/55 p-1.5">
													{categoryGroup.subCategories.map((subCategory) => (
														<TabsTrigger
															key={`${categoryGroup.id}-${subCategory.id}`}
															value={subCategory.id}
															className="h-9 rounded-lg border border-transparent px-4 text-muted-foreground data-[state=active]:border-foreground/10 data-[state=active]:bg-background data-[state=active]:text-primary dark:data-[state=active]:text-primary"
														>
															{subCategory.label}
														</TabsTrigger>
													))}
												</TabsList>

												{categoryGroup.subCategories.map((subCategory) => (
													<TabsContent
														key={`${categoryGroup.id}-content-${subCategory.id}`}
														value={subCategory.id}
														className="mt-4"
													>
														<CourseDocumentList
															documents={subCategory.documents}
															isSwedish={isSwedish}
															currentCourseCode={singleCourseCode}
															authorLabel={t("courses.documents.author")}
															updatedAtLabel={t("courses.documents.updated_at")}
															openLabel={t("courses.documents.open")}
															legacyCourseCodeWarningLabel={t(
																"courses.documents.legacy_course_code_warning",
															)}
															onOpen={openCourseDocument}
														/>
													</TabsContent>
												))}
											</Tabs>
										) : firstSubCategory ? (
											<div className="space-y-3">
												{firstSubCategory.id !== GENERAL_SUB_CATEGORY_KEY ? (
													<p className="text-sm font-medium text-muted-foreground">
														{firstSubCategory.label}
													</p>
												) : null}

												<CourseDocumentList
													documents={firstSubCategory.documents}
													isSwedish={isSwedish}
													currentCourseCode={singleCourseCode}
													authorLabel={t("courses.documents.author")}
													updatedAtLabel={t("courses.documents.updated_at")}
													openLabel={t("courses.documents.open")}
													legacyCourseCodeWarningLabel={t(
														"courses.documents.legacy_course_code_warning",
													)}
													onOpen={openCourseDocument}
												/>
											</div>
										) : null}
									</section>
								);
							})}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
