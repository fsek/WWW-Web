
import { useState, useEffect } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Landing from "./Landing";
import News from "./news/News";
import Songs from "./songs/Songs";
import "./Admin.css";
import Test from "./test/Test";

export default function AdminPage() {
    // State to manage the visibility of the second sidebar
    const [isSecondSidebarOpen, setIsSecondSidebarOpen] = useState(false);

    // Function to toggle the visibility
    const toggleSecondSidebar = () => {
        setIsSecondSidebarOpen(!isSecondSidebarOpen);
    };

    // Add or remove a class on the body element based on the state
    useEffect(() => {
        if (isSecondSidebarOpen) {
            document.body.classList.add("second-sidebar-open");
        } else {
            document.body.classList.remove("second-sidebar-open");
        }
    }, [isSecondSidebarOpen]);

    return (
        <>
            <div className="sidebar">
                <Link to="">Home</Link>
                <Link to="test">Test</Link>
                <button onClick={toggleSecondSidebar}>More Options</button>
            </div>
            {isSecondSidebarOpen && (
                <div className="second-sidebar">
                    <Link to="news">Nyheter</Link>
                    <Link to="songs">Sånger</Link>
                </div>
            )}
            <div className="content">
                <Routes>
                    <Route index={true} element={<Landing />} />
                    <Route path="test" element={<Test />} />
                    <Route path="news" element={<News />} />
                    <Route path="songs" element={<Songs />} />
                </Routes>
            </div>
        </>
    );
}
