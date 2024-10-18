import React, { useEffect, useState } from "react";
import "../Admin.css";
import { type SongRead, SongsGetAllSongsResponse, SongsService } from "../../../api"; // Adjust your import path as needed

// Main Songs Component
export default function Songs() {
  // State to hold the fetched song
  console.log("Please work")
  const [songs, setSong] = useState<SongsGetAllSongsResponse | null>(null); // Use a single song object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    console.log("useEffect executed"); // Check if useEffect is running
    const fetchSong = async () => {
      console.log("fetchSong called"); // Check if fetchSong is called
      try {
        const response = await SongsService.getAllSongs();
        console.log("API response:", response); // Log the entire response
        const fetchedSongs = response.data ?? null;
        console.log("Fetched song data:", fetchedSongs); // Log the fetched song
        setSong(fetchedSongs);
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
  if (!songs) return <p>No songs available.</p>;

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
          {songs.map((song, index) => (
            <tr key={index.toString()}>
              <td>{song.title}</td>
              <td>{song.id}</td>
              <td>{song.views}</td>
              <td>
                <button type="button">Redigera</button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}
