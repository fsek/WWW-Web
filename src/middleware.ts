import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const authStatus = request.cookies.get("auth_status");

	// Redirect authenticated users from / to /home
	if (
		authStatus?.value === "authenticated" &&
		request.nextUrl.pathname === "/"
	) {
		return NextResponse.redirect(new URL("/home", request.url));
	}

	// Redirect unauthenticated users from /home to /
	if (
		authStatus?.value !== "authenticated" &&
		request.nextUrl.pathname === "/home"
	) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/home"],
};
