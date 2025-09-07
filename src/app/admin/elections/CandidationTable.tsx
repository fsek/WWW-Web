"use client";

import { useState } from "react";
import AdminTable from "@/widgets/AdminTable";
import {
	createColumnHelper,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type Row,
} from "@tanstack/react-table";
import type { CandidatePostRead, CandidateRead } from "@/api/types.gen";
import { useTranslation } from "react-i18next";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

// Extended type to include optional user info attached in parent component
type CandidatePostWithUser = CandidatePostRead & {
	user?: CandidateRead["user"];
	candidate_id?: number;
};

interface CandidationTableProps {
	candidations: CandidatePostWithUser[];
	getPostName: (post_id: number) => string;
	onDeleteCandidation: (candidation: CandidatePostWithUser) => void;
	showUserInfo?: boolean;
	onRowClick?: (row: Row<CandidatePostWithUser>) => void;
}

const columnHelper = createColumnHelper<CandidatePostWithUser>();

export function CandidationTable({
	candidations,
	getPostName,
	onDeleteCandidation,
	showUserInfo = false,
	onRowClick,
}: CandidationTableProps) {
	const { t } = useTranslation("admin");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "created_at", desc: false },
	]);

	// Inner component to hold hooks for dialog state
	function DeleteCandidationDialog({
		candidation,
	}: {
		candidation: CandidatePostWithUser;
	}) {
		const [open, setOpen] = useState(false);
		return (
			<ConfirmDeleteDialog
				open={open}
				onOpenChange={setOpen}
				onConfirm={() => onDeleteCandidation(candidation)}
				triggerText={t("elections.election_candidations.remove_candidation")}
				title={t("elections.election_candidations.remove_candidation")}
				description={t("elections.election_candidations.remove_confirm")}
				showIcon={true}
			/>
		);
	}

	const columns = [
		...(showUserInfo
			? [
					columnHelper.accessor((row) => row.user?.first_name, {
						id: "first_name",
						header: t("admin:first_name"),
						cell: (info) => info.getValue() ?? "-",
						size: 60,
					}),
					columnHelper.accessor((row) => row.user?.last_name, {
						id: "last_name",
						header: t("admin:last_name"),
						cell: (info) => info.getValue() ?? "-",
						size: 100,
					}),
					columnHelper.accessor((row) => row.user?.email, {
						id: "email",
						header: t("admin:email"),
						cell: (info) => info.getValue() ?? "-",
						size: 120,
					}),
				]
			: []),
		columnHelper.accessor("post_id", {
			id: "post_name",
			header: t("elections.election_candidations.post_name"),
			cell: (info) => getPostName(info.getValue()),
			size: 120,
		}),
		columnHelper.accessor("created_at", {
			id: "created_at",
			header: t("elections.election_candidations.created_at"),
			cell: (info) => new Date(info.getValue()).toLocaleString(),
			size: 120,
		}),
		{
			id: "actions",
			header: t("elections.election_candidations.actions"),
			cell: ({ row }: { row: { original: CandidatePostWithUser } }) => (
				<DeleteCandidationDialog candidation={row.original} />
			),
		},
	];

	const table = useReactTable({
		columns,
		data: candidations,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: { sorting },
	});

	return <AdminTable table={table} onRowClick={onRowClick} />;
}
