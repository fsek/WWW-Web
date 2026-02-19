import { headers } from "next/headers";
import NotFound from "@/components/NotFound";

export default async function NotFoundServer() {
	// Force dynaminc rendering to generate new random number each time
	await headers();

	const random = Math.random();

	return <NotFound random={random} />;
}
