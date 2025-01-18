import { useState, useEffect, useMemo } from "react";
import { type CarRead, CarsService } from "../../../api";
import { Button } from "@/components/ui/button";
import PiratForm from "./PiratForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllBookingOptions } from "@/api/@tanstack/react-query.gen";
import AdminTable from "@/widgets/AdminTable";
const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
];
import {
	createColumnHelper,
	useReactTable,
	flexRender,
	RowModel,
	Table,
	getCoreRowModel,
} from "@tanstack/react-table";

export interface NewsItem {
	title: string;
	creator: string;
	dateCreated: string;
	id: number;
}

const columnHelper = createColumnHelper<CarRead>();

const columns = [
	columnHelper.accessor((row) => row.booking_id, {
		id: "booking_id",
		cell: (info) => info.getValue(),
		header: () => <span>Svensk titel</span>,
	}),
	columnHelper.accessor((row) => row.description, {
		id: "description",
		cell: (info) => info.getValue(),
		header: () => <span>Engelsk beskrivning</span>,
	}),
	columnHelper.accessor((row) => row.end_time, {
		id: "end_time",
		cell: (info) => info.getValue(),
		header: () => <span>Skapad</span>,
	}),
];

export default function Pirat() {
	const queryClient = useQueryClient();

	const { data, error, isFetching } = useQuery({
		...getAllBookingOptions(),
	});

	const table = useReactTable({
		columns,
		data: (data as CarRead[]) ?? [],
		getCoreRowModel: getCoreRowModel(),
	});

	if (isFetching) {
		return <p> Hämtar</p>;
	}

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				Administrera pirater
			</h3>
			<p className="py-3">
				Det finns många pirater som behöver administreras. Här kan du se en
				massa information om piraterna och deras status. Du kan också ändra
				status på piraterna. Glöm inte att pirater är viktiga för att hålla
				ordning på skeppet. Om du inte har några pirater så kommer skeppet att
				sjunka. Så se till att du har tillräckligt med pirater för att hålla
				skeppet flytande. Det värsta som kan hända är att skeppet sjunker och
				alla pirater drunknar. Det vill vi inte ha. Se upp för hajar och andra
				faror som lurar i vattnet. Det är viktigt att du är försiktig när du
				hanterar pirater. De kan vara farliga om de inte hanteras på rätt sätt.
				Så se till att du vet vad du gör innan du ger dig in i piratlivet. Lycka
				till!
			</p>
			<p>
				PS: Glöm inte att ge piraterna mat och vatten annars blir de arga och då
				kan det gå riktigt illa.
			</p>
			<p>
				PPS: Om du ger piraterna för mycket mat och vatten så kan de bli för
				feta och då orkar de inte jobba. Så se till att du ger dem lagom med mat
				och vatten.
			</p>
			<PiratForm />
			<AdminTable table={table} />
		</div>
	);
}
