"use client";

import { ActionEnum, TargetEnum, type UserAccessRead } from "../../../api";
import DoorAccessForm from "./UserDoorAccessForm";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getAllUserAccessesOptions } from "@/api/@tanstack/react-query.gen";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import useCreateTable from "@/widgets/useCreateTable";
import { useTranslation } from "react-i18next";
import DoorAccessEditForm from "./UserDoorAccessEditForm";
import { useMemo, useState } from "react";
import PermissionWall from "@/components/PermissionWall";
import { Suspense } from "react";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const columnHelper = createColumnHelper<UserAccessRead>();

export default function UserDoorAccess() {
	const { t } = useTranslation("admin");
	const [searchUser, setSearchUser] = useState<string | undefined>(undefined);
	const [showOldAccess, setShowOldAccess] = useState(false);

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

	const filteredUsers = useMemo(() => {
		if (!data) return [];
		const lower = (searchUser ?? "").toLowerCase();
		return data.filter((u) => {
			const matchesSearch =
				u.user.first_name.toLowerCase().includes(lower) ||
				u.user.last_name.toLowerCase().includes(lower) ||
				`${u.user.first_name} ${u.user.last_name}`
					.toLowerCase()
					.includes(lower) ||
				String(u.user.id).toLowerCase().includes(lower);

			let showAccess = true;
			if (!showOldAccess && u.endtime) {
				showAccess = new Date(u.endtime) >= new Date();
			}

			return matchesSearch && showAccess;
		});
	}, [data, searchUser, showOldAccess]);

	const table = useCreateTable({ data: filteredUsers ?? [], columns });

	const handleRowClick = (row: Row<UserAccessRead>) => {
		setSelectedAccess(row.original);
		setEditFormOpen(true);
	};

	if (error) {
		return <LoadingErrorCard error={error} />;
	}

	return (
		<PermissionWall
			requiredPermissions={[[ActionEnum.MANAGE, TargetEnum.USER_DOOR_ACCESS]]}
		>
			<Suspense fallback={<LoadingErrorCard isLoading={true} />}>
				<div className="px-8 space-x-4">
					<h3 className="text-3xl py-3 font-bold text-primary">
						{t("admin:door_access.page_title")}
					</h3>
					<p className="py-3">{t("admin:door_access.page_description")}</p>
					<DoorAccessForm />
					<div className="py-3 flex flex-row">
						<Input
							type="search"
							placeholder={t("admin:door_access.search_user")}
							value={searchUser ?? ""}
							onChange={(e) => {
								const value = e.target.value;
								if (value === "") {
									setSearchUser(undefined);
								} else {
									setSearchUser(value);
								}
							}}
							autoFocus
							className="w-96"
						/>
						<label
							htmlFor="show-old-access"
							className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent/50 transition-colors cursor-pointer ml-4"
						>
							<Checkbox
								id="show-old-access"
								checked={showOldAccess}
								onCheckedChange={(checked) => {
									setShowOldAccess(checked as boolean);
								}}
								className="h-5 w-5"
							/>
							<span className="text-sm font-medium">
								{t("admin:door_access.show_old_access")}
							</span>
						</label>
					</div>
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
