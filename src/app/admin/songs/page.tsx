"use client";

import { useState } from "react";
import SongForm from "./SongForm";
import SongEditForm from "./SongEditForm";
import { getAllSongsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import type { SongCategoryRead, SongRead } from "../../../api";
import useCreateTable from "@/widgets/useCreateTable";

// Column setup
const columnHelper = createColumnHelper<SongRead>();
const columns = [
	columnHelper.accessor("title", {
		header: "Titel",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("author", {
		header: "Författare:",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("melody", {
		header: "Melodi",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("category", {
		header: "Kategori",
		cell: (info) => info.getValue()?.name,
	}),
];

export default function Songs() {
	const { data, error, isPending } = useQuery({
		...getAllSongsOptions(),
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedSong, setSelectedSong] = useState<SongRead | null>(null);

	const table = useCreateTable({ data: data ?? [], columns });

	function handleRowClick(row: Row<SongRead>) {
		setSelectedSong(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedSong(null);
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
				Administrera sånger
			</h3>
			<p className="py-3">
				Här kan du skapa sånger & redigera existerande sånger på hemsidan.
			</p>

			<SongForm />

			<AdminTable table={table} onRowClick={handleRowClick} />

			{/* <SongEditForm
				open={openEditDialog}
				onClose={() => handleClose()}
				selectedSong={selectedSong as SongRead}
			/> */}
		</div>
	);
}
