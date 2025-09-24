import ClientCouncilPage from "./ClientCouncilPage";

// render client component
export default async function CouncilPage({
	params,
}: { params: Promise<{ slug: string }> }) {
	const resolvedParams = await params;
	return <ClientCouncilPage slug={resolvedParams.slug} />;
}
