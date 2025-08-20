import { type NextRequest, NextResponse } from "next/server";
import i18nConfig from "@/i18nConfig";

function handleLanguageHeader(response: NextResponse, request: NextRequest) {
	const language =
		request.cookies.get("i18next")?.value || i18nConfig.defaultLocale;

	response.headers.set("x-initial-language", language);
}

function handleAuthRedirects(request: NextRequest): NextResponse | null {
	const authStatus = request.cookies.get("auth_status");

	// Redirect authenticated users from / to /home
	if (
		authStatus?.value === "authenticated" &&
		request.nextUrl.pathname === "/"
	) {
		return NextResponse.redirect(new URL("/home", request.url));
	}

	// Redirect unauthenticated users from /home to /
	// Temporarily dont to get people up to speed
	// if (
	// 	authStatus?.value !== "authenticated" &&
	// 	request.nextUrl.pathname === "/home"
	// ) {
	// 	return NextResponse.redirect(new URL("/", request.url));
	// }

	return null;
}

export function middleware(request: NextRequest) {
	// Check for auth redirects first
	const authRedirect = handleAuthRedirects(request);

	if (authRedirect) {
		handleLanguageHeader(authRedirect, request);
		return authRedirect;
	}

	// Default: continue with language header
	const response = NextResponse.next();
	handleLanguageHeader(response, request);
	return response;
}

export const config = {
	// Avoid running middleware on API routes, static files, and images
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|locales|flags|images).*)",
	],
};
