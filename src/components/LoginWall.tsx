"use client";

import { useAuthState } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { type PropsWithChildren, useEffect } from "react";

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
