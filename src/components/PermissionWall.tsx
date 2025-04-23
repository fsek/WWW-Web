import type { PermissionRead } from "@/api";
import { usePermissions } from "@/lib/auth";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export default function PermissionWall({
	children,
	requiredPermissions,
}: {
	children: ReactNode;
	requiredPermissions: {
		target: PermissionRead["target"];
		action: PermissionRead["action"];
	}[];
}) {
	const { t } = useTranslation("admin");
	const permissions = usePermissions();

	const hasPermission = requiredPermissions.every((requiredPermission) => {
		return (
			permissions.get(requiredPermission.target) === requiredPermission.action
		);
	});

	if (hasPermission) {
		return <>{children}</>;
	}

	return <div>{t("insufficient_permissions")}</div>;
}
