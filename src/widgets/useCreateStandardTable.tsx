"use client";

import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	type SortingState,
	type AccessorKeyColumnDefBase,
	type IdIdentifier,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";

export default function createTable<T>({
	data,
	columns,
	initialFilter = "",
	initialCategory = "",
	categoryField = "category",
	initialPageSize = 10,
}: {
	data: T[];
	columns: Array<
		AccessorKeyColumnDefBase<T, any> & Partial<IdIdentifier<T, any>>
	>;
	initialFilter?: string;
	initialCategory?: string;
	categoryField?: string;
	initialPageSize?: number;
}) {
	// State for sorting, filtering, and categorical filtering
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState(initialFilter);
	const [categoryFilter, setCategoryFilter] = useState(initialCategory);

	// External sorting handler
	const sortByField = (field: string, direction: "asc" | "desc") => {
		setSorting([{ id: field, desc: direction === "desc" }]);
	};

	// Derived filtered data for category filtering (pre-table filtering)
	const filteredData = useMemo(() => {
		if (!categoryFilter) return data;

		return data.filter((item) => {
			// Type assertion for dynamic property access
			const record = item as Record<string, unknown>;
			return record[categoryField] === categoryFilter;
		});
	}, [data, categoryFilter, categoryField]);

	// Get available category options
	const categoryOptions = useMemo(() => {
		const categories = new Set<string>();

		for (const item of data) {
			const record = item as Record<string, unknown>;
			const category = record[categoryField];
			if (typeof category === "string") {
				categories.add(category);
			}
		}

		return Array.from(categories).map((value) => ({
			value,
			label: value,
		}));
	}, [data, categoryField]);

	const table = useReactTable({
		data: filteredData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: initialPageSize,
			},
			sorting,
		},
		state: {
			sorting,
			globalFilter,
		},
	});

	return {
		table,
		sorting,
		setSorting,
		globalFilter,
		setGlobalFilter,
		categoryFilter,
		setCategoryFilter,
		sortByField,
		categoryOptions,
	};
}
