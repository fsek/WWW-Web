"use client";

import { useEffect, useState } from "react";
import {
	getAllCouncilsOptions,
	getAllPostsOptions,
} from "@/api/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type Row } from "@tanstack/react-table";

import AdminTable from "@/widgets/AdminTable";
import useCreateTable from "@/widgets/useCreateTable";
import { _PostPermissionRead, PermissionRead, PostRead } from "@/api";

function CouncilName({ councilId }: { councilId: number }) {
	const { data } = useQuery({
		...getAllCouncilsOptions(),
	});

	const council = data?.find((c) => c.id === councilId);

	return council?.name;
}

// Column setup
const columnHelper = createColumnHelper<_PostPermissionRead>();
const columns = [
	columnHelper.accessor("target", {
		header: "Post",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("action", {
		header: "Council name",
		cell: (info) => info.getValue(),
	}),
];

export default function PostPermissions() {
	const [selectedPost, setSelectedPost] = useState<PostRead| null>(null);

	useEffect(() => {
		const storedPost = sessionStorage.getItem("selectedPost");
		if (storedPost) {
      setSelectedPost(JSON.parse(storedPost) as PostRead);
			// Optionally clear the stored data if not needed later:
			sessionStorage.removeItem("selectedPost");
		}
	}, []);

  const [openEditDialog, setOpenEditDialog] = useState(false);
	const [selectedPermission, setSelectedPermission] = useState<_PostPermissionRead | null>(null);

  const table = useCreateTable({ data: selectedPost?.permissions ?? [], columns });
  

  function handleRowClick(row: Row<_PostPermissionRead>) {
      setSelectedPermission(row.original);
      setOpenEditDialog(true);
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
			{/* <PostForm /> */}
			
			<AdminTable table={table} onRowClick={handleRowClick} />

			{/* <PostEditForm
				open={openEditDialog}
				onClose={() => handleClose()}
				selectedPost={selectedEvent as PostRead}
			/> */}
		</div>
	);
}
