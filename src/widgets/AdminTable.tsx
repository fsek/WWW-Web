import { Button } from "@/components/ui/button";
import { flexRender, type Row, type Table } from "@tanstack/react-table";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";

//https://tanstack.com/table/v8/docs/guide/pagination - Pagination tutorial

const pageSizeOptions = [5, 10, 20, 50];

export default function AdminTable<T>({
	table,
	onRowClick,
}: { table: Table<T>; onRowClick?: (row: Row<T>) => void }) {
	const { pageIndex } = table.getState().pagination;
	const pageCount = table.getPageCount();

	return (
		<div className="flex flex-col w-full cursor-pointer">
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
															: header.column.getNextSortingOrder() === "desc"
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
						{table.getRowModel().rows.map((row) => (
							// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
							<tr
								key={row.id}
								onClick={() => onRowClick?.(row)}
								className="border-t hover:bg-gray-50"
							>
								{row.getVisibleCells().map((cell) => (
									<td
										key={cell.id}
										className="px-4 py-2 border-r border-table-border last:border-r-0 truncate"
										style={{ width: cell.column.getSize() }}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
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
							Show {size}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
