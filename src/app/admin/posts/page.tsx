"use client";

import { useState } from "react";
import {
	getAllCouncilsOptions,
	getAllPostsOptions,
} from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import type { PostRead } from "../../../api";
import useCreateTable from "@/widgets/useCreateTable";
import PostForm from "./PostForm";
import PostEditForm from "./PostEditForm";

function CouncilName({ councilId }: { councilId: number }) {
	const { data } = useQuery({
		...getAllCouncilsOptions(),
	});

	const council = data?.find((c) => c.id === councilId);

	return council?.name;
}

// Column setup
const columnHelper = createColumnHelper<PostRead>();
const columns = [
	columnHelper.accessor("name", {
		header: "Post",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("council_id", {
		header: "Council name",
		cell: (info) => <CouncilName councilId={info.getValue()} />,
	}),
];

export default function Posts() {
	const { data, error, isPending } = useQuery({
		...getAllPostsOptions(),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<PostRead | null>(null);

	const table = useCreateTable({ data: data ?? [], columns });

	function handleRowClick(row: Row<PostRead>) {
		setSelectedEvent(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedEvent(null);
	}

	if (isPending) {
		return <p>Hämtar...</p>;
	}

	if (error) {
		return <p>Något gick fel :/</p>;
	}

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				Administrera poster
			</h3>
			<p className="py-3">
				Här kan du skapa poster & redigera existerande poster på hemsidan.
			</p>
			<PostForm />

			<AdminTable table={table} onRowClick={handleRowClick} />

			<PostEditForm
				open={openEditDialog}
				onClose={() => handleClose()}
				selectedPost={selectedEvent as PostRead}
			/>
		</div>
	);
}
