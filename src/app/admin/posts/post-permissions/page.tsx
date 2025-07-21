"use client";

import { getPostOptions } from "@/api/@tanstack/react-query.gen";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import useCreateTable from "@/widgets/useCreateTable";
import type { _PostPermissionRead, PostRead } from "@/api";
import PostPermissionForm from "./PostPermissionForm";

// function CouncilName({ councilId }: { councilId: number }) {
// 	const { data } = useQuery({
// 		...getAllCouncilsOptions(),
// 	});

// 	const council = data?.find((c) => c.id === councilId);

// 	return council?.name;
// }

// Column setup
const columnHelper = createColumnHelper<_PostPermissionRead>();
const columns = [
	columnHelper.accessor("target", {
		header: "Target",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("action", {
		header: "Action",
		cell: (info) => info.getValue(),
	}),
];

export default function PostPermissions() {
	const queryClient = useQueryClient();
	const selectedPostFromCache = queryClient.getQueryData<PostRead>([
		"selectedPost",
	]);

	const {
		data: selectedPost,
		isLoading,
		error,
	} = useQuery({
		...getPostOptions({
			path: { post_id: selectedPostFromCache?.id ?? -1 },
		}),
		enabled: !!selectedPostFromCache,
	});

	const permissions = selectedPost?.permissions ?? [];
	const table = useCreateTable({
		data: permissions,
		columns,
	});

	if (!selectedPostFromCache) {
		return (
			<div>Ingen post vald. Gå tillbaka och välj en post att administrera.</div>
		);
	}
	if (isLoading) {
		return <div>Läser in post...</div>;
	}
	if (error || !selectedPost) {
		return <div>Det gick inte att hämta posten.</div>;
	}

	// 4) And finally render the UI that uses all those hooks
	function handleRowClick(_row: Row<_PostPermissionRead>) {
		// …
	}

	return (
		<div className="px-8 space-x-4">
			<h3 className="text-xl px-8 py-3 underline underline-offset-4 decoration-sidebar">
				Administrera specifika rättigheter för poster
			</h3>
			<p className="py-3">
				Här kan du uppdatera posters rättigheter & ta bort existerande
				rättigheter på hemsidan.
			</p>
			<PostPermissionForm post_values={selectedPost} />
			<AdminTable table={table} onRowClick={handleRowClick} />
		</div>
	);
}
