import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	// This is run each time a request is made to the server.
	const language = request.cookies.get("i18next")?.value || "en";

	const response = NextResponse.next();
	response.headers.set("x-initial-language", language);

	return response;
}

export const config = {
	// Avoid running middleware on API routes (not sure this does things for us?), static files, and images
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|locales|flags|images).*)",
	],
};
