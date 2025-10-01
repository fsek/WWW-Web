"use client";

import { useState, useMemo } from "react";
import { getAllSongsOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import type { SongRead } from "../../../api";
import useCreateTable from "@/widgets/useCreateTable";
import { useTranslation } from "react-i18next";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function Songs() {
	const { t } = useTranslation("main");
	const router = useRouter();

	// Column setup
	const columnHelper = createColumnHelper<SongRead>();
	const columns = [
		columnHelper.accessor("title", {
			header: t("songs.title"),
			cell: (info) => info.getValue(),
		}),
	];

	const { data, error, isPending } = useQuery({
		...getAllSongsOptions(),
		refetchOnWindowFocus: false,
	});

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
		// Open the the details page for the song
		router.push(`/songs/${row.original.id}`);
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
		</div>
	);
}
