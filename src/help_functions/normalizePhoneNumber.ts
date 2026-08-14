import parsePhoneNumberFromString from "libphonenumber-js";
import { isPossiblePhoneNumber } from "libphonenumber-js";

export default function normalizePhoneNumber(
	phoneNumber: string | null,
): string | null {
	if (!phoneNumber) {
		return null;
	}
	let cleanedPhoneNumber = phoneNumber;
	if (phoneNumber.startsWith("tel:")) {
		cleanedPhoneNumber = phoneNumber.replace("tel:", "");
	}
	if (!isPossiblePhoneNumber(cleanedPhoneNumber, "SE")) {
		return null;
	}
	const parsedPhoneNumber = parsePhoneNumberFromString(
		cleanedPhoneNumber,
		"SE",
	);
	if (!parsedPhoneNumber) {
		return null;
	}
	return parsedPhoneNumber.number;
}
