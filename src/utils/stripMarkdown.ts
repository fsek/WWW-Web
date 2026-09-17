// Turns a markdown string into plain text suitable for short previews.
export default function stripMarkdown(text: string) {
	return text
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/`{1,3}|[#>*_~$|]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}
