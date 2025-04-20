import type { PermissionRead } from "@/api";
import { usePermissions } from "@/lib/auth";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export default function PermissionWall({
	children,
	requiredPermissions,
}: { children: ReactNode; requiredPermissions: PermissionRead[] }) {
	const { t } = useTranslation("admin");
	const permissions = usePermissions();
	if (permissions) {
		const hasPermission = requiredPermissions.every((requiredPermission) => {
			return (
				permissions[requiredPermission.target] === requiredPermission.action
			);
		});
		console.log("hasPermission", hasPermission);
		if (hasPermission) {
			return <>{children}</>;
		}
	}
	return <div>{t("insufficient_permissions")}</div>;
}
