"use client";

import { authCookieRefreshMutation } from "@/api/@tanstack/react-query.gen";
import { useAuthState } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { type PropsWithChildren, useEffect } from "react";

/**
 * Any children of this component will only be rendered if the user is authenticated.
 *
 * If the user is not authenticated, they will be redirected to the login page.
 */
export default function LoginWall({ children }: PropsWithChildren) {
	const auth = useAuthState();
	const isAuthenticated = auth.isAuthenticated();
	const router = useRouter();
	const pathname = usePathname();

	const refresh = useMutation({
		...authCookieRefreshMutation({ credentials: "include" }),
		onError: () => {
			router.push(`/login?next=${encodeURIComponent(pathname)}`);
		},
		onSuccess: (data) => auth.setAccessToken(data),
	});

	useEffect(() => {
		if (isAuthenticated === false && !pathname.startsWith("/login")) {
			refresh.mutate({});
		}
	}, [refresh.mutate, isAuthenticated, pathname]);

	if (isAuthenticated) {
		return <>{children}</>;
	}
	return null;
}
