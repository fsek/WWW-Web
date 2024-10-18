// import { Link, Route, Routes } from "react-router-dom";
// import Landing from "./Landing";
// import News from "./news/News";
// import Songs from "./songs/Songs"
// import "./Admin.css";

// export default function AdminPage() {
// 	return (
// 		<>
// 			<div className="sidebar">
// 				<Link to="">Home</Link>
// 				<Link to="news">Nyheter</Link>
// 				<Link to="songs">Sånger</Link>
// 			</div>
// 			<div className="content">
// 				<p>Välkommen till Adminhemsidan.</p>
// 				<Routes>
// 					<Route index={true} element={<Landing />} />
// 					<Route path="news" element={<News />} />
// 					<Route path="songs" element={<Songs />} />
// 					<Route path="songs" element={<Songs />} />

// 				</Routes>
// 			</div>
// 		</>
// 	);
// }


import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Landing from "./Landing";
import News from "./news/News";
import Songs from "./songs/Songs";
import "./Admin.css";

export default function AdminPage() {
    // State to manage the visibility of the second sidebar
    const [isSecondSidebarOpen, setIsSecondSidebarOpen] = useState(false);

    // Function to toggle the visibility
    const toggleSecondSidebar = () => {
        setIsSecondSidebarOpen(!isSecondSidebarOpen);
    };

    return (
        <>
            <div className="sidebar">
                <Link to="">Home</Link>
                <button onClick={toggleSecondSidebar}>More Options</button>
            </div>
            {isSecondSidebarOpen && (
                <div className="second-sidebar">
                    <Link to="news">Nyheter</Link>
                    <Link to="songs">Sånger</Link>
                </div>
            )}
            <div className="content">
                <p>Välkommen till Adminhemsidan.</p>
                <Routes>
                    <Route index={true} element={<Landing />} />
                    <Route path="news" element={<News />} />
                    <Route path="songs" element={<Songs />} />
                </Routes>
            </div>
        </>
    );
}
