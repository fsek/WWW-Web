import { Link } from "react-router-dom";

export default function Landing() {
	return (
		<div>
			<p>Hello! 👋</p>
			<Link to="welcome">Goto news</Link>
		</div>
	);
}
