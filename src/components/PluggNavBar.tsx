"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import FLogga from "@/assets/f-logga";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import {
	getAllProgramsOptions,
	getAllProgramYearsOptions,
	getAllSpecialisationsOptions,
	getAllCoursesOptions,
} from "@/api/@tanstack/react-query.gen";
import type {
	CourseRead,
	ProgramRead,
	ProgramYearRead,
	SimpleCourseRead,
	SpecialisationRead,
} from "@/api/types.gen";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetClose,
	SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

type ProgramYearMenu = {
	programYearId: number;
	programId: number;
	titleSv: string;
	titleEn: string;
	courses: SimpleCourseRead[];
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

function getLocalizedTitle(
	isSwedish: boolean,
	titleSv: string,
	titleEn: string,
) {
	return isSwedish ? titleSv : titleEn;
}

function getCourseLabel(course: SimpleCourseRead) {
	return course.course_code
		? `${course.course_code} - ${course.title}`
		: course.title;
}

function toSimpleCourse(
	course: CourseRead | SimpleCourseRead,
): SimpleCourseRead {
	return {
		course_id: course.course_id,
		title: course.title,
		course_code: course.course_code,
		associated_img_id: course.associated_img_id,
	};
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

function addUniqueCourse(
	courses: SimpleCourseRead[],
	course: SimpleCourseRead,
) {
	if (courses.some((existing) => existing.course_id === course.course_id)) {
		return;
	}
	courses.push(course);
}

function urlFormatter(value: string | number) {
	return String(value)
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[åä]/g, "a")
		.replace(/ö/g, "o")
		.replace(/[^a-z0-9\-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function buildProgramHref(programTitle: string) {
	return `/plugg/program/${urlFormatter(programTitle)}`;
}

function buildProgramYearHref(programTitle: string, programYearTitle: string) {
	return `/plugg/program/${urlFormatter(programTitle)}/year/${urlFormatter(programYearTitle)}`;
}

function buildCourseHref(courseTitle: string) {
	return `/plugg/course/${urlFormatter(courseTitle)}`;
}

function buildSpecialisationHref(specialisationTitle: string) {
	return `/plugg/specialisation/${urlFormatter(specialisationTitle)}`;
}

function useProgramMenus(isSwedish: boolean) {
	const queryOptions = {
		staleTime: 1000 * 60 * 60, // 1 hour
		refetchOnWindowFocus: false,
	};

	const {
		data: programsData,
		isLoading: isLoadingPrograms,
		error: programsError,
	} = useQuery({
		...getAllProgramsOptions(),
		...queryOptions,
	});
	const {
		data: programYearsData,
		isLoading: isLoadingProgramYears,
		error: programYearsError,
	} = useQuery({
		...getAllProgramYearsOptions(),
		...queryOptions,
	});
	const {
		data: coursesData,
		isLoading: isLoadingCourses,
		error: coursesError,
	} = useQuery({
		...getAllCoursesOptions(),
		...queryOptions,
	});

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

		const addYear = (year: ProgramYearRead) => {
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
					courses: [...(year.courses ?? [])],
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
			specialisation: SpecialisationRead,
			program_id: number,
		) => {
			const specialisationsForProgram = specialisationBuckets.get(program_id);
			if (!specialisationsForProgram) {
				return;
			}

			specialisationsForProgram.set(specialisation.specialisation_id, {
				specialisationId: specialisation.specialisation_id,
				programId: program_id,
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
			const simpleCourse = toSimpleCourse(course);
			for (const year of course.program_years ?? []) {
				addYear(year);
				const yearEntry = yearBuckets
					.get(year.program_id)
					?.get(year.program_year_id);
				if (!yearEntry) {
					continue;
				}
				addUniqueCourse(yearEntry.courses, simpleCourse);
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

		result.sort((a, b) =>
			collator.compare(
				getLocalizedTitle(isSwedish, a.titleSv, a.titleEn),
				getLocalizedTitle(isSwedish, b.titleSv, b.titleEn),
			),
		);

		return result;
	}, [programsData, programYearsData, coursesData, isSwedish]);

	return {
		menus,
		isLoading: isLoadingPrograms || isLoadingProgramYears || isLoadingCourses,
		hasError:
			Boolean(programsError) ||
			Boolean(programYearsError) ||
			Boolean(coursesError),
	};
}

function MobileNavLink({
	href,
	children,
	className,
}: {
	href: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<SheetClose asChild>
			<Link
				href={href}
				className={cn(
					"block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
					className,
				)}
			>
				{children}
			</Link>
		</SheetClose>
	);
}

export function NavBar() {
	const { t } = useTranslation();

	return (
		<header className="sticky top-0 z-50 w-full border-transparent bg-white/50 backdrop-blur-md dark:bg-background/40 overflow-visible">
			<div className="xl:container mx-auto flex h-20 items-center justify-between gap-3 px-4">
				<div className="flex items-center shrink-0 relative">
					<div className="absolute right-full pr-3 sm:pr-5 z-50 flex items-center">
						<Button
							variant="outline"
							size="sm"
							className="gap-2 whitespace-nowrap shadow-sm backdrop-blur-md bg-white/80 dark:bg-background/80 pointer-events-auto"
							asChild
						>
							<Link href="/home">
								<ArrowLeft className="h-4 w-4" />
								<span className="hidden sm:inline">
									{t("plugg:navbar.back")}
								</span>
							</Link>
						</Button>
					</div>
					<Link
						href="https://plugg.fsektionen.se"
						className="flex items-center"
						prefetch={false}
					>
						<FLogga className="size-14" />
					</Link>
				</div>

				<div className="hidden min-w-0 flex-1 justify-start ml-6 lg:flex">
					<NavBarMenu />
				</div>

				<div className="flex items-center gap-2">
					<LanguageSwitcher />
					<ThemeToggle />

					<div className="lg:hidden">
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon">
									<Menu className="h-5 w-5" />
									<span className="sr-only">
										{t("plugg:navbar.toggle_menu")}
									</span>
								</Button>
							</SheetTrigger>
							<SheetContent
								side="right"
								className="w-[300px] overflow-auto sm:w-[400px]"
							>
								<VisuallyHidden>
									<SheetTitle className="mx-auto mt-3 text-xl font-semibold">
										{t("plugg:navbar.mobile_navigation")}
									</SheetTitle>
								</VisuallyHidden>
								<div className="py-4">
									<NavBarMenu isMobile />
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</header>
	);
}

export function NavBarMenu({ isMobile = false }: { isMobile?: boolean }) {
	const { t, i18n } = useTranslation();
	const isSwedish = (i18n.resolvedLanguage ?? i18n.language)
		.toLowerCase()
		.startsWith("sv");

	const { menus, isLoading, hasError } = useProgramMenus(isSwedish);

	if (isLoading && menus.length === 0) {
		return (
			<div className="px-2 py-2 text-sm text-muted-foreground">
				{t("plugg:navbar.loading")}
			</div>
		);
	}

	if (hasError && menus.length === 0) {
		return (
			<div className="px-2 py-2 text-sm text-destructive">
				{t("plugg:navbar.load_error")}
			</div>
		);
	}

	if (menus.length === 0) {
		return (
			<div className="px-2 py-2 text-sm text-muted-foreground">
				{t("plugg:navbar.empty")}
			</div>
		);
	}

	if (isMobile) {
		return (
			<div className="space-y-3 px-2">
				{menus.map((program) => (
					<div
						key={program.programId}
						className="rounded-md border border-border bg-background/60 p-3"
					>
						<MobileNavLink
							href={buildProgramHref(
								getLocalizedTitle(isSwedish, program.titleSv, program.titleEn),
							)}
							className="px-0 text-base font-semibold hover:bg-transparent"
						>
							{getLocalizedTitle(isSwedish, program.titleSv, program.titleEn)}
						</MobileNavLink>

						{program.years.map((year) => (
							<div key={year.programYearId} className="mt-3">
								<MobileNavLink
									href={buildProgramYearHref(
										getLocalizedTitle(
											isSwedish,
											program.titleSv,
											program.titleEn,
										),
										getLocalizedTitle(isSwedish, year.titleSv, year.titleEn),
									)}
									className="px-0 text-sm font-medium hover:bg-transparent"
								>
									{getLocalizedTitle(isSwedish, year.titleSv, year.titleEn)}
								</MobileNavLink>

								<div className="mt-1 space-y-1 border-l border-border pl-3">
									{year.courses.map((course) => (
										<MobileNavLink
											key={course.course_id}
											href={buildCourseHref(course.title)}
										>
											{getCourseLabel(course)}
										</MobileNavLink>
									))}
								</div>
							</div>
						))}

						{program.specialisations.length > 0 && (
							<div className="mt-3">
								<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									{t("plugg:navbar.specialisations")}
								</p>
								<div className="space-y-1">
									{program.specialisations.map((specialisation) => (
										<MobileNavLink
											key={specialisation.specialisationId}
											href={buildSpecialisationHref(
												getLocalizedTitle(
													isSwedish,
													specialisation.titleSv,
													specialisation.titleEn,
												),
											)}
										>
											{getLocalizedTitle(
												isSwedish,
												specialisation.titleSv,
												specialisation.titleEn,
											)}
										</MobileNavLink>
									))}
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="w-full">
			<NavigationMenu className="justify-start">
				<NavigationMenuList>
					{menus.map((program) => (
						<NavigationMenuItem key={program.programId}>
							<NavigationMenuTrigger className="bg-transparent hover:bg-accent focus:bg-accent text-base font-medium border-2 border-transparent hover:border-foreground/30">
								{getLocalizedTitle(isSwedish, program.titleSv, program.titleEn)}
							</NavigationMenuTrigger>
							<NavigationMenuContent>
								<div className="pb-6 px-6 pt-2 w-max max-w-[90vw] md:w-[600px] lg:w-[800px] max-h-[75vh] overflow-y-auto">
									<div className="mb-2">
										<Link
											href={buildProgramHref(
												getLocalizedTitle(
													isSwedish,
													program.titleSv,
													program.titleEn,
												),
											)}
											className="inline-flex items-center rounded-sm text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
										>
											{t("plugg:navbar.open_program")}
										</Link>
									</div>
									{program.years.length > 0 && (
										<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
											{program.years.map((year) => (
												<div
													key={year.programYearId}
													className="flex flex-col space-y-2"
												>
													<Link
														href={buildProgramYearHref(
															getLocalizedTitle(
																isSwedish,
																program.titleSv,
																program.titleEn,
															),
															getLocalizedTitle(
																isSwedish,
																year.titleSv,
																year.titleEn,
															),
														)}
														className="text-base font-semibold hover:underline"
													>
														{getLocalizedTitle(
															isSwedish,
															year.titleSv,
															year.titleEn,
														)}
													</Link>
													<ul className="flex flex-col space-y-1.5 text-sm text-muted-foreground">
														{year.courses.length > 0 ? (
															year.courses.map((course) => (
																<li key={course.course_id}>
																	<Link
																		href={buildCourseHref(course.title)}
																		className="hover:text-foreground line-clamp-2 transition-colors"
																	>
																		{getCourseLabel(course)}
																	</Link>
																</li>
															))
														) : (
															<li className="italic opacity-60">
																{t("plugg:navbar.no_courses")}
															</li>
														)}
													</ul>
												</div>
											))}
										</div>
									)}

									{program.specialisations.length > 0 && (
										<div
											className={cn(
												"mt-6 pt-4 border-t border-border",
												program.years.length === 0 && "mt-0 pt-0 border-t-0",
											)}
										>
											<p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
												{t("plugg:navbar.specialisations")}
											</p>
											<div className="flex flex-wrap gap-2">
												{program.specialisations.map((specialisation) => (
													<Button
														key={specialisation.specialisationId}
														asChild
														variant="secondary"
														className="h-9 font-medium"
													>
														<Link
															href={buildSpecialisationHref(
																getLocalizedTitle(
																	isSwedish,
																	specialisation.titleSv,
																	specialisation.titleEn,
																),
															)}
														>
															{getLocalizedTitle(
																isSwedish,
																specialisation.titleSv,
																specialisation.titleEn,
															)}
														</Link>
													</Button>
												))}
											</div>
										</div>
									)}
								</div>
							</NavigationMenuContent>
						</NavigationMenuItem>
					))}
				</NavigationMenuList>
			</NavigationMenu>
		</div>
	);
}
