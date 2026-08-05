"use client";

import { ActionEnum, TargetEnum } from "../../../api";
import { useTranslation } from "react-i18next";
import PermissionWall from "@/components/PermissionWall";
import { Suspense } from "react";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";

export default function EncloseMoose() {
	const { t } = useTranslation("admin");

	return (
		<PermissionWall
			requiredPermissions={[[ActionEnum.MANAGE, TargetEnum.ENCLOSE_MOOSE]]}
		>
			<Suspense fallback={<LoadingErrorCard isLoading={true} />}>
				<div className="px-8 space-x-4">
					<h3 className="text-3xl py-3 font-bold text-primary">
						{t("admin:enclose_moose.page_title")}
					</h3>
					<p className="py-3">{t("admin:enclose_moose.page_description")}</p>
				</div>
			</Suspense>
		</PermissionWall>
	);
}
