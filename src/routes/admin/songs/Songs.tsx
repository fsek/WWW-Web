import React, { useEffect, useState } from "react";
import "../Admin.css";
import { type SongRead, SongsService } from "../../../api"; // Adjust your import path as needed

// Main Songs Component
export default function Songs() {
  // State to hold the fetched song
  console.log("Please work")
  const [song, setSong] = useState<SongRead | null>(null); // Use a single song object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use `useEffect` to fetch the song when the component mounts
//   useEffect(() => {
//     const fetchSong = async () => {
//       try {
//         const fetchedSong = await SongsService.getSong({
//           path: {
//             song_id: 1, // Fetch the song with ID 1
//           },
//         }).then((val) => val.data ?? null); // Ensure `fetchedSong` is set to null if data is not returned
//         console.log("API response:", fetchedSong); // Check the full API response

//         setSong(fetchedSong); // Set state with the fetched song
//       } catch (error) {
//         setError("Failed to fetch song. Please try again later.");
//         console.error("Failed to fetch song:", error);
//       } finally {
//         setLoading(false); // Turn off loading state
//       }
//     };

//     fetchSong(); // Call the async function
//   }, []); // Empty dependency array means this runs only once on component mount



  useEffect(() => {
    console.log("useEffect executed"); // Check if useEffect is running
    const fetchSong = async () => {
      console.log("fetchSong called"); // Check if fetchSong is called
      try {
        const response = await SongsService.getSong({
          path: { song_id: 1 },
        });
        console.log("API response:", response); // Log the entire response
        const fetchedSong = response.data ?? null;
        console.log("Fetched song data:", fetchedSong); // Log the fetched song
        setSong(fetchedSong);
      } catch (error) {
        console.error("Failed to fetch song:", error);
        setError("Failed to fetch song. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchSong();
  }, []);
  

  // Conditional rendering based on the loading, error, and data state
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!song) return <p>No song available with the given ID.</p>;

  return (
    <div className="content">
      <h1>Administrera sånger</h1>
      <p>Här kan du skapa nyheter & redigera existerande sånger på hemsidan.</p>
      <button type="button">Lägg till sång</button>
      <button type="button">Uppdatera sång</button>
      <h2>Sånginformation</h2>

      {/* Render the song details */}
      <table>
        <thead>
          <tr>
            <th>Titel</th>
            <th>Id</th>
            <th>Lyssningar</th>
            <th>Åtgärd</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{song.title}</td>
            <td>{song.id}</td>
            <td>{song.views ?? 0}</td> {/* Use optional chaining for views */}
            <td>
              <button type="button">Redigera</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
