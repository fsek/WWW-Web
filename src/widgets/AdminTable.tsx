import { Button } from "@/components/ui/button";
import { flexRender, type Table } from "@tanstack/react-table";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function AdminTable<T>({ table }: { table: Table<T> }) {
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
										className="px-4 py-2 text-left border-r border-table-border last:border-r-0"
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
										className="px-4 py-2 border-r border-table-border last:border-r-0"
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
										className="px-4 py-2 text-left border-r border-table-border last:border-r-0"
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
			<div className="mt-4 m-5 flex justify-end">
				<Button
					className="px-4 py-2 text-white rounded"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ArrowLeft />
				</Button>
				<Button
					className="px-4 py-2 text-white rounded"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<ArrowRight />
				</Button>
			</div>
		</div>
	);
}
