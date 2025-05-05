"use client";

import { useAuthState } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { type PropsWithChildren, useEffect } from "react";

/**
 * Any children of this component will only be rendered if the user is authenticated.
 *
 * If the user is not authenticated, they will be redirected to the login page.
 */
export default function LoginWall({ children }: PropsWithChildren) {
	const isAuthenticated = useAuthState();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (isAuthenticated === false && !pathname.startsWith("/login")) {
			router.push(`/login?next=${encodeURIComponent(pathname)}`);
		}
	}, [isAuthenticated, pathname, router]);

	if (isAuthenticated) {
		return <>{children}</>;
	}
	return null;
}
