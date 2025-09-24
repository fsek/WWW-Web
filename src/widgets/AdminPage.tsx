import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type FilterMeta,
	flexRender,
	getFilteredRowModel,
	type OnChangeFn,
	type Row,
	type SortingState,
	type VisibilityState,
} from "@tanstack/react-table";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Pen } from "lucide-react";
import { useTranslation } from "react-i18next";
import useCreateTable from "@/widgets/useCreateTable";
import { type ComponentType, type ReactNode, useState } from "react";
import { Input } from "@/components/ui/input";
import type { UseQueryResult } from "@tanstack/react-query";
import { LoadingErrorCard } from "@/components/LoadingErrorCard";
import { rankItem } from "@tanstack/match-sorter-utils";

export const pageSizeOptions = [20, 50, 100, 6122];

// a fuzzy text search filter
// https://tanstack.com/table/v8/docs/guide/fuzzy-filtering
function fuzzyFilter<TData>(
	row: Row<TData>,
	columnId: string,
	filterValue: any,
	addMeta: (meta: FilterMeta) => void,
) {
	// Rank the item
	const itemRank = rankItem(row.getValue(columnId), filterValue);

	// Store the itemRank info
	addMeta({
		itemRank,
	});

	// Return if the item should be filtered in/out
	return itemRank.passed;
}

/**
 * A component that, when passed a non-null item, provides a way for the user
 * to edit that item. It is normally rendered in a dialog.
 *
 * When `item` is `null`, the component should be hidden.
 */
export type EditComponent<T> = ComponentType<{
	item: T | null;
	onClose: () => void;
}>;

/**
 * A generic admin page with a table, search, pagination, and an edit
 * capabilities. Yay!
 */
export default function AdminPage<T>({
	title,
	description,
	queryResult: { data = [], error, isPending },
	columns,
	searchPlaceholder,
	editComponent: EditComponent,
	headerButtons,
	columnFilters,
	onColumnFiltersChange,
	columnVisibility,
}: {
	/**
	 * Page title.
	 */
	title: string;
	/**
	 * Optional page description.
	 */
	description?: string;
	/**
	 * Whatever your `useQuery` call returns---all of it, not just the `data` field.
	 */
	queryResult: UseQueryResult<T[]>;
	columns: ColumnDef<T>[];
	searchPlaceholder?: string;
	/**
	 * See the docs for {@link EditComponent<T>}.
	 */
	editComponent: EditComponent<T>;
	headerButtons?: ReactNode;
	columnFilters?: ColumnFiltersState;
	onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
	columnVisibility?: VisibilityState;
}) {
	const [sorting, setSorting] = useState<SortingState>([]);

	// If the global filter is set, the data is filtered in a fuzzy manner.
	//
	// - Exclude columns that are not relevant for the global filter with
	//   `enableGlobalFilter: false` on that column's definition.
	// - You can add hidden columns that are only used for filtering/searching,
	//   like a "full_name" column that concatenates first and last names.
	//   Otherwise, you would not be able to find a user by searching for their
	//   full name.
	//
	const [globalFilter, setGlobalFilter] = useState("");

	const [editing, setEditing] = useState<T | null>(null);

	const table = useCreateTable({
		columns,
		data,
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		globalFilterFn: fuzzyFilter,
		initialState: {
			columnVisibility,
		},
		state: {
			sorting,
			globalFilter,
			columnFilters,
		},
		onGlobalFilterChange: setGlobalFilter,
		onColumnFiltersChange,
	});

	const { pageIndex } = table.getState().pagination;
	const pageCount = table.getPageCount();
	const { t } = useTranslation("admin");

	if (isPending) return <LoadingErrorCard />;

	if (error) return <LoadingErrorCard error={error} />;

	return (
		<>
			<div className="px-8">
				<div className="mb-4">
					<h3 className="text-3xl font-semibold mb-2 text-primary">{title}</h3>
					<p className="max-w-[70ch] text-sm font-medium">{description}</p>
				</div>

				<header className="flex items-center flex-wrap mb-4 gap-2">
					<Input
						className="w-md mr-auto"
						placeholder={searchPlaceholder || t("admin:search_placeholder")}
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
					/>
					{headerButtons}
				</header>

				<div className="flex flex-col w-full">
					<div className="overflow-x-auto">
						<table className="table-fixed border border-table-border w-full border-collapse">
							<thead>
								{table.getHeaderGroups().map((headerGroup) => (
									<tr key={headerGroup.id}>
										{headerGroup.headers.map((header) => (
											<th
												key={header.id}
												className="px-4 py-2 text-left border-r border-table-border last:border-r-0 truncate"
												colSpan={header.colSpan}
												style={{ width: header.column.getSize() }}
												aria-sort={
													header.column.getIsSorted()
														? header.column.getIsSorted() === "asc"
															? "ascending"
															: "descending"
														: "none"
												}
											>
												{header.isPlaceholder ? null : (
													// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
													<div
														className={
															header.column.getCanSort()
																? "cursor-pointer select-none flex items-center"
																: "flex items-center"
														}
														onClick={header.column.getToggleSortingHandler()}
														title={
															header.column.getCanSort()
																? header.column.getNextSortingOrder() === "asc"
																	? "Sort ascending"
																	: header.column.getNextSortingOrder() ===
																			"desc"
																		? "Sort descending"
																		: "Clear sort"
																: undefined
														}
													>
														{flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
														{header.column.getIsSorted() ? (
															header.column.getIsSorted() === "asc" ? (
																<ArrowDown
																	className="ml-1 w-4 h-4"
																	aria-label="Sorted ascending"
																/>
															) : (
																<ArrowUp
																	className="ml-1 w-4 h-4"
																	aria-label="Sorted descending"
																/>
															)
														) : null}
													</div>
												)}
											</th>
										))}
									</tr>
								))}
							</thead>
							<tbody>
								{table.getRowModel().rows.map((row) => {
									return (
										// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
										<tr
											key={row.id}
											onClick={() => setEditing(row.original)}
											className={cn(
												"border-t cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
											)}
										>
											{row.getVisibleCells().map((cell) => (
												<td
													key={cell.id}
													className="px-4 py-2 border-r border-table-border last:border-r-0 truncate"
													style={{ width: cell.column.getSize() }}
												>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</td>
											))}
										</tr>
									);
								})}
							</tbody>
							<tfoot>
								{table.getFooterGroups().map((footerGroup) => (
									<tr key={footerGroup.id}>
										{footerGroup.headers.map((header) => (
											<th
												key={header.id}
												className="px-4 py-2 text-left border-r border-table-border last:border-r-0 truncate"
												style={{ width: header.column.getSize() }}
											>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.footer,
															header.getContext(),
														)}
											</th>
										))}
									</tr>
								))}
							</tfoot>
						</table>
					</div>
					<div className="mt-4 m-5 flex justify-end space-x-1">
						<Button
							className="px-4 py-2 text-white rounded"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<ArrowLeft />
						</Button>
						<Button
							variant="ghost" // Optional: Choose a variant that suits your design
							className="px-4 py-2 text-gray-700 rounded cursor-default"
							disabled
						>
							{pageIndex + 1}/{pageCount}
						</Button>
						<Button
							className="px-4 py-2 text-white rounded"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<ArrowRight />
						</Button>
						<select
							value={table.getState().pagination.pageSize}
							onChange={(e) => {
								table.setPageSize(Number(e.target.value));
							}}
							className="ml-4 px-2 py-1 border rounded"
						>
							{pageSizeOptions.map((size) => (
								<option key={size} value={size}>
									{t("show")} {size}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			<EditComponent item={editing} onClose={() => setEditing(null)} />
		</>
	);
}
