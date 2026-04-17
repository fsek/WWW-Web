import urlFormatter from "@/utils/urlFormatter";

export function buildProgramHref(programTitle: string) {
	return `/plugg/program/${urlFormatter(programTitle)}`;
}

export function buildProgramYearHref(programTitle: string, programYearTitle: string) {
	return `/plugg/program/${urlFormatter(programTitle)}/year/${urlFormatter(programYearTitle)}`;
}

export function buildCourseHref(courseTitle: string) {
	return `/plugg/course/${urlFormatter(courseTitle)}`;
}

export function buildSpecialisationHref(specialisationTitle: string) {
	return `/plugg/specialisation/${urlFormatter(specialisationTitle)}`;
}
