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
import { door } from "@/api";

const columnHelper = createColumnHelper<UserAccessRead>();

const columns = [
	columnHelper.accessor("user", {
		header: "Användare",
		cell: (info) => {
			const user = info.getValue();
			return `${user.first_name} ${user.last_name}`;
		},
	}),
	columnHelper.accessor("door", {
		header: "Dörr",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("starttime", {
		header: "Startdatum",
		cell: (info) => {
			const date = info.getValue();
			return date ? new Date(date).toLocaleDateString("sv-SE") : "Oklart";
		},
	}),
	columnHelper.accessor("endtime", {
		header: "Slutdatum",
		cell: (info) => {
			const date = info.getValue();
			return date ? new Date(date).toLocaleDateString("sv-SE") : "Oklart";
		},
	}),
];

export default function UserDoorAccess() {
	const { t } = useTranslation();

	// edit form state
	const [editFormOpen, setEditFormOpen] = useState(false);
	const [selectedAccess, setSelectedAccess] = useState<UserAccessRead | null>(
		null,
	);

	const { data, error } = useSuspenseQuery({
		...getAllUserAccessesOptions(),
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
					<h3 className="text-3xl py-3 underline underline-offset-4">
						{t("admin:door_access.page_title", "Dörråtkomsthantering")}
					</h3>
					<p className="py-3">
						{t(
							"admin:door_access.page_description",
							"Hantera användares åtkomst till dörrar",
						)}
					</p>
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
