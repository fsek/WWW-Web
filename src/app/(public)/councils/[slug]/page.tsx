import ClientCouncilPage from "./ClientCouncilPage";

// Define councils statically for production
// These need to be lowercase, not using åäö
interface Council {
	name: string;
}

let councils: Council[] = [];
if (process.env.ENV === "production") {
	councils = [
		{ name: "cafemasteriet" },
		{ name: "styrelsen" },
		{ name: "fnu" },
		{ name: "bokforlaget" },
		{ name: "foset" },
		{ name: "prylmasteriet" },
		{ name: "sanningsministeriet" },
		{ name: "samvetet" },
		{ name: "sekret-service" },
		{ name: "studieradet" },
		{ name: "kulturministeriet" },
		{ name: "ovriga" },
		{ name: "externa-representanter" },
	];
} else {
	councils = [{ name: "kodmasteriet" }, { name: "sanningsministeriet" }];
}

// Return a list of `params` to populate the [slug] dynamic segment
export function generateStaticParams() {
	return councils.map((council) => ({
		slug: council.name,
	}));
}

// render client component
export default async function CouncilPage({
	params,
}: { params: Promise<{ slug: string }> }) {
	const resolvedParams = await params;
	return <ClientCouncilPage slug={resolvedParams.slug} />;
}
