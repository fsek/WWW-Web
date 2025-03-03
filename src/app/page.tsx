import Link from "next/link";
import { NavigationMenuDemo } from "../components/NavBar";

export default function MainLanding() {
	return (
		<>
			<NavigationMenuDemo />
			<div>
				<p>
					Hej! 👋 Du 🫵 ser 👀 denna 📄 sida 📘 för 💡 att ✨ du 🫶 är 🧊 cool
					😎 och 🕸️ spindel 🕷️.
				</p>
				<Link href="news">Goto news</Link>
			</div>
		</>
	);
}
