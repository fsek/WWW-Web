import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/PluggNavBar";
// Switch to a plugg-specific layout later

export default function MemberLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col min-h-screen">
			<NavBar />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}
