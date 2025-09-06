import { redirect } from "next/navigation";

export default function Page({
	params,
}: {
	params: { election_id: string; sub_election_id: string };
}) {
	redirect(`/admin/elections/${params.election_id}/${params.sub_election_id}`);
}
