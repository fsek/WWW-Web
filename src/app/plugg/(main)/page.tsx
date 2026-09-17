"use client";

import ImageDisplay from "@/components/ImageDisplay";
import { Skeleton } from "@/components/ui/skeleton";
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
import stripMarkdown from "@/utils/stripMarkdown";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useTranslation } from "react-i18next";
import {
	pluggDisplay,
	pluggGraphPaper,
	pluggHighlightHover,
} from "@/utils/pluggStyles";
import { cn } from "@/lib/utils";

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

function getCourseSearchText(course: CourseRead) {
	const shortIdentifierTerms =
		course.short_identifier
			?.split(",")
			.map((term) => term.trim())
			.filter(Boolean) ?? [];

	return [getCourseLabel(course), ...shortIdentifierTerms]
		.join(" ")
		.toLocaleLowerCase();
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

		const allItems: Array<SearchResult & { searchText: string }> = [];

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
				searchText: programTitle.toLocaleLowerCase(),
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
					searchText: `${programTitle} ${yearTitle}`.toLocaleLowerCase(),
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
					searchText:
						`${programTitle} ${specialisationTitle}`.toLocaleLowerCase(),
				});
			}
		}

		for (const course of allCourses) {
			allItems.push({
				label: getCourseLabel(course),
				href: buildCourseHref(course.title),
				kind: "course",
				secondary: null,
				searchText: getCourseSearchText(course),
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
			.filter((item) => item.searchText.includes(searchTerm))
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

	const contactEmail = t("plugg:contact_reminder.email");

	return (
		<div className="min-h-[calc(100vh-5rem)] pb-20 text-foreground">
			<section className="relative isolate">
				<div
					aria-hidden="true"
					className={`${pluggGraphPaper} absolute inset-0 -z-10 opacity-70`}
				/>

				<div className="mx-auto w-full max-w-6xl px-4 pt-12 pb-10 md:px-6 md:pt-20 md:pb-14">
					<h1
						className={`${pluggDisplay} max-w-4xl text-balance text-6xl sm:text-7xl md:text-8xl`}
					>
						{t("plugg:page.title")}
					</h1>
					<p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-muted-foreground">
						{t("plugg:page.intro")}
					</p>

					<div className="mt-10 max-w-3xl">
						<label
							htmlFor="plugg-search"
							className="block text-sm font-medium text-muted-foreground"
						>
							{t("plugg:page.search_title")}
						</label>
						<div className="relative">
							<Search className="pointer-events-none absolute left-0 top-1/2 size-6 -translate-y-1/2 text-foreground" />
							<input
								id="plugg-search"
								type="search"
								autoComplete="off"
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								placeholder={t("plugg:page.search_placeholder")}
								className="h-16 w-full border-0 border-b-4 border-foreground bg-transparent pl-10 text-xl font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground/70 focus:border-primary md:text-2xl"
							/>
						</div>

						{searchTerm ? (
							<div className="mt-2" aria-live="polite">
								{isSearchLoading ? (
									<p className="py-4 text-muted-foreground">
										{t("plugg:navbar.loading")}
									</p>
								) : searchHasError ? (
									<p className="py-4 text-destructive">
										{t("plugg:navbar.load_error")}
									</p>
								) : searchResults.length === 0 ? (
									<p className="py-4 text-muted-foreground">
										{t("plugg:page.search_empty")}
									</p>
								) : (
									<ul className="max-h-[30rem] divide-y divide-border overflow-y-auto">
										{searchResults.map((result) => (
											<li key={`${result.kind}-${result.label}-${result.href}`}>
												<Link
													href={result.href}
													className="group grid grid-cols-[6.5rem_1fr] items-baseline gap-x-4 py-3 outline-none focus-visible:bg-muted/60"
												>
													<span className="text-sm text-muted-foreground">
														{kindLabel[result.kind]}
													</span>
													<span className="min-w-0">
														<span className="font-medium">
															<span className={pluggHighlightHover}>
																{result.label}
															</span>
														</span>
														{result.secondary ? (
															<span className="block truncate text-sm text-muted-foreground">
																{result.secondary}
															</span>
														) : null}
													</span>
												</Link>
											</li>
										))}
									</ul>
								)}
							</div>
						) : null}
					</div>
				</div>

				<div className="mx-auto w-full max-w-6xl px-4 md:px-6">
					<div className="border-t-4 border-primary" />
				</div>
			</section>

			<div className="mx-auto mt-14 w-full max-w-6xl space-y-20 px-4 md:mt-20 md:px-6">
				<section>
					<h2 className={`${pluggDisplay} pb-4 text-4xl md:text-5xl`}>
						{t("plugg:page.program_list_title")}
					</h2>

					{isLoadingPrograms ? (
						<div className="divide-y divide-border border-y border-foreground/80">
							{[0, 1, 2].map((index) => (
								<div key={index} className="py-6">
									<Skeleton className="h-10 w-2/5" />
									<Skeleton className="mt-3 h-4 w-3/5" />
								</div>
							))}
						</div>
					) : programsError ? (
						<p className="border-y border-border py-6 text-destructive">
							{t("plugg:navbar.load_error")}
						</p>
					) : programCards.length === 0 ? (
						<p className="border-y border-border py-6 text-muted-foreground">
							{t("plugg:page.program_list_empty")}
						</p>
					) : (
						<ul className="divide-y divide-border border-y border-foreground/80">
							{programCards.map((program) => (
								<li key={program.programId}>
									<Link
										href={buildProgramHref(program.title)}
										className="group block py-8 outline-none focus-visible:bg-muted/60 md:py-10"
									>
										{program.imageId ? (
											<>
												<span className="relative block aspect-[16/9] overflow-hidden bg-muted sm:aspect-[21/9] md:rounded-t-md lg:aspect-[3/1]">
													<ImageDisplay
														type="associated_img"
														imageId={program.imageId}
														alt=""
														className="object-cover"
														size="large"
														sizes="(min-width: 1152px) 1104px, 100vw"
														fill
													/>
												</span>
												{/* Same paper label on the photo as the page hero */}
												<span className="block border-t-4 border-primary">
													<span className="relative -mt-12 block w-fit max-w-[85%] bg-background pt-3 pr-6 sm:-mt-16 md:-mt-20 md:pt-5 md:pr-10">
														<span
															className={`${pluggDisplay} text-4xl text-balance sm:text-5xl md:text-6xl`}
														>
															<span className={pluggHighlightHover}>
																{program.title}
															</span>
														</span>
													</span>
												</span>
											</>
										) : (
											<span
												className={`${pluggDisplay} block text-4xl text-balance sm:text-5xl md:text-6xl`}
											>
												<span className={pluggHighlightHover}>
													{program.title}
												</span>
											</span>
										)}
										<span className="mt-3 line-clamp-3 block max-w-[62ch] leading-relaxed text-muted-foreground">
											{program.description
												? stripMarkdown(program.description)
												: t("plugg:page.program_description_fallback")}
										</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</section>

				<div className="grid grid-cols-1 gap-x-12 gap-y-10 border-t border-dashed border-foreground/40 pt-8 md:grid-cols-[3fr_2fr]">
					<section className="max-w-[60ch]">
						<h2 className="text-2xl font-semibold leading-tight tracking-tight">
							{t("plugg:page.contact_card_title")}
						</h2>
						<p className="mt-3 leading-relaxed text-foreground/90">
							{t("plugg:page.contact_card_text")}
						</p>
						<p className="mt-3 leading-relaxed text-muted-foreground">
							{t("plugg:page.contact_card_note")}
						</p>
						<a
							href={`mailto:${contactEmail}`}
							className="mt-5 inline-block text-lg font-semibold underline decoration-primary decoration-4 underline-offset-[6px] hover:decoration-[6px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
						>
							{contactEmail}
						</a>
					</section>

					<section className="max-w-[46ch] md:border-l md:border-border md:pl-12">
						<h2 className="text-xl font-semibold leading-tight tracking-tight">
							{t("plugg:page.advertisement_title")}
						</h2>
						<p className="mt-3 leading-relaxed text-muted-foreground">
							{t("plugg:page.advertisement_text")}
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
