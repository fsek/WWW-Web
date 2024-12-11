import { useState, useEffect, useMemo } from "react";
import { type NewsRead, NewsService } from "../../../api";
import { Button } from "@/components/ui/button";
import NewsForm from "./NewsForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllNewsOptions } from "@/api/@tanstack/react-query.gen";
import {
	createColumnHelper,
	useReactTable,
	flexRender,
	RowModel,
	Table,
	getCoreRowModel,
} from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
];

export interface NewsItem {
	title: string;
	creator: string;
	dateCreated: string;
	id: number;
}

const columnHelper = createColumnHelper<NewsRead>();

const columns = [
	columnHelper.accessor((row) => row.title_sv, {
		id: "title_sv",
		cell: (info) => info.getValue(),
		header: () => <span>Svensk titel</span>,
		//footer: (props) => props.column.id,
	}),
	columnHelper.accessor((row) => row.content_sv, {
		id: "content_sv",
		cell: (info) => info.getValue(),
		header: () => <span>Svensk beskrivning</span>,
		//footer: (props) => props.column.id,
	}),
];

export default function News() {
	const queryClient = useQueryClient();

	const { data, error, isFetching } = useQuery({
		...getAllNewsOptions(),
	});

	const table = useReactTable({
		columns,
		data: (data as NewsRead[]) ?? [],
		getCoreRowModel: getCoreRowModel(),
	});

	if (isFetching) {
		return <p> Hämtar</p>;
	}

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				Administrera nyheter
			</h3>
			<p className="py-3">
				Här kan du skapa nyheter & redigera existerande nyheter på hemsidan.
			</p>
			<NewsForm />
			<AdminTable table={table} />
		</div>
	);
}
