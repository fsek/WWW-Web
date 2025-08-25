// Helper to strip HTML linebreaks from descriptions
export default function stripHtmlLinebreaks(
	value: string | null | undefined,
): string {
	if (!value) return "";
	// Remove <br>, <br/> and <br /> (case-insensitive)
	return value.replace(/<br\s*\/?>/gi, "");
}
