import Link from "next/link";
import { NavBar } from "../components/NavBar";
import WaveAnimation from "../components/WaveAnimation";

import Footer from "@/components/Footer";
import CustomTitle from "@/components/CustomTitle";

export default function MainLanding() {
	return (
		<div className="flex flex-col min-h-screen">
			<NavBar />
			<div className="flex-grow">
				<p>
					Hej! 👋 Du 🫵 ser 👀 denna 📄 sida 📘 för 💡 att ✨ du 🫶 är 🧊 cool
					😎 och 🕸️ spindel 🕷️.
				</p>
				<CustomTitle text="Välkommen till F-sektionens fantastiska hemsida! Wow vad mycket text man kan få plats med" className="mt-4" />
				<CustomTitle text="eller lite" className="mt-4" />
				<Link href="news">Goto news</Link>
			</div>
			<div className="">
				<WaveAnimation />
			</div>
			<Footer />
		</div>
	);
}
