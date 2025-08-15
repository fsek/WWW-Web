"use client";

import { useState, useMemo } from "react";
import { getAllSongsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import type { SongRead } from "../../../api";
import useCreateTable from "@/widgets/useCreateTable";
import SongForm from "./SongForm";
import SongEditForm from "./SongEditForm";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Input } from "@/components/ui/input";

export default function Songs() {
	const { t } = useTranslation("admin");

	// Column setup
	const columnHelper = createColumnHelper<SongRead>();
	const columns = [
		columnHelper.accessor("title", {
			header: t("songs.title"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("author", {
			header: t("songs.author"),
			cell: (info) => info.getValue() || "-",
		}),
		columnHelper.accessor("melody", {
			header: t("songs.melody"),
			cell: (info) => info.getValue() || "-",
		}),
		columnHelper.accessor("category", {
			header: t("songs.category"),
			cell: (info) => info.getValue()?.name || "-",
		}),
		columnHelper.accessor("views", {
			header: t("songs.views"),
			cell: (info) => info.getValue(),
		}),
	];

	const { data, error, isPending } = useQuery({
		...getAllSongsOptions(),
		refetchOnWindowFocus: false,
	});

	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedSong, setSelectedSong] = useState<SongRead | null>(null);
	const [search, setSearch] = useState<string>("");

	// compute filtered songs
	const filteredSongs = useMemo(() => {
		if (!data) return [];
		const lower = search.toLowerCase();
		return data.filter((s) => {
			const matchesSearch =
				s.title.toLowerCase().includes(lower) ||
				s.melody?.toLowerCase().includes(lower) ||
				s.author?.toLowerCase().includes(lower) ||
				s.category?.name.toLowerCase().includes(lower);

			return matchesSearch;
		});
	}, [data, search]);

	const table = useCreateTable({ data: filteredSongs ?? [], columns });

	function handleRowClick(row: Row<SongRead>) {
		setSelectedSong(row.original);
		setOpenEditDialog(true);
	}

	function handleClose() {
		setOpenEditDialog(false);
		setSelectedSong(null);
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
				{t("songs.title")}
			</h3>
			<p className="py-3">{t("songs.description_subtitle")}</p>
			<SongForm />

			<div className="mt-4 mb-2 flex flex-row gap-2 items-center">
				<div className="w-xs">
					<Input
						placeholder={t("songs.search_placeholder")}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						autoFocus
					/>
				</div>
			</div>

			<AdminTable table={table} onRowClick={handleRowClick} />

			{selectedSong && (
				<SongEditForm
					open={openEditDialog}
					onClose={() => handleClose()}
					selectedSong={selectedSong}
				/>
			)}
		</div>
	);
}
