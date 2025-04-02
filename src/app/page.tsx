import Link from "next/link";

import { NavBar } from "../components/NavBar";
import WaveAnimation from "../components/WaveAnimation";

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
			<Footer />
		</div>
	);
}
