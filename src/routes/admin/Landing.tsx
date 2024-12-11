import { Link } from "react-router-dom";

export default function Landing() {
	return (
		<div>
			<p>
				Hej! 👋 Du 🫵 ser 👀 denna 📄 sida 📘 för 💡 att ✨ du 🫶 är 🧊 cool 😎
				och 🕸️ spindel 🕷️.
			</p>
			<Link to="news">Goto news</Link>
		</div>
	);
}
