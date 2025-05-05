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
		if (isAuthenticated === false) {
			// TODO: add a query parameter to redirect back to the current page after login
			router.push(`/login?next=${pathname}`);
		}
	}, [isAuthenticated, pathname, router.push]);

	if (isAuthenticated === true) {
		return <>{children}</>;
	}

	return null;
}
