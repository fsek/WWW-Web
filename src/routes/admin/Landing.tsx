import { Link } from "react-router-dom";

export default function Landing() {
	return (
		<>
			<p>Hello! 👋</p>
			<Link to="welcome">Goto news</Link>
		</>
	);
}
