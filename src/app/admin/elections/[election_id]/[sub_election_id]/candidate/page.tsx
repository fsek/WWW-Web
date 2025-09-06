"use client";
import { redirect, useParams } from "next/navigation";

export default function Page() {
	const params = useParams();
	redirect(`/admin/elections/${params.election_id}/${params.sub_election_id}`);
}
