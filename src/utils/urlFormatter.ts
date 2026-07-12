export default function urlFormatter(value: string | number) {
	return String(value)
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[åä]/g, "a")
		.replace(/ö/g, "o")
		.replace(/[^a-z0-9\-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}
