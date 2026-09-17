import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/PluggNavBar";

export default function PluggLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div
			className="flex min-h-screen flex-col"
			style={{ fontFamily: '"Archivo", Inter, system-ui, sans-serif' }}
		>
			<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap"
				precedence="default"
			/>
			<NavBar />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}
