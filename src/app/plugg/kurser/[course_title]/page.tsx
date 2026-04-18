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
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import urlFormatter from "@/utils/urlFormatter";
import NotFound from "@/components/NotFound";
import { buildCourseDocumentFileHref } from "@/utils/pluggHrefBuilders";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

function CourseDocumentList({
	documents,
	isSwedish,
	authorLabel,
	updatedAtLabel,
	fileNameLabel,
	openLabel,
	onOpen,
}: {
	documents: Array<CourseDocumentRead>;
	isSwedish: boolean;
	authorLabel: string;
	updatedAtLabel: string;
	fileNameLabel: string;
	openLabel: string;
	onOpen: (courseDocumentId: number) => void;
}) {
	const locale = isSwedish ? "sv-SE" : "en-GB";

	return (
		<Card className="overflow-hidden py-0">
			<CardContent className="p-0">
				<ul>
					{documents.map((document, index) => (
						<li key={document.course_document_id}>
							<Button
								type="button"
								variant="ghost"
								onClick={() => onOpen(document.course_document_id)}
								className="group h-auto w-full items-start justify-between gap-3 rounded-none px-4 py-4 text-left whitespace-normal font-normal transition-colors hover:bg-muted/40 md:px-6"
							>
								<div className="flex min-w-0 items-start gap-3 md:gap-4">
									<div className="mt-0.5 rounded-md bg-muted p-2 text-muted-foreground">
										<FileText className="size-4" />
									</div>
									<div className="min-w-0">
										<p className="truncate text-sm font-medium md:text-base">
											{document.title}
										</p>
										<p className="mt-1 truncate text-sm text-muted-foreground">
											{fileNameLabel}: {document.file_name}
										</p>
										<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground md:text-sm">
											<p>
												{authorLabel}: {document.author}
											</p>
											<p>
												{updatedAtLabel}:{" "}
												{formatDocumentDate(document.updated_at, locale)}
											</p>
										</div>
									</div>
								</div>
								<div className="mt-1 hidden items-center gap-1 text-sm text-primary group-hover:underline md:flex">
									{openLabel}
									<ExternalLink className="size-4" />
								</div>
							</Button>
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
					totalDocuments: subCategories.reduce(
						(total, subCategory) => total + subCategory.documents.length,
						0,
					),
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

	const singleCourseCode = course.course_code?.trim();
	const courseCodeBadge = singleCourseCode
		? t("courses.course_code_badge", { code: singleCourseCode })
		: t("courses.course_code_missing");
	const locale = isSwedish ? "sv-SE" : "en-GB";
	const courseUpdatedBadge = t("courses.updated_badge", {
		date: formatDocumentDate(course.updated_at, locale),
	});

	return (
		<div className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
			<div className="mb-6 space-y-4">
				<Button variant="outline" onClick={() => router.back()}>
					<ArrowLeft />
					{t("courses.back")}
				</Button>

				<div className="space-y-2">
					<h1 className="text-3xl font-bold leading-tight md:text-4xl">
						{course.title}
					</h1>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary">{courseCodeBadge}</Badge>
						<Badge variant="secondary">{courseUpdatedBadge}</Badge>
						<Badge variant="secondary">
							{t("courses.documents_badge", { count: courseDocuments.length })}
						</Badge>
					</div>
				</div>
			</div>

			<Card className="mb-8 overflow-hidden">
				{course.associated_img_id ? (
					<div className="relative h-56 w-full bg-muted md:h-72">
						<ImageDisplay
							type="associated_img"
							imageId={course.associated_img_id}
							alt={`Associated image for ${course.title}`}
							className="object-cover"
							size="large"
							fill
						/>
					</div>
				) : null}
				<CardContent className="pt-6">
					<LocalizedDescription
						text={course.description}
						fallback={t("courses.description_fallback")}
					/>
				</CardContent>
			</Card>

			<section>
				<h2 className="mb-4 text-2xl font-semibold">
					{t("courses.documents.title")}
				</h2>

				{groupedDocuments.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						{t("courses.documents.empty")}
					</p>
				) : (
					<div className="space-y-8">
						{groupedDocuments.map((categoryGroup) => {
							const shouldShowTabs = categoryGroup.subCategories.length > 1;
							const firstSubCategory = categoryGroup.subCategories[0];

							return (
								<section key={categoryGroup.id} className="space-y-4">
									<div className="flex flex-wrap items-baseline justify-between gap-2">
										<h3 className="text-xl font-semibold">
											{categoryGroup.label}
										</h3>
										<p className="text-sm text-muted-foreground">
											{t("courses.documents_badge", {
												count: categoryGroup.totalDocuments,
											})}
										</p>
									</div>

									{shouldShowTabs ? (
										<Tabs defaultValue={firstSubCategory?.id}>
											<TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
												{categoryGroup.subCategories.map((subCategory) => (
													<TabsTrigger
														key={`${categoryGroup.id}-${subCategory.id}`}
														value={subCategory.id}
														className="h-9 rounded-full border bg-muted px-4 data-[state=active]:border-primary dark:data-[state=active]:border-primary"
													>
														{subCategory.label}
													</TabsTrigger>
												))}
											</TabsList>

											{categoryGroup.subCategories.map((subCategory) => (
												<TabsContent
													key={`${categoryGroup.id}-content-${subCategory.id}`}
													value={subCategory.id}
												>
													<CourseDocumentList
														documents={subCategory.documents}
														isSwedish={isSwedish}
														authorLabel={t("courses.documents.author")}
														updatedAtLabel={t("courses.documents.updated_at")}
														fileNameLabel={t("courses.documents.file_name")}
														openLabel={t("courses.documents.open")}
														onOpen={openCourseDocument}
													/>
												</TabsContent>
											))}
										</Tabs>
									) : firstSubCategory ? (
										<div className="space-y-3">
											{firstSubCategory.id !== GENERAL_SUB_CATEGORY_KEY ? (
												<p className="text-sm text-muted-foreground">
													{firstSubCategory.label}
												</p>
											) : null}

											<CourseDocumentList
												documents={firstSubCategory.documents}
												isSwedish={isSwedish}
												authorLabel={t("courses.documents.author")}
												updatedAtLabel={t("courses.documents.updated_at")}
												fileNameLabel={t("courses.documents.file_name")}
												openLabel={t("courses.documents.open")}
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
	);
}
