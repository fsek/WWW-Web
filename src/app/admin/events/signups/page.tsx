"use client";

import { getAllEventSignupsOptions } from "@/api/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import AdminTable from "@/widgets/AdminTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createColumnHelper,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type Row,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import SignupEditForm from "./SignupEditForm";
import SignupForm from "./SignupForm";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import type { EventSignupRead } from "@/api/types.gen";

const columnHelper = createColumnHelper<EventSignupRead>();

export default function AdminEventSignupsPage() {
	const { t } = useTranslation();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();

	const eventIdParam = searchParams.get("id");
	const eventId = eventIdParam ? Number(eventIdParam) : Number.NaN;

	const {
		data: signups,
		error: signupsError,
		isLoading: signupsLoading,
	} = useQuery({
		...getAllEventSignupsOptions({ path: { event_id: Number(eventId) } }),
		enabled: Number.isFinite(eventId),
	});

	// search state
	const [search, setSearch] = useState<string>("");

	// edit form state
	const [editFormOpen, setEditFormOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState<EventSignupRead | null>(null);

	// create form state
	const [createOpen, setCreateOpen] = useState(false);

	// compute filtered rows
	const filteredRows = useMemo(() => {
		if (!signups) return [];
		const lower = (search || "").toLowerCase();
		return signups.filter((r) => {
			const user = r.user;
			if (!user) return false;
			const first = user.first_name ?? "";
			const last = user.last_name ?? "";
			const idStr = String(user.id);
			const group = r.group_name ?? "";
			const priority = r.priority ?? "";
			const matchesSearch =
				first.toLowerCase().includes(lower) ||
				last.toLowerCase().includes(lower) ||
				`${first} ${last}`.toLowerCase().includes(lower) ||
				idStr.includes(lower) ||
				group.toLowerCase().includes(lower) ||
				priority.toLowerCase().includes(lower);
			return matchesSearch;
		});
	}, [signups, search]);

	const handleRowClick = (row: Row<EventSignupRead>) => {
		setSelectedRow(row.original);
		setEditFormOpen(true);
	};

	const columns = [
		columnHelper.accessor((row) => row.user.id, {
			id: "user_id",
			header: t("admin:user-id") || "User ID",
			cell: (info) => info.getValue(),
			size: 60,
		}),
		columnHelper.accessor((row) => row.user.first_name, {
			id: "first_name",
			header: t("admin:first_name"),
			cell: (info) => info.getValue() ?? "-",
			size: 140,
		}),
		columnHelper.accessor((row) => row.user.last_name, {
			id: "last_name",
			header: t("admin:last_name"),
			cell: (info) => info.getValue() ?? "-",
			size: 140,
		}),
		columnHelper.accessor((row) => row.priority, {
			id: "priority",
			header: t("event_signup.priority") || "Priority",
			cell: (info) => {
				const v = info.getValue();
				return v ? v.charAt(0).toUpperCase() + v.slice(1) : "-";
			},
			size: 110,
		}),
		columnHelper.accessor((row) => row.group_name ?? "", {
			id: "group_name",
			header: t("event_signup.group_name") || "Group",
			cell: (info) => info.getValue() || "-",
			size: 160,
		}),
		columnHelper.accessor((row) => row.drinkPackage, {
			id: "drinkPackage",
			header: t("event_signup.drink_package.title") || "Drink",
			cell: (info) => info.getValue(),
			size: 120,
		}),
		columnHelper.accessor((row) => row.confirmed_status, {
			id: "status",
			header: t("event_signup.status") || "Status",
			cell: (info) =>
				info.getValue() ? (
					<Badge variant="default">{t("event_signup.confirmed")}</Badge>
				) : (
					<Badge variant="secondary">{t("event_signup.pending")}</Badge>
				),
			size: 120,
		}),
		{
			id: "actions",
			header: t("admin:actions") || "Actions",
			cell: ({ row }: { row: Row<EventSignupRead> }) => (
				<Button
					variant="outline"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						setSelectedRow(row.original);
						setEditFormOpen(true);
					}}
				>
					<Edit className="mr-2 h-4 w-4" />
					{t("admin:edit") || "Edit"}
				</Button>
			),
		},
	];

	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		columns,
		data: filteredRows,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: { sorting },
	});

	useEffect(() => {
		// Invalidate on eventId change to keep data fresh when switching id
		if (Number.isFinite(eventId)) {
			queryClient.invalidateQueries({
				queryKey: getAllEventSignupsOptions({
					path: { event_id: Number(eventId) },
				}).queryKey,
			});
		}
	}, [eventId, queryClient]);

	if (!Number.isFinite(eventId)) {
		return (
			<div className="px-8">
				<h3 className="text-3xl py-3 underline underline-offset-4 text-primary">
					{t("admin:event-signups.title") || "Event signups"}
				</h3>
				<p className="text-red-600">{t("admin:event-signups.missing_id")}</p>
			</div>
		);
	}

	if (signupsLoading) {
		return <LoadingErrorCard />;
	}

	if (signupsError) {
		return <LoadingErrorCard error={signupsError as any} />;
	}

	return (
		<div className="px-8 space-x-4">
			<div className="space-y-0">
				<h3 className="text-3xl py-3 underline underline-offset-4 text-primary">
					{t("admin:event-signups.title") || "Event signups"}
				</h3>
				<p className="text-xs md:text-sm font-medium">
					{t("admin:event-signups.description") ||
						"Manage signups for a specific event. Use search to filter."}
				</p>

				<div className="mt-4 mb-2 flex flex-row gap-2 items-center flex-wrap">
					<div className="w-xs">
						<Input
							placeholder={t("admin:search_placeholder")}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							autoFocus
						/>
					</div>
					<Button variant="default" onClick={() => setCreateOpen(true)}>
						{t("admin:event-signups.add") || "Add signup"}
					</Button>
				</div>

				<Separator className="mb-4" />
			</div>

			<AdminTable table={table} onRowClick={handleRowClick} />

			{selectedRow && (
				<SignupEditForm
					open={editFormOpen}
					onClose={() => {
						setEditFormOpen(false);
						setSelectedRow(null);
					}}
					eventId={Number(eventId)}
					selectedSignup={selectedRow}
				/>
			)}

			<SignupForm
				open={createOpen}
				onOpenChange={setCreateOpen}
				eventId={Number(eventId)}
			/>
		</div>
	);
}
