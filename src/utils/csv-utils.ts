export function downloadCsvResult(result: unknown, default_name = "data.csv") {
	let blob: Blob | null = null;
	let disposition = "";
	console.log(result, typeof result);
	if (result instanceof Blob) {
		blob = result;
	} else if (typeof result === "string") {
		blob = new Blob([result], { type: "text/csv" });
	} else if (result && typeof result === "object") {
		// generated queryFn or fallback may return an object
		// attempt common shapes
		if (
			typeof result === "object" &&
			result !== null &&
			"blob" in result &&
			result.blob instanceof Blob
		) {
			blob = (result as { blob: Blob }).blob;
			disposition = (result as { disposition?: string }).disposition || "";
		} else if (
			typeof result === "object" &&
			result !== null &&
			"data" in result &&
			typeof (result as { data?: string }).data === "string"
		) {
			blob = new Blob([(result as { data: string }).data], {
				type: "text/csv",
			});
		}
	}
	if (!blob) throw new Error("No CSV data received");
	// extract filename from disposition if present
	let filename = default_name;
	const match =
		disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i) || "";
	console.log(disposition);
	if (match && (match as any)[1]) {
		filename = decodeURIComponent((match as any)[1]);
	}
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
