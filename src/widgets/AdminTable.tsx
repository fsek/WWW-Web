import { Button } from "@/components/ui/button";
import { flexRender, type Table } from "@tanstack/react-table";
import { ArrowLeft, ArrowRight } from "lucide-react";

//https://tanstack.com/table/v8/docs/guide/pagination - Pagination tutorial

const pageSizeOptions = [5, 10, 20, 50];

export default function AdminTable<T>({ table }: { table: Table<T> }) {
	const { pageIndex } = table.getState().pagination;
	const pageCount = table.getPageCount();

	return (
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
										style={{ width: header.column.getSize() }}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id} className="border-t">
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
