"use client";

import { useAuthState } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";

export default function LoginWall({ children }: PropsWithChildren) {
	const isAuthenticated = useAuthState();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (isAuthenticated === false) {
			// TODO: add a query parameter to redirect back to the current page after login
			router.push(`/login?next=${pathname}`);
		}
	}, [isAuthenticated]);

	if (isAuthenticated === true) {
		return <>{children}</>;
	}

	return null;
}
