import type { NewsRead } from "../../../api";
import NewsForm from "./NewsForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllNewsOptions } from "@/api/@tanstack/react-query.gen";
import { createColumnHelper } from "@tanstack/react-table";
import AdminTable from "@/widgets/AdminTable";
import useCreateTable from "@/widgets/useCreateTable";
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
	columnHelper.accessor("title_sv", {
		header: "Svensk titel",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("content_sv", {
		header: "Svensk beskrivning",
		cell: (info) => info.getValue(),
	}),
];

export default function News() {
	const queryClient = useQueryClient();

	const { data, error, isFetching } = useQuery({
		...getAllNewsOptions(),
	});

	const table = useCreateTable({ data: data ?? [], columns });

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
