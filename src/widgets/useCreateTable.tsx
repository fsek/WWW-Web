import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	type ColumnDef,
	type TableOptions,
} from "@tanstack/react-table";
import { useState } from "react";

export default function createTable<T>({
	data,
	columns,
	...reactTableOptions
}: {
	data: T[];
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	columns: ColumnDef<T, any>[];
	//Array<AccessorKeyColumnDefBase<T, any> & Partial<IdIdentifier<T, any>>>;
} & Partial<TableOptions<T>>) {
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
			...reactTableOptions?.initialState,
		},
		state: {
			sorting,
			...reactTableOptions?.state,
		},
		...reactTableOptions,
	});

	return table;
}
