import { Link, Route, Routes } from "react-router-dom";
import Landing from "./Landing";
import News from "./news/News";
import Songs from "./songs/Songs"
import "./Admin.css";

export default function AdminPage() {
	return (
		<>
			<div className="sidebar">
				<Link to="">Home</Link>
				<Link to="news">Nyheter</Link>
				<Link to="songs">Sånger</Link>
			</div>
			<div className="content">
				<Routes>
					<Route index={true} element={<Landing />} />
					<Route path="news" element={<News />} />
					<Route path="songs" element={<Songs />} />
				</Routes>
			</div>
		</>
	);
}
