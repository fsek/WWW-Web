import ClientCouncilPage from "./ClientCouncilPage";

// Define councils statically for production
// These need to be lowercase, not using åäö
interface Council {
	name_sv: string;
}

let councils: Council[] = [];
if (
	// I'm just guessing here
	process.env.ENV === "production" ||
	process.env.BUILD_ENV === "stage" ||
	process.env.BUILD_ENV === "production" ||
	process.env.BUILD_ENV === "prod"
) {
	councils = [
		{ name_sv: "cafemasteriet" },
		{ name_sv: "styrelsen" },
		{ name_sv: "fnu" },
		{ name_sv: "bokforlaget" },
		{ name_sv: "foset" },
		{ name_sv: "prylmasteriet" },
		{ name_sv: "sanningsministeriet" },
		{ name_sv: "samvetet" },
		{ name_sv: "sekret-service" },
		{ name_sv: "studieradet" },
		{ name_sv: "kulturministeriet" },
		{ name_sv: "ovriga" },
		{ name_sv: "externa-representanter" },
	];
} else {
	councils = [{ name_sv: "kodmasteriet" }, { name_sv: "sanningsministeriet" }];
}

// Return a list of `params` to populate the [slug] dynamic segment
export function generateStaticParams() {
	return councils.map((council) => ({
		slug: council.name_sv,
	}));
}

// render client component
export default async function CouncilPage({
	params,
}: { params: Promise<{ slug: string }> }) {
	const resolvedParams = await params;
	return <ClientCouncilPage slug={resolvedParams.slug} />;
}
