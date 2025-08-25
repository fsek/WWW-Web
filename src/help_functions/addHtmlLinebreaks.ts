// Helper to add HTML linebreaks to descriptions
export default function addHtmlLinebreaks(
	value: string | null | undefined,
): string {
	if (!value) return "";
	// Add html newlines where they should be
	return value.replace(/\n/g, "<br />\n");
}
