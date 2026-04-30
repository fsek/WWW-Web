"use client";

import CustomTitle from "@/components/CustomTitle";
import ImageDisplay from "@/components/ImageDisplay";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	getAllCoursesOptions,
	getAllProgramsOptions,
	getAllProgramYearsOptions,
} from "@/api/@tanstack/react-query.gen";
import type { CourseRead, ProgramRead, ProgramYearRead } from "@/api/types.gen";
import {
	buildCourseHref,
	buildProgramHref,
	buildProgramYearHref,
	buildSpecialisationHref,
} from "@/utils/pluggHrefBuilders";
import { useQuery } from "@tanstack/react-query";
import {
	ArrowRight,
	BookText,
	Calendar,
	GraduationCap,
	Route,
	Search,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useTranslation } from "react-i18next";

type ProgramYearMenu = {
	programYearId: number;
	programId: number;
	titleSv: string;
	titleEn: string;
	courses: CourseRead[];
};

type SpecialisationMenu = {
	specialisationId: number;
	programId: number;
	titleSv: string;
	titleEn: string;
};

type ProgramMenu = {
	programId: number;
	titleSv: string;
	titleEn: string;
	years: ProgramYearMenu[];
	specialisations: SpecialisationMenu[];
};

type ProgramYearSource = {
	program_year_id: number;
	program_id: number;
	title_sv: string;
	title_en: string;
	courses?: Array<CourseRead>;
};

type SpecialisationSource = {
	specialisation_id: number;
	title_sv: string;
	title_en: string;
};

type SearchResultKind =
	| "program"
	| "program_year"
	| "course"
	| "specialisation";

type SearchResult = {
	label: string;
	href: string;
	kind: SearchResultKind;
	secondary: string | null;
};

function getLocalizedTitle(
	isSwedish: boolean,
	titleSv: string,
	titleEn: string,
) {
	return isSwedish ? titleSv : titleEn;
}

function getCourseLabel(course: CourseRead) {
	return course.course_code
		? `${course.course_code} - ${course.title}`
		: course.title;
}

function ensureInnerMap<T>(root: Map<number, Map<number, T>>, key: number) {
	const existing = root.get(key);
	if (existing) {
		return existing;
	}

	const next = new Map<number, T>();
	root.set(key, next);
	return next;
}

function addUniqueCourse(courses: CourseRead[], course: CourseRead) {
	if (courses.some((existing) => existing.course_id === course.course_id)) {
		return;
	}

	courses.push(course);
}

function truncateDescription(text: string, maxChars: number) {
	const normalizedText = text.replace(/\s+/g, " ").trim();
	if (normalizedText.length <= maxChars) {
		return normalizedText;
	}

	return `${normalizedText.slice(0, maxChars).trimEnd()}...`;
}

export default function MainLanding() {
	const { t, i18n } = useTranslation();
	const [searchQuery, setSearchQuery] = React.useState("");

	const isSwedish = (i18n.resolvedLanguage ?? i18n.language)
		.toLowerCase()
		.startsWith("sv");

	const {
		data: programsData,
		isLoading: isLoadingPrograms,
		error: programsError,
	} = useQuery({
		...getAllProgramsOptions(),
		staleTime: 1000 * 60 * 60,
		refetchOnWindowFocus: false,
	});
	const {
		data: programYearsData,
		isLoading: isLoadingProgramYears,
		error: programYearsError,
	} = useQuery({
		...getAllProgramYearsOptions(),
		staleTime: 1000 * 60 * 60,
		refetchOnWindowFocus: false,
	});
	const {
		data: coursesData,
		isLoading: isLoadingCourses,
		error: coursesError,
	} = useQuery({
		...getAllCoursesOptions(),
		staleTime: 1000 * 60 * 60,
		refetchOnWindowFocus: false,
	});

	const allPrograms = React.useMemo(
		() => (programsData ?? []) as ProgramRead[],
		[programsData],
	);

	const programCards = React.useMemo(() => {
		const collator = new Intl.Collator(isSwedish ? "sv" : "en", {
			sensitivity: "base",
		});

		return allPrograms
			.map((program) => ({
				programId: program.program_id,
				title: isSwedish ? program.title_sv : program.title_en,
				titleSv: program.title_sv,
				titleEn: program.title_en,
				description: isSwedish
					? program.description_sv
					: program.description_en,
				imageId: program.associated_img_id,
			}))
			.sort((a, b) => {
				// This sorting places "teknisk" programs first (so the most important ones)
				const aPriority = a.title
					.trim()
					.toLocaleLowerCase()
					.startsWith("teknisk")
					? 0
					: 1;
				const bPriority = b.title
					.trim()
					.toLocaleLowerCase()
					.startsWith("teknisk")
					? 0
					: 1;

				if (aPriority !== bPriority) {
					return aPriority - bPriority;
				}

				return collator.compare(a.title, b.title);
			});
	}, [allPrograms, isSwedish]);

	const menus = React.useMemo(() => {
		const programs = (programsData ?? []) as ProgramRead[];
		const programYears = (programYearsData ?? []) as ProgramYearRead[];
		const courses = (coursesData ?? []) as CourseRead[];

		const yearBuckets = new Map<number, Map<number, ProgramYearMenu>>();
		const specialisationBuckets = new Map<
			number,
			Map<number, SpecialisationMenu>
		>();

		for (const program of programs) {
			ensureInnerMap(yearBuckets, program.program_id);
			ensureInnerMap(specialisationBuckets, program.program_id);
		}

		const addYear = (year: ProgramYearSource) => {
			const yearsForProgram = yearBuckets.get(year.program_id);
			if (!yearsForProgram) {
				return;
			}

			const existingYear = yearsForProgram.get(year.program_year_id);
			if (!existingYear) {
				yearsForProgram.set(year.program_year_id, {
					programYearId: year.program_year_id,
					programId: year.program_id,
					titleSv: year.title_sv,
					titleEn: year.title_en,
					courses: year.courses ?? [],
				});
				return;
			}

			existingYear.titleSv = year.title_sv;
			existingYear.titleEn = year.title_en;
			for (const course of year.courses ?? []) {
				addUniqueCourse(existingYear.courses, course);
			}
		};

		const addSpecialisation = (
			specialisation: SpecialisationSource,
			programId: number,
		) => {
			const specialisationsForProgram = specialisationBuckets.get(programId);
			if (!specialisationsForProgram) {
				return;
			}

			specialisationsForProgram.set(specialisation.specialisation_id, {
				specialisationId: specialisation.specialisation_id,
				programId,
				titleSv: specialisation.title_sv,
				titleEn: specialisation.title_en,
			});
		};

		for (const program of programs) {
			for (const year of program.program_years ?? []) {
				addYear(year);
			}
			for (const specialisation of program.specialisations ?? []) {
				addSpecialisation(specialisation, program.program_id);
			}
		}

		for (const year of programYears) {
			addYear(year);
		}

		for (const course of courses) {
			for (const year of course.program_years ?? []) {
				addYear(year);
				const yearEntry = yearBuckets
					.get(year.program_id)
					?.get(year.program_year_id);
				if (!yearEntry) {
					continue;
				}

				addUniqueCourse(yearEntry.courses, course);
			}
		}

		const collator = new Intl.Collator(isSwedish ? "sv" : "en", {
			sensitivity: "base",
		});

		const result: ProgramMenu[] = programs.map((program) => {
			const years = Array.from(
				yearBuckets.get(program.program_id)?.values() ?? [],
			);
			years.sort((a, b) =>
				collator.compare(
					getLocalizedTitle(isSwedish, a.titleSv, a.titleEn),
					getLocalizedTitle(isSwedish, b.titleSv, b.titleEn),
				),
			);

			for (const year of years) {
				year.courses.sort((a, b) =>
					collator.compare(getCourseLabel(a), getCourseLabel(b)),
				);
			}

			const programSpecialisations = Array.from(
				specialisationBuckets.get(program.program_id)?.values() ?? [],
			);
			programSpecialisations.sort((a, b) =>
				collator.compare(
					getLocalizedTitle(isSwedish, a.titleSv, a.titleEn),
					getLocalizedTitle(isSwedish, b.titleSv, b.titleEn),
				),
			);

			return {
				programId: program.program_id,
				titleSv: program.title_sv,
				titleEn: program.title_en,
				years,
				specialisations: programSpecialisations,
			};
		});

		result.sort((a, b) => {
			const titleA = getLocalizedTitle(isSwedish, a.titleSv, a.titleEn);
			const titleB = getLocalizedTitle(isSwedish, b.titleSv, b.titleEn);
			const aPriority = titleA.trim().toLocaleLowerCase().startsWith("teknisk")
				? 0
				: 1;
			const bPriority = titleB.trim().toLocaleLowerCase().startsWith("teknisk")
				? 0
				: 1;

			if (aPriority !== bPriority) {
				return aPriority - bPriority;
			}

			return collator.compare(titleA, titleB);
		});

		return result;
	}, [programsData, programYearsData, coursesData, isSwedish]);

	const allCourses = React.useMemo(
		() => (coursesData ?? []) as CourseRead[],
		[coursesData],
	);

	const searchTerm = React.useMemo(
		() => searchQuery.trim().toLocaleLowerCase(),
		[searchQuery],
	);

	const searchResults = React.useMemo(() => {
		if (!searchTerm) {
			return [] as SearchResult[];
		}

		const allItems: SearchResult[] = [];

		for (const program of menus) {
			const programTitle = getLocalizedTitle(
				isSwedish,
				program.titleSv,
				program.titleEn,
			);
			allItems.push({
				label: programTitle,
				href: buildProgramHref(programTitle),
				kind: "program",
				secondary: null,
			});

			for (const year of program.years) {
				const yearTitle = getLocalizedTitle(
					isSwedish,
					year.titleSv,
					year.titleEn,
				);
				allItems.push({
					label: yearTitle,
					href: buildProgramYearHref(programTitle, yearTitle),
					kind: "program_year",
					secondary: programTitle,
				});
			}

			for (const specialisation of program.specialisations) {
				const specialisationTitle = getLocalizedTitle(
					isSwedish,
					specialisation.titleSv,
					specialisation.titleEn,
				);
				allItems.push({
					label: specialisationTitle,
					href: buildSpecialisationHref(specialisationTitle),
					kind: "specialisation",
					secondary: programTitle,
				});
			}
		}

		for (const course of allCourses) {
			allItems.push({
				label: getCourseLabel(course),
				href: buildCourseHref(course.title),
				kind: "course",
				secondary: null,
			});
		}

		const seen = new Set<string>();
		const deduped = allItems.filter((item) => {
			const key = `${item.label}__${item.href}__${item.kind}`;
			if (seen.has(key)) {
				return false;
			}

			seen.add(key);
			return true;
		});

		const rankByKind: Record<SearchResultKind, number> = {
			program: 0,
			program_year: 1,
			specialisation: 2,
			course: 3,
		};

		return deduped
			.filter((item) => {
				const haystack =
					`${item.label} ${item.secondary ?? ""}`.toLocaleLowerCase();
				return haystack.includes(searchTerm);
			})
			.sort((a, b) => {
				const startsA = a.label.toLocaleLowerCase().startsWith(searchTerm)
					? 0
					: 1;
				const startsB = b.label.toLocaleLowerCase().startsWith(searchTerm)
					? 0
					: 1;
				if (startsA !== startsB) {
					return startsA - startsB;
				}

				if (rankByKind[a.kind] !== rankByKind[b.kind]) {
					return rankByKind[a.kind] - rankByKind[b.kind];
				}

				return a.label.localeCompare(b.label, isSwedish ? "sv" : "en", {
					sensitivity: "base",
				});
			})
			.slice(0, 24);
	}, [menus, allCourses, searchTerm, isSwedish]);

	const isSearchLoading =
		isLoadingPrograms || isLoadingProgramYears || isLoadingCourses;
	const searchHasError =
		Boolean(programsError) ||
		Boolean(programYearsError) ||
		Boolean(coursesError);

	const kindLabel: Record<SearchResultKind, string> = {
		program: t("plugg:page.search_kind_program"),
		program_year: t("plugg:page.search_kind_program_year"),
		specialisation: t("plugg:page.search_kind_specialisation"),
		course: t("plugg:page.search_kind_course"),
	};

	const kindIcon: Record<SearchResultKind, React.ReactNode> = {
		program: <GraduationCap className="size-4" />,
		program_year: <Calendar className="size-4" />,
		specialisation: <Route className="size-4" />,
		course: <BookText className="size-4" />,
	};

	const contactEmail = t("plugg:contact_reminder.email");

	return (
		<div className="min-h-[calc(100vh-5rem)] bg-background text-foreground">
			<section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 md:py-16">
				<Card className="bg-card text-card-foreground border-border/70 shadow-sm">
					<CardHeader className="pb-2">
						<CustomTitle
							text={t("plugg:page.title")}
							className="mb-1 text-3xl font-bold tracking-tight md:text-4xl"
						/>
						<CardDescription className="text-base leading-relaxed md:text-lg">
							{t("plugg:page.intro")}
						</CardDescription>
					</CardHeader>

					<CardContent className="flex flex-col gap-6 pt-2">
						<div className="rounded-2xl border border-primary/25 bg-orange-50 text-card-foreground dark:bg-orange-950/30 p-4 md:p-6">
							<p className="mb-3 text-sm font-semibold text-foreground/90 md:text-base">
								{t("plugg:page.search_title")}
							</p>
							<div className="relative">
								<Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
								<Input
									type="search"
									value={searchQuery}
									onChange={(event) => setSearchQuery(event.target.value)}
									placeholder={t("plugg:page.search_placeholder")}
									className="h-14 rounded-xl border-border/70 bg-background pl-14 text-base md:text-lg"
								/>
							</div>

							<div className="mt-4">
								{searchTerm &&
									(isSearchLoading ? (
										<div className="rounded-xl border border-dashed border-border/80 bg-background/70 p-4 text-sm text-muted-foreground">
											{t("plugg:navbar.loading")}
										</div>
									) : searchHasError ? (
										<div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
											{t("plugg:navbar.load_error")}
										</div>
									) : searchResults.length === 0 ? (
										<div className="rounded-xl border border-dashed border-border/80 bg-background/70 p-4 text-sm text-muted-foreground">
											{t("plugg:page.search_empty")}
										</div>
									) : (
										<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
											{searchResults.map((result) => (
												<Link
													key={`${result.kind}-${result.label}-${result.href}`}
													href={result.href}
													className="group flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/80 px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-background"
												>
													<div className="min-w-0">
														<p className="truncate text-sm font-medium md:text-base">
															{result.label}
														</p>
														{result.secondary ? (
															<p className="truncate text-xs text-muted-foreground md:text-sm">
																{result.secondary}
															</p>
														) : null}
													</div>
													<div className="flex shrink-0 items-center gap-2">
														<Badge
															variant="secondary"
															className="inline-flex items-center gap-1"
														>
															{kindIcon[result.kind]}
															<span>{kindLabel[result.kind]}</span>
														</Badge>
														<ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
													</div>
												</Link>
											))}
										</div>
									))}
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-end justify-between gap-3">
								<h2 className="text-xl font-semibold tracking-tight md:text-2xl">
									{t("plugg:page.program_list_title")}
								</h2>
							</div>

							{isLoadingPrograms ? (
								<div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
									{t("plugg:navbar.loading")}
								</div>
							) : programsError ? (
								<div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
									{t("plugg:navbar.load_error")}
								</div>
							) : programCards.length === 0 ? (
								<div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
									{t("plugg:page.program_list_empty")}
								</div>
							) : (
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
									{programCards.map((program) => (
										<Card
											key={program.programId}
											className="group h-full overflow-hidden border-border/70 py-0 transition-all hover:shadow-lg"
										>
											<div className="relative h-40 w-full overflow-hidden bg-muted">
												{program.imageId ? (
													<>
														<ImageDisplay
															type="associated_img"
															imageId={program.imageId}
															alt={`Associated image for ${program.title}`}
															className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
															size="medium"
															fill
														/>
														<div className="absolute inset-0 bg-black/10 dark:bg-white/10" />
													</>
												) : (
													<>
														<div
															className="absolute inset-0"
															style={{
																backgroundColor: "#FFA64D",
																backgroundImage:
																	'url("/images/line-in-motion.svg")',
																backgroundRepeat: "repeat",
																backgroundSize: "64px 64px",
															}}
														/>
														<div className="absolute inset-0 bg-black/5 dark:bg-white/5" />
													</>
												)}
												<div className="absolute bottom-3 left-3 right-3">
													<p className="line-clamp-2 text-lg font-semibold text-white drop-shadow-sm">
														{program.title}
													</p>
												</div>
											</div>
											<CardContent className="p-4 flex flex-col justify-between h-full">
												<p className="min-h-10 text-sm leading-relaxed text-muted-foreground">
													{program.description
														? truncateDescription(program.description, 130)
														: t("plugg:page.program_description_fallback")}
												</p>
												<Button asChild variant="secondary" className="w-full">
													<Link href={buildProgramHref(program.title)}>
														{t("plugg:page.open_program")}
														<ArrowRight className="size-4" />
													</Link>
												</Button>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</div>

						<Separator />

						<Card className="overflow-hidden border-primary/25 bg-orange-50 text-card-foreground dark:bg-orange-950/30 gap-1">
							<CardHeader className="pb-2">
								<CardDescription className="text-sm font-semibold uppercase tracking-wide text-primary">
									{t("plugg:page.contact_card_eyebrow")}
								</CardDescription>
								<h3 className="text-2xl font-semibold leading-tight md:text-3xl">
									{t("plugg:page.contact_card_title")}
								</h3>
							</CardHeader>
							<CardContent className="text-sm leading-relaxed text-foreground/90 md:text-base">
								<p>{t("plugg:page.contact_card_text")}</p>
								<p className="text-muted-foreground">
									{t("plugg:page.contact_card_note")}
								</p>
								<Button asChild size="lg" className="mt-1">
									<Link href={`mailto:${contactEmail}`}>
										{t("plugg:page.contact_card_cta")}
									</Link>
								</Button>
							</CardContent>
						</Card>

						<Card className="overflow-hidden border-primary/25 bg-card text-card-foreground/70 gap-1">
							<CardHeader className="pb-0">
								<h2 className="text-2xl font-semibold leading-tight md:text-xl">
									{t("plugg:page.advertisement_title")}
								</h2>
							</CardHeader>
							<CardContent className="text-sm leading-relaxed md:text-base">
								<p>{t("plugg:page.advertisement_text")}</p>
							</CardContent>
						</Card>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
