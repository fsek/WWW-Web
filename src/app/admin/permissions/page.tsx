"use client";

import { useState } from "react";
import { getAllPermissionsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import type { PermissionRead } from "../../../api";
import useCreateTable from "@/widgets/useCreateTable";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import PermissionForm from "./PermissionForm";
import PermissionEditForm from "./PermissionEditForm";
import { useTranslation } from "react-i18next";

// Column setup
const columnHelper = createColumnHelper<PermissionRead>();

export default function Permissions() {
	const { t } = useTranslation("admin");

	const columns = [
		columnHelper.accessor("target", {
			header: t("permissions.target"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("action", {
			header: t("permissions.action"),
			cell: (info) => info.getValue(),
		}),
	];
	const { data, error, isPending } = useQuery({
		...getAllPermissionsOptions(),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedPermission, setSelectedPermission] =
		useState<PermissionRead | null>(null);

	const table = useCreateTable({ data: data ?? [], columns });

	function handleRowClick(row: Row<PermissionRead>) {
		setSelectedPermission(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedPermission(null);
	}

	if (isPending) {
		return <LoadingErrorCard />;
	}

	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-3xl py-3 font-bold text-primary">
				{t("permissions.title", "Permissions")}
			</h3>
			<p className="py-3">{t("permissions.description")}</p>
			<PermissionForm />

			<AdminTable table={table} onRowClick={handleRowClick} />

			{selectedPermission && (
				<PermissionEditForm
					open={openEditDialog}
					onClose={handleClose}
					selectedPermission={selectedPermission}
				/>
			)}
		</div>
	);
}
