import { type NextRequest, NextResponse } from "next/server";
import { renderAccesserHtml } from "./template";

// The reason we have this file is that the access stil-ids are fetched by LU by scraping a very specific URL.
// This file serves that URL. TODO: Talk to LU about this and switch to them actually using a private API
// (perhaps with some sort of authentication) instead of scraping this URL.

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = await params;

		// Map the old id to the new door names, with comments for their old names
		const doorNameMap: Record<string, string> = {
			"1": "Ambassaden", // samma
			"2": "Arkivet", // samma
			"3": "Hilbert Cafe", // AKA Hilbert Café
			"4": "Cafeförrådet", // AKA Caféförråd
			// "5": "Kassaskåp", // Kassaskåp is not used anymore, but kept for reference
			"6": "Pubförrådet", // samma
			// "7": "Sexmästeriets Förråd", // Not used anymore, but kept for reference
			// No clue where 8 went lol
			"9": "Ledningscentralen", // samma
			"10": "Sopkomprimatorn", // samma
			"11": "Syster Kents", // AKA SK
		};

		const oldDoorList: string[] = ["5", "7", "8"];

		if (oldDoorList.includes(id)) {
			return NextResponse.json(
				{ error: "This door is no longer in use" },
				{ status: 410 },
			);
		}

		if (!doorNameMap[id]) {
			return NextResponse.json({ error: "Invalid door id" }, { status: 404 });
		}

		// Fetch from your backend, now including the id if needed
		const baseUrl =
			process.env.NEXT_PUBLIC_API_BASE_URL ||
			"http://host.docker.internal:8000";
		const backendRes = await fetch(
			`${baseUrl}/access-serve/${encodeURIComponent(doorNameMap[id])}`,
		);
		const items = await backendRes.json();

		const renderedItems = items
			.map((item: string) => safetyClearing(item))
			.join("\n");
		const html = renderAccesserHtml(renderedItems);

		return new NextResponse(html, {
			headers: { "Content-Type": "text/html" },
			status: 200,
		});
	} catch (error) {
		console.error("Error fetching data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch data" },
			{ status: 404 },
		);
	}
}

function safetyClearing(text: string) {
	// Only allow alphanumeric characters and hyphens
	return text.replace(/[^a-zA-Z0-9-]/g, "");
}
