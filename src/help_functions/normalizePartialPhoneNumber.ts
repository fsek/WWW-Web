import { parseIncompletePhoneNumber } from "libphonenumber-js";

const PHONE_LIKE = /^[+\d][\d\s\-()]*$/;

// Turns a partial phone number into a prefix comparable with a stored E.164 number.
// Returns null for search terms that are not phone-like, so that emails and stil-ids
// are not stripped down to their digits and matched against phone numbers.
export default function normalizePartialPhoneNumber(
	phoneNumber: string | null,
): string | null {
	const trimmed = phoneNumber?.trim();
	if (!trimmed || !PHONE_LIKE.test(trimmed)) {
		// Empty or non-phone-like search term (like an email or stil-id)
		return null;
	}
	const parsedPhoneNumber = parseIncompletePhoneNumber(trimmed);
	if (!parsedPhoneNumber) {
		return null;
	}
	// A leading 0 can be replaced with +46 since thats how most people will search
	return parsedPhoneNumber.startsWith("0")
		? `+46${parsedPhoneNumber.slice(1)}`
		: parsedPhoneNumber;
}
