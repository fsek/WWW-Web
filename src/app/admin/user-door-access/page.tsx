"use client";

import { action, target, type UserAccessRead } from "../../../api";
import DoorAccessForm from "./UserDoorAccessForm";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getAllUserAccessesOptions } from "@/api/@tanstack/react-query.gen";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import useCreateTable from "@/widgets/useCreateTable";
import { useTranslation } from "react-i18next";
import DoorAccessEditForm from "./UserDoorAccessEditForm";
import { useState } from "react";
import PermissionWall from "@/components/PermissionWall";
import { Suspense } from "react";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";

const columnHelper = createColumnHelper<UserAccessRead>();

export default function UserDoorAccess() {
	const { t } = useTranslation("admin");

	const columns = [
		columnHelper.accessor("user", {
			header: t("admin:door_access.user"),
			cell: (info) => {
				const user = info.getValue();
				return `${user.first_name} ${user.last_name}`;
			},
		}),
		columnHelper.accessor("door", {
			header: t("admin:door_access.door"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("starttime", {
			header: t("admin:door_access.start_time"),
			cell: (info) => {
				const date = info.getValue();
				return date
					? new Date(date).toLocaleDateString("sv-SE")
					: t("admin:door_access.unknown");
			},
		}),
		columnHelper.accessor("endtime", {
			header: t("admin:door_access.end_time"),
			cell: (info) => {
				const date = info.getValue();
				return date
					? new Date(date).toLocaleDateString("sv-SE")
					: t("admin:door_access.unknown");
			},
		}),
	];

	// edit form state
	const [editFormOpen, setEditFormOpen] = useState(false);
	const [selectedAccess, setSelectedAccess] = useState<UserAccessRead | null>(
		null,
	);

	const { data, error, refetch } = useSuspenseQuery({
		...getAllUserAccessesOptions(),
		refetchOnWindowFocus: false,
	});

	const table = useCreateTable({ data: data ?? [], columns });

	const handleRowClick = (row: Row<UserAccessRead>) => {
		setSelectedAccess(row.original);
		setEditFormOpen(true);
	};

	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	return (
		<PermissionWall
			requiredPermissions={[[action.MANAGE, target.USER_DOOR_ACCESS]]}
		>
			<Suspense fallback={<LoadingErrorCard isLoading={true} />}>
				<div className="px-8 space-x-4">
					<h3 className="text-3xl py-3 font-bold text-primary">
						{t("admin:door_access.page_title")}
					</h3>
					<p className="py-3">{t("admin:door_access.page_description")}</p>
					<DoorAccessForm />
					<AdminTable table={table} onRowClick={handleRowClick} />
					{selectedAccess && (
						<DoorAccessEditForm
							open={editFormOpen}
							onClose={() => {
								setEditFormOpen(false);
								setSelectedAccess(null);
							}}
							selectedAccess={selectedAccess}
						/>
					)}
				</div>
			</Suspense>
		</PermissionWall>
	);
}
