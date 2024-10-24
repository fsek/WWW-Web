import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Landing from "./Landing";
import News from "./news/News";
import Songs from "./songs/Songs";
import Test from "./test/Test";

export default function AdminPage() {
	// State to manage which dropdown is open
	const [openDropdown, setOpenDropdown] = useState(false);

	// Function to toggle the visibility of the dropdown
	const toggleDropdown = () => {
		setOpenDropdown(!openDropdown);
	};

	return (
		<div className="flex h-screen">
			{/* Sidebar */}
			<div className="flex h-full w-40 flex-col overflow-y-auto bg-forange md:w-1/6 lg:w-1/12">
				<Link to="" className="block w-full p-2">
					Home
				</Link>
				<Link to="test" className="block w-full p-2">
					Test
				</Link>
				<button
					onClick={toggleDropdown}
					className="w-full cursor-pointer bg-none p-2 text-left"
				>
					More Options
				</button>

				{/* Dropdown Menu */}
				{openDropdown && (
					<div className="mt-1 w-full rounded bg-gray-200 shadow-lg">
						<Link to="news" className="block w-full p-2 hover:bg-gray-300">
							Nyheter
						</Link>
						<Link to="songs" className="block w-full p-2 hover:bg-gray-300">
							Sånger
						</Link>
					</div>
				)}
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-4">
				<Routes>
					<Route index={true} element={<Landing />} />
					<Route path="test" element={<Test />} />
					<Route path="news" element={<News />} />
					<Route path="songs" element={<Songs />} />
				</Routes>
			</div>
		</div>
	);
}
