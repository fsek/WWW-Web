"use client";

import { useAuthState, type RequiredPermission } from "@/lib/auth";
import Link from "next/link";
import type { ReactNode } from "react";

function PermissionDenied() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-background text-foreground">
			<section className="text-center">
				<h1 className="mb-4 text-7xl font-extrabold tracking-tight lg:text-9xl text-destructive">
					STOPP
				</h1>
				<p className="mb-4 text-3xl font-bold md:text-4xl">Sakta i backarna!</p>
				<p className="mb-4 text-lg font-light text-muted-foreground">
					Du har inte tillgång till den här sidan. Om du tror att något är fel,{" "}
					<a
						href="mailto:spindelman@fsektionen.se"
						className="inline-flex text-forange hover:bg-primary hover:text-white"
					>
						kontakta din lokala spindelman
					</a>
					.
				</p>
				<p className="mb-4 text-lg font-light text-muted-foreground">
					<i>Här har vi begått lite småillegala saker längs vägen.</i> - Micke
					P.{" "}
				</p>
				<Link
					href="/"
					className="inline-flex text-white bg-primary hover:bg-primary/80 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-primary-900"
				>
					Tillbaka till hemsidan
				</Link>
			</section>
		</div>
	);
}

export default function PermissionWall({
	requiredPermissions,
	mustHave = "all",
	children,
}: {
	requiredPermissions: RequiredPermission[];
	mustHave?: "any" | "all";
	children: ReactNode;
}) {
	const auth = useAuthState();
	const perm = auth.getPermissions();
	let allowed = false;
	if (mustHave === "all") {
		allowed = perm.hasRequiredPermissions(requiredPermissions);
	} else if (mustHave === "any") {
		allowed = requiredPermissions.some((req) =>
			perm.hasRequiredPermissions([req]),
		);
	}
	if (allowed) {
		return <>{children}</>;
	}
	return PermissionDenied();
}
