export default function formatTime(dateInput: Date | string): string {
	let date: Date;

	if (typeof dateInput === "string") {
		date = new Date(dateInput);
		if (Number.isNaN(date.getTime())) {
			// Check for invalid date
			throw new Error("Invalid date string provided.");
		}
	} else if (dateInput instanceof Date) {
		date = dateInput;
	} else {
		throw new TypeError("Invalid type for dateInput. Expected Date or string.");
	}

	const year = String(date.getFullYear());
	const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	const formatted = `${year}-${month}-${day} ${hours}:${minutes}`;
	return formatted;
}
