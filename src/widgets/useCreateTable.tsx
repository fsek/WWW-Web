import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	type AccessorKeyColumnDefBase,
	type IdIdentifier,
} from "@tanstack/react-table";
import { useState } from "react";

export default function createTable<T>({
	data,
	columns,
}: {
	data: T[];
	columns: Array<
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		AccessorKeyColumnDefBase<T, any> & Partial<IdIdentifier<T, any>>
	>;
}) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		data: data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 10,
			},
			sorting,
		},
		state: {
			sorting,
		},
	});

	return table;
}
