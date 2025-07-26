import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const authStatus = request.cookies.get("auth_status");

	if (
		authStatus?.value === "authenticated" &&
		request.nextUrl.pathname === "/"
	) {
		return NextResponse.redirect(new URL("/home", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/"],
};
