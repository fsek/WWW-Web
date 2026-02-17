"use client";

import { useAuthState, type RequiredPermission } from "@/lib/auth";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Obfuscate from "react-obfuscate";

function PermissionDenied() {
	const { t } = useTranslation("main");
	const router = useRouter();
	return (
		<div className="flex items-center justify-center min-h-screen bg-background text-foreground">
			<section className="text-center">
				<h1 className="mb-4 text-7xl font-extrabold tracking-tight lg:text-9xl text-destructive">
					{t("permission-wall.stop")}
				</h1>
				<p className="mb-4 text-3xl font-bold md:text-4xl">
					{t("permission-wall.subtitle")}
				</p>
				<p className="mb-4 text-lg font-light text-muted-foreground">
					{t("permission-wall.message")}
					<Obfuscate email={"spindelman@fsektionen.se"}>
						<p className="inline-flex text-forange hover:bg-primary hover:text-white">
							{t("permission-wall.contact")}
						</p>
					</Obfuscate>
					.
				</p>
				<p className="mb-4 text-lg font-light text-muted-foreground">
					<i>{t("permission-wall.quote")}</i> -{" "}
					{t("permission-wall.quote_author")}
				</p>
				<Button
					type="button"
					onClick={() => router.back()}
					className="inline-flex text-white bg-primary hover:bg-primary/80 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-primary-900"
				>
					{t("permission-wall.button")}
				</Button>
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
