import { parseIncompletePhoneNumber } from "libphonenumber-js";

export default function normalizePartialPhoneNumber(
	phoneNumber: string | null,
): string | null {
	if (!phoneNumber) {
		return null;
	}
	const parsedPhoneNumber = parseIncompletePhoneNumber(phoneNumber);
	return parsedPhoneNumber;
}
