// Turns string containing list of different types of identifier into three arrays of normalized identifiers
// then calls the createBatchMutation with the normalized identifiers
import normalizePhoneNumber from "@/help_functions/normalizePhoneNumber";
import type { useTranslation } from "react-i18next";
import { isValidPhoneNumber } from "libphonenumber-js";

export type BatchAddResult =
	| {
			success: true;
			result: {
				email: string | null;
				telephone_number: string | null;
				stil_id: string | null;
			}[];
	  }
	| {
			success: false;
			errorType: "INVALID_FORMAT" | "EMPTY_INPUT";
			message: string;
	  };

function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function validateStilId(stilId: string): boolean {
	const stilIdRegex = /^[a-z]{2}\d{4}[a-z]{2}-s$/;
	return stilIdRegex.test(stilId);
}

function validatePhoneNumber(phoneNumber: string): boolean {
	const normalizedNumber = normalizePhoneNumber(phoneNumber);
	if (!normalizedNumber || normalizedNumber.length === 0) {
		return false;
	}
	return isValidPhoneNumber(normalizedNumber, "SE");
}

export default function handleBatchAdd(
	batchInput: string,
	t: ReturnType<typeof useTranslation>["t"],
): BatchAddResult {
	if (!batchInput || batchInput.trim() === "") {
		return {
			success: false,
			errorType: "EMPTY_INPUT",
			message: t("admin:member.batch_empty_input"),
		};
	}

	// Check if batch input uses the complex or simple format
	// Complex: "email, phone, stil_id; email, phone, stil_id; ..."
	// Simple: "any term, any term,..." or "any term\nany term\n..."
	const isComplexFormat = batchInput.includes(";");

	const result: {
		email: string | null;
		telephone_number: string | null;
		stil_id: string | null;
	}[] = [];
	if (isComplexFormat) {
		const lines = batchInput.split(";");

		for (const line of lines) {
			const parts = line.split(",").map((part) => part.trim());
			let email: string | null = null;
			let phoneNumber: string | null = null;
			let stilId: string | null = null;
			if (parts.length !== 3) {
				return {
					success: false,
					errorType: "INVALID_FORMAT",
					message: t("admin:member.batch_invalid_format"),
				};
			}
			if (parts[0].length === 0) {
				email = null;
			} else {
				if (validateEmail(parts[0])) {
					email = parts[0];
				} else {
					return {
						success: false,
						errorType: "INVALID_FORMAT",
						message: t("admin:member.batch_invalid_email", { email: parts[0] }),
					};
				}
			}

			if (parts[1].length === 0) {
				phoneNumber = null;
			} else {
				if (validatePhoneNumber(parts[1])) {
					const normalizedPhone = normalizePhoneNumber(parts[1]);
					if (normalizedPhone) {
						if (normalizedPhone.length === 0) {
							phoneNumber = null;
						} else {
							phoneNumber = normalizedPhone;
						}
					} else {
						return {
							success: false,
							errorType: "INVALID_FORMAT",
							message: t("admin:member.batch_invalid_phone", {
								phone: parts[1],
							}),
						};
					}
				} else {
					return {
						success: false,
						errorType: "INVALID_FORMAT",
						message: t("admin:member.batch_invalid_phone", { phone: parts[1] }),
					};
				}
			}

			if (parts[2].length === 0) {
				stilId = null;
			} else {
				if (validateStilId(parts[2])) {
					stilId = parts[2];
				} else {
					return {
						success: false,
						errorType: "INVALID_FORMAT",
						message: t("admin:member.batch_invalid_stil_id", {
							stilId: parts[2],
						}),
					};
				}
			}

			result.push({
				email,
				telephone_number: phoneNumber,
				stil_id: stilId,
			});
		}
	} else {
		// Simple format: split by commas or newlines and guess the type of each identifier
		const emails: string[] = [];
		const phoneNumbers: string[] = [];
		const stilIds: string[] = [];

		const identifiers = batchInput
			.split(/[\n,]+/)
			.map((id) => id.trim())
			.filter((id) => id.length > 0);

		for (const identifier of identifiers) {
			if (validateEmail(identifier)) {
				emails.push(identifier);
			} else if (validatePhoneNumber(identifier)) {
				const normalizedPhone = normalizePhoneNumber(identifier);
				if (normalizedPhone) {
					phoneNumbers.push(normalizedPhone);
				} else {
					return {
						success: false,
						errorType: "INVALID_FORMAT",
						message: t("admin:member.batch_invalid_phone", {
							phone: identifier,
						}),
					};
				}
			} else if (validateStilId(identifier)) {
				stilIds.push(identifier);
			} else {
				return {
					success: false,
					errorType: "INVALID_FORMAT",
					message: t("admin:member.batch_simple_invalid_identifier", {
						identifier,
					}),
				};
			}
		}

		for (const email of emails) {
			result.push({ email, telephone_number: null, stil_id: null });
		}
		for (const phoneNumber of phoneNumbers) {
			result.push({
				email: null,
				telephone_number: phoneNumber,
				stil_id: null,
			});
		}
		for (const stilId of stilIds) {
			result.push({ email: null, telephone_number: null, stil_id: stilId });
		}
	}

	if (result.length === 0) {
		return {
			success: false,
			errorType: "EMPTY_INPUT",
			message: t("admin:member.batch_empty_input"),
		};
	}

	return {
		success: true,
		result,
	};
}
