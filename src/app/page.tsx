import Link from "next/link";

export default function MainLanding() {
	return (
		<div className="flex-grow">
			<p>
				Hej! 👋 Du 🫵 ser 👀 denna 📄 sida 📘 för 💡 att ✨ du 🫶 är 🧊 cool
				😎 och 🕸️ spindel 🕷️.
			</p>
			<p>👉👈</p>
			<Link href="admin/documents">Goto news</Link>
		</div>
	);
}
