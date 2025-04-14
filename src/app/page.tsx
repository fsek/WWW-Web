import Link from "next/link";

import { NavBar } from "../components/NavBar";
import WaveAnimation from "../components/WaveAnimation";
import TwoColumnLayout from "../components/TwoColumnLayout";

import Footer from "@/components/Footer";

export default function MainLanding() {
	return (
		<div className="flex flex-col min-h-screen">
			<div className="flex-grow">
				<p>
					Hej! 👋 Du 🫵 ser 👀 denna 📄 sida 📘 för 💡 att ✨ du 🫶 är 🧊 cool
					😎 och 🕸️ spindel 🕷️.
				</p>
				<p>👉👈</p>
				<Link href="admin/documents">Goto news</Link>
			</div>
			<div className="">
				<WaveAnimation />
			</div>
			<TwoColumnLayout
				leftColumnContent={
					<div className="w-full">
						<h1 className="text-4xl font-bold">Welcome to the App</h1>
						<p className="mt-4">
							This is a simple two-column layout example using Tailwind CSS.
						</p>
					</div>
				}
				rightColumnContent={
					<div className="w-full">
						<h2 className="text-2xl font-semibold">Right Column</h2>
						<p className="mt-4">
							This is the right column content. You can add any content here.
						</p>
					</div>
				}
				className="p-14"
				gap="gap-12"
			/>
			<Footer />
		</div>
	);
}
