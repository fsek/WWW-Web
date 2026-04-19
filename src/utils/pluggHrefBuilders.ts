import urlFormatter from "@/utils/urlFormatter";

export function buildProgramHref(programTitle: string) {
	return `/plugg/program/${urlFormatter(programTitle)}`;
}

export function buildProgramYearHref(
	programTitle: string,
	programYearTitle: string,
) {
	return `/plugg/program/${urlFormatter(programTitle)}/arskurser/${urlFormatter(programYearTitle)}`;
}

export function buildCourseHref(courseTitle: string) {
	return `/plugg/kurser/${urlFormatter(courseTitle)}`;
}

export function buildSpecialisationHref(specialisationTitle: string) {
	return `/plugg/specialiseringar/${urlFormatter(specialisationTitle)}`;
}

export function buildCourseDocumentFileHref(courseDocumentId: number) {
	return `/kursdokument//${courseDocumentId}`;
}
