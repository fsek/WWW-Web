"use client";

import type { AlbumRead } from "@/api";
import { getAlbumsOptions } from "@/api/@tanstack/react-query.gen";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import AdminTable from "@/widgets/AdminTable";
import useCreateTable from "@/widgets/useCreateTable";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import AlbumsForm from "./AlbumsForm";

const columnHelper = createColumnHelper<AlbumRead>();

export default function AlbumsPage() {
	const { t, i18n } = useTranslation("admin");
	const queryClient = useQueryClient();

	const [editFormOpen, setEditFormOpen] = useState(false);
	const [selectedAlbum, setSelectedAlbum] = useState<AlbumRead | null>(null);

	const columns = [
		columnHelper.accessor("year", {
			header: t("albums.year"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor(i18n.language === "sv" ? "title_sv" : "title_en", {
			header: t("albums.title"),
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor("date", {
			header: t("albums.date"),
			cell: (info) =>
				new Date(info.getValue()).toLocaleString("sv-SE", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
				}),
		}),
		columnHelper.accessor("photographer", {
			header: t("albums.photographer"),
			cell: (info) =>
				`${info.getValue()?.first_name ?? "F. T."} ${info.getValue()?.last_name ?? "Graf"}`,
		}),
	];

	const { data, error } = useSuspenseQuery({ ...getAlbumsOptions() });

	const table = useCreateTable({ data: data ?? [], columns });

	const handleRowClick = (row: Row<AlbumRead>) => {
		setSelectedAlbum(row.original);
		setEditFormOpen(true);
	};

	return (
		<div className="px-8 space-x-4">
			<Suspense fallback={<LoadingErrorCard />}>
				<h3 className="text-3xl py-3 font-bold text-primary">
					{t("albums.page_title")}
				</h3>
				<p className="py-3">{t("albums.page_description")}</p>
				<p className="text-destructive">{t("albums.warning")}</p>
				<AlbumsForm />
				<AdminTable table={table} onRowClick={handleRowClick} />
			</Suspense>
		</div>
	);
}
