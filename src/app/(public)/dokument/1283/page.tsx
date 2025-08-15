import { redirect } from "next/navigation";

export default function Document() {
	// Redirect to the Terms and conditions for rental of the Facilities Committee’s equipment (temporary link)
	// This is because the terms contains a link to the old site I cannot change
	redirect("https://old.fsektionen.se/dokument/1283");
}
