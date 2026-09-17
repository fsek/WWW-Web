"use client";

import { getCourseByUrlTitleOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import type { CourseDocumentRead } from "@/api";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import { AlertCircle, ExternalLink } from "lucide-react";
import urlFormatter from "@/utils/urlFormatter";
import NotFound from "@/components/NotFound";
import { buildCourseDocumentFileHref } from "@/utils/pluggHrefBuilders";
import PluggContactReminder from "@/components/PluggContactReminder";
import PluggDescription from "@/components/PluggDescription";
import PluggHero from "@/components/PluggHero";
import {
	pluggDisplay,
	pluggHighlightActiveTab,
	pluggHighlightHover,
} from "@/utils/pluggStyles";
import { cn } from "@/lib/utils";

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
		month: "short",
		day: "numeric",
	});
}

function normalizeCourseCode(value: string | null | undefined) {
	return value?.trim().toUpperCase() ?? "";
}

function CourseDocumentList({
	documents,
	isSwedish,
	currentCourseCode,
}: {
	documents: Array<CourseDocumentRead>;
	isSwedish: boolean;
	currentCourseCode: string;
}) {
	const { t } = useTranslation("plugg");
	const locale = isSwedish ? "sv-SE" : "en-GB";
	const normalizedCurrentCourseCode = normalizeCourseCode(currentCourseCode);

	return (
		<ul className="divide-y divide-border border-y border-foreground/80">
			{documents.map((document) => {
				const normalizedDocumentCode = normalizeCourseCode(
					document.created_course_code,
				);
				const shouldShowLegacyCodeWarning =
					normalizedCurrentCourseCode.length > 0 &&
					normalizedDocumentCode.length > 0 &&
					normalizedDocumentCode !== normalizedCurrentCourseCode;

				return (
					<li key={document.course_document_id}>
						<a
							href={buildCourseDocumentFileHref(document.course_document_id)}
							target="_blank"
							rel="noopener noreferrer"
							className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-3.5 outline-none focus-visible:bg-muted/60 md:grid-cols-[minmax(0,1fr)_12rem_9rem]"
						>
							<span className="min-w-0 font-medium leading-snug">
								<span className={pluggHighlightHover}>{document.title}</span>
								<ExternalLink
									aria-label={t("courses.documents.open")}
									className="ml-1.5 inline size-3.5 -translate-y-px text-muted-foreground group-hover:text-foreground"
								/>
								{shouldShowLegacyCodeWarning ? (
									<span className="mt-1 flex items-center gap-1.5 text-sm font-normal text-amber-700 dark:text-amber-400">
										<AlertCircle className="size-3.5 shrink-0" />
										{t("courses.documents.legacy_course_code_warning")}{" "}
										{document.created_course_code}
									</span>
								) : null}
							</span>
							<span className="col-start-1 truncate text-sm text-muted-foreground md:col-start-2 md:row-start-1">
								{document.author}
							</span>
							<span className="col-start-2 row-start-1 text-right text-sm tabular-nums text-muted-foreground md:col-start-3">
								<time dateTime={new Date(document.updated_at).toISOString()}>
									{formatDocumentDate(document.updated_at, locale)}
								</time>
							</span>
						</a>
					</li>
				);
			})}
		</ul>
	);
}

export default function CoursePage() {
	const { t, i18n } = useTranslation("plugg");
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

	const singleCourseCode = course.course_code?.trim() || "";
	const locale = isSwedish ? "sv-SE" : "en-GB";

	return (
		<div className="min-h-[calc(100vh-5rem)] pb-16">
			<PluggHero
				title={course.title}
				code={singleCourseCode || null}
				imageId={course.associated_img_id}
				breadcrumbs={[{ label: t("breadcrumb.home"), href: "/plugg" }]}
				meta={[
					t("courses.documents_badge", { count: courseDocuments.length }),
					t("courses.updated_badge", {
						date: formatDocumentDate(course.updated_at, locale),
					}),
				]}
			/>

			<div className="mx-auto mt-10 w-full max-w-6xl space-y-16 px-4 md:mt-14 md:space-y-20 md:px-6">
				<PluggDescription
					text={course.description}
					fallback={t("courses.description_fallback")}
				/>

				<section>
					<h2 className={`${pluggDisplay} pb-6 text-4xl md:text-5xl`}>
						{t("courses.documents.title")}
					</h2>

					<div className="grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-[12rem_minmax(0,1fr)]">
						<div className="lg:sticky lg:top-28 lg:self-start">
							{groupedDocuments.length > 1 ? (
								<nav
									aria-label={t("courses.documents.title")}
									className="flex flex-wrap gap-x-5 gap-y-1 lg:flex-col lg:border-t lg:border-foreground/80 lg:pt-2"
								>
									{groupedDocuments.map((categoryGroup) => (
										<a
											key={categoryGroup.id}
											href={`#${urlFormatter(categoryGroup.id)}`}
											className="group py-1 text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
										>
											<span className={pluggHighlightHover}>
												{categoryGroup.label}
											</span>
										</a>
									))}
								</nav>
							) : null}
						</div>

						{groupedDocuments.length === 0 ? (
							<p className="border-y border-border py-6 text-muted-foreground lg:col-start-2">
								{t("courses.documents.empty")}
							</p>
						) : (
							<div className="space-y-14 lg:col-start-2">
								{groupedDocuments.map((categoryGroup) => {
									const shouldShowTabs = categoryGroup.subCategories.length > 1;
									const firstSubCategory = categoryGroup.subCategories[0];

									return (
										<section
											key={categoryGroup.id}
											id={urlFormatter(categoryGroup.id)}
											className="scroll-mt-28"
										>
											<h3 className="pb-3 text-2xl font-semibold tracking-tight">
												{categoryGroup.label}
											</h3>

											{shouldShowTabs ? (
												<Tabs defaultValue={firstSubCategory?.id}>
													<TabsList className="h-auto w-full flex-wrap justify-start gap-x-5 gap-y-1 rounded-none bg-transparent p-0 pb-3">
														{categoryGroup.subCategories.map((subCategory) => (
															<TabsTrigger
																key={`${categoryGroup.id}-${subCategory.id}`}
																value={subCategory.id}
																className="group h-auto flex-none gap-1.5 rounded-none border-0 bg-transparent px-0 py-1 text-base font-normal text-muted-foreground shadow-none hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:font-medium data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent"
															>
																<span className={pluggHighlightActiveTab}>
																	{subCategory.label}
																</span>
																<span className="text-sm tabular-nums text-muted-foreground">
																	{subCategory.documents.length}
																</span>
															</TabsTrigger>
														))}
													</TabsList>

													{categoryGroup.subCategories.map((subCategory) => (
														<TabsContent
															key={`${categoryGroup.id}-content-${subCategory.id}`}
															value={subCategory.id}
															className="mt-0"
														>
															<CourseDocumentList
																documents={subCategory.documents}
																isSwedish={isSwedish}
																currentCourseCode={singleCourseCode}
															/>
														</TabsContent>
													))}
												</Tabs>
											) : firstSubCategory ? (
												<>
													{firstSubCategory.id !== GENERAL_SUB_CATEGORY_KEY ? (
														<p className="pb-3 text-muted-foreground">
															{firstSubCategory.label}
														</p>
													) : null}

													<CourseDocumentList
														documents={firstSubCategory.documents}
														isSwedish={isSwedish}
														currentCourseCode={singleCourseCode}
													/>
												</>
											) : null}
										</section>
									);
								})}
							</div>
						)}
					</div>
				</section>

				<PluggContactReminder />
			</div>
		</div>
	);
}
