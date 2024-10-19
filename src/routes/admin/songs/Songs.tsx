import React, { useEffect, useState } from "react";
import "../Admin.css";
import { SongCreate, SongsGetAllSongsResponse, SongsService } from "../../../api"; // Justera din importväg efter behov

// Main Songs Component
export default function Songs() {
  const [songs, setSongs] = useState<SongsGetAllSongsResponse>([]); // Ändrat från null till tom array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false); // State för att visa/inte visa formuläret
  const [newSong, setNewSong] = useState<SongCreate>({
    title: "",
    author: "", // Bytt från 'author' till 'artist' för konsistens
    melody: "", // Använd tom sträng istället för null
    content: "", // Tom sträng eller standardvärde
    category: { id: 1, name: "SNELA" } // Förutsatt att detta är ett giltigt standardvärde
    // Lägg till andra fält med tomma värden om det behövs
  });


  useEffect(() => {
    console.log("useEffect executed"); // Kontrollera om useEffect körs
    const fetchSongs = async () => {
      console.log("fetchSongs called"); // Kontrollera om fetchSongs anropas
      try {
        const response = await SongsService.getAllSongs();
        console.log("API response:", response); // Logga hela svaret
        const fetchedSongs = response.data ?? [];
        console.log("Fetched song data:", fetchedSongs); // Logga de hämtade låtarna
        setSongs(fetchedSongs);
      } catch (error) {
        console.error("Failed to fetch songs:", error);
        setError("Failed to fetch songs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const handleAddButtonClick = () => {
    setShowAddForm(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSong((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await SongsService.createSong({ body: newSong }); // Ändrat från createSong till addSong, justera efter din API-metod
      if (response.data) { // Säkerställ att response.data är definierad
        console.log("Added song:", response.data);
        setSongs((prevSongs) => [...prevSongs, response.data]);
        setShowAddForm(false);
        setNewSong({
          title: "",
          author: "",
          melody: "",
          content: "",
          category: { id: 1, name: "SNELA" }
        }); // Återställ alla fält
      } else {
        throw new Error("Response data is undefined");
      }
    } catch (error) {
      console.error("Failed to add song:", error);
      setError("Failed to add song. Please try again.");
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setNewSong({
      title: "",
      author: "",
      melody: "",
      content: "",
      category: { id: 1, name: "SNELA" }
    }); // Återställ alla fält
  };

  // Conditional rendering based on the loading, error, and data state
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-8 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Administrera sånger</h1>
      <p>Här kan du skapa nyheter & redigera existerande sånger på hemsidan.</p>

      <div className="mb-6 flex gap-4">
        <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-yellow-600" onClick={handleAddButtonClick}>
          Lägg till sång
        </button>
        <button type="button" className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-blue-600">Uppdatera sång</button>
      </div>
      <h2>Sånginformation</h2>
      {/* Lägg till formuläret för att skapa en ny låt */}
      {showAddForm && (
        <form onSubmit={handleFormSubmit} className="add-song-form">
          <h3>Lägg till ny låt</h3>
          <div>
            <label htmlFor="title">Titel:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newSong.title}
              onChange={handleFormChange}
              required
            />
          </div>
          <div>
            <label htmlFor="artist">Artist:</label> {/* Ändrat från 'author' till 'artist' */}
            <input
              type="text"
              id="artist"
              name="author" // Ändrat från 'author' till 'artist'
              value={newSong.author ?? "Herr bajskorvsson"} // Ändrat från newSong.author till newSong.artist
              onChange={handleFormChange}
              required
            />
          </div>
          <div>
            <label htmlFor="melody">Melodi:</label>
            <input
              type="text"
              id="melody"
              name="melody"
              value={newSong.melody ?? ""}
              onChange={handleFormChange}
              required
            />
          </div>
          <div>
            <label htmlFor="content">Innehåll:</label>
            <input
              type="text"
              id="content"
              name="content"
              value={newSong.content}
              onChange={handleFormChange}
              required
            />
          </div>
          <div>
            <label htmlFor="category">Kategori:</label>
            {/* Om kategorin är statisk kan du använda ett select-fält */}
            <select
              id="category"
              name="category"
              value={newSong.category.id ?? 0} // Antag att du använder id för kategorin
              onChange={(e) => {
                const selectedId = parseInt(e.target.value, 10);
                const selectedCategory = { id: selectedId, name: "SNELA" }; // Anpassa efter dina kategorier
                setNewSong((prev) => ({
                  ...prev,
                  category: selectedCategory,
                }));
              }}
              required
            >
              <option value={1}>SNELA</option>
              {/* Lägg till fler kategorier här */}
            </select>
          </div>
          <div>
            <button type="submit">Spara</button>
            <button type="button" onClick={handleCancel}>
              Avbryt
            </button>
          </div>
        </form>
      )}

      {/* Render the song details */}
      <table>
        <thead>
          <tr>
            <th>Titel</th>
            <th>Artist</th>
            <th>Id</th>
            <th>Lyssningar</th>
            <th>Åtgärd</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => (
            <tr key={song.id}>
              <td>{song.title}</td>
              <td>{song.author}</td> {/* Ändrat från song.author till song.artist om nödvändigt */}
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
