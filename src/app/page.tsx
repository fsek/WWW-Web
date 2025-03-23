import Link from "next/link";
import { NavBar } from "../components/NavBar";
import Footer from "@/components/Footer";

export default function MainLanding() {
	return (
		<div className="flex flex-col min-h-screen">
			<NavBar />
			<div className="flex-grow">
				<p>
					Hej! 👋 Du 🫵 ser 👀 denna 📄 sida 📘 för 💡 att ✨ du 🫶 är 🧊 cool
					😎 och 🕸️ spindel 🕷️.
				</p>
				<Link href="news">Goto news</Link>
			</div>
			<Footer />
		</div>
	);
}
