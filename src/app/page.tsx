import Link from "next/link";

import { NavBar } from "../components/NavBar";
import WaveAnimation from "../components/WaveAnimation";
import TwoColumnLayout from "../components/TwoColumnLayout";

import Footer from "@/components/Footer";
import CustomTitle from "@/components/CustomTitle";

export default function MainLanding() {
	return (
		<div className="flex flex-col min-h-screen">
			<div className="flex-grow">
				<p>
					Hej! 👋 Du 🫵 ser 👀 denna 📄 sida 📘 för 💡 att ✨ du 🫶 är 🧊 cool
					😎 och 🕸️ spindel 🕷️.
				</p>
				<CustomTitle text="Välkommen till F-sektionens fantastiska hemsida! Wow vad mycket text man kan få plats med" className="mt-4" />
				<CustomTitle text="eller lite" className="mt-4" />
				<p>👉👈</p>
				<Link href="admin/documents">Goto news</Link>
			</div>
			<div className="">
				<WaveAnimation />
			</div>
			<TwoColumnLayout
				leftColumnContent={
					<>
						<h1 className="text-4xl font-bold">Welcome to the App</h1>
						<p className="mt-4">
							This is a simple two-column layout example using Tailwind CSS.
						</p>
					</>
				}
				rightColumnContent={
					<>
						<h2 className="text-2xl font-semibold">Right Column</h2>
						<p className="mt-4">
							This is the right column content. You can add any content here.
						</p>
					</>
				}
				className="p-14 gap-12"
			/>
			<Footer />
		</div>
	);
}
