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
	initialSorting,
	...reactTableOptions
}: {
	data: T[];
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	columns: ColumnDef<T, any>[];
	//Array<AccessorKeyColumnDefBase<T, any> & Partial<IdIdentifier<T, any>>>;
	initialSorting?: SortingState;
} & Partial<TableOptions<T>>) {
	const [sorting, setSorting] = useState<SortingState>(initialSorting ?? []);

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
				pageSize: 50,
				...reactTableOptions?.initialState?.pagination,
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
