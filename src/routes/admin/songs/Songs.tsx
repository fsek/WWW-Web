import React, { useEffect, useState } from "react";
import "../Admin.css";
import {
	SongCreate,
	SongsGetAllSongsResponse,
	SongsService,
} from "../../../api"; // Adjust your import path as needed

// Main Songs Component
export default function Songs() {
	const [songs, setSongs] = useState<SongsGetAllSongsResponse>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showAddForm, setShowAddForm] = useState(false);
	const [showUpdateForm, setShowUpdateForm] = useState(false);
	const [newSong, setNewSong] = useState<SongCreate>({
		title: "",
		author: "",
		melody: "",
		content: "",
		category: { id: 1, name: "SNELA" },
	});

	useEffect(() => {
		const fetchSongs = async () => {
			try {
				const response = await SongsService.getAllSongs();
				const fetchedSongs = response.data ?? [];
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
		setShowAddForm(!showAddForm);
	};
	
	const handleUpdateButtonClick = () => {
		setShowUpdateForm(!showUpdateForm)
	};

	const handleFormChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setNewSong((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await SongsService.createSong({ body: newSong });
			if (response.data) {
				setSongs((prevSongs) => [...prevSongs, response.data]);
				setShowAddForm(false);
				setNewSong({
					title: "",
					author: "",
					melody: "",
					content: "",
					category: { id: 1, name: "SNELA" },
				});
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
			category: { id: 1, name: "SNELA" },
		});
	};

	// Conditional rendering based on the loading, error, and data state
	if (loading) return <p>Loading...</p>;
	if (error) return <p>{error}</p>;

	if (showAddForm) {
		return (
			<div className="rounded-lg bg-white p-8 shadow-md">
				<h3 className="mb-4 text-xl font-bold">Lägg till ny låt</h3>
				<form onSubmit={handleFormSubmit} className="add-song-form">
					<div className="mb-3 flex items-center">
						<label htmlFor="title" className="w-1/4 pr-2">
							Titel:
						</label>
						<input
							type="text"
							id="title"
							name="title"
							value={newSong.title}
							onChange={handleFormChange}
							required
							className="w-3/4 rounded border border-gray-300 px-3 py-2"
						/>
					</div>
					<div className="mb-3 flex items-center">
						<label htmlFor="author" className="w-1/4 pr-2">
							Artist:
						</label>
						<input
							type="text"
							id="author"
							name="author"
							value={newSong.author ?? ""}
							onChange={handleFormChange}
							required
							className="w-3/4 rounded border border-gray-300 px-3 py-2"
						/>
					</div>
					<div className="mb-3 flex items-center">
						<label htmlFor="melody" className="w-1/4 pr-2">
							Melodi:
						</label>
						<input
							type="text"
							id="melody"
							name="melody"
							value={newSong.melody ?? ""}
							onChange={handleFormChange}
							required
							className="w-3/4 rounded border border-gray-300 px-3 py-2"
						/>
					</div>
					<div className="mb-3 flex items-center">
						<label htmlFor="content" className="w-1/4 pr-2">
							Innehåll:
						</label>
						<input
							type="text"
							id="content"
							name="content"
							value={newSong.content}
							onChange={handleFormChange}
							required
							className="w-3/4 rounded border border-gray-300 px-3 py-2"
						/>
					</div>
					<div className="mb-3 flex items-center">
						<label htmlFor="category" className="w-1/4 pr-2">
							Kategori:
						</label>
						<select
							id="category"
							name="category"
							value={newSong.category.id ?? 0}
							onChange={(e) => {
								const selectedId = parseInt(e.target.value, 10);
								const selectedCategory = { id: selectedId, name: "SNELA" };
								setNewSong((prev) => ({
									...prev,
									category: selectedCategory,
								}));
							}}
							required
							className="w-3/4 rounded border border-gray-300 px-3 py-2"
						>
							<option value={1}>SNELA</option>
							{/* Add more categories here */}
						</select>
					</div>
					<div className="mt-3 flex justify-end">
						<button
							type="submit"
							className="mr-2 rounded bg-blue-500 px-4 py-2 text-white"
						>
							Spara
						</button>
						<button
							type="button"
							onClick={handleCancel}
							className="rounded bg-red-500 px-4 py-2 text-white"
						>
							Avbryt
						</button>
					</div>
				</form>
			</div>
		);
	}

	if (showUpdateForm) {
		return (
			<div className="rounded-lg bg-white p-8 shadow-md">
				<h3 className="mb-4 text-xl font-bold">Updatera låt</h3>
				<form onSubmit={handleFormSubmit} className="add-song-form">
					<div className="mb-3 flex items-center">
						<label htmlFor="title" className="w-1/4 pr-2">
							Titel:
						</label>
						<input
							type="text"
							id="title"
							name="title"
							value={newSong.title}
							onChange={handleFormChange}
							required
							className="w-3/4 rounded border border-gray-300 px-3 py-2"
						/>
					</div>
					<div className="mb-3 flex items-center">
						<label htmlFor="author" className="w-1/4 pr-2">
							Artist:
						</label>
						<input
							type="text"
							id="author"
							name="author"
							value={newSong.author ?? ""}
							onChange={handleFormChange}
							required
							className="w-3/4 rounded border border-gray-300 px-3 py-2"
						/>
					</div>
					<div className="mb-3 flex items-center">
						<label htmlFor="melody" className="w-1/4 pr-2">
							Melodi:
						</label>
						<input
							type="text"
							id="melody"
							name="melody"
							value={newSong.melody ?? ""}
							onChange={handleFormChange}
							required
							className="w-3/4 rounded border border-gray-300 px-3 py-2"
						/>
					</div>
					<div className="mb-3 flex items-center">
						<label htmlFor="content" className="w-1/4 pr-2">
							Innehåll:
						</label>
						<input
							type="text"
							id="content"
							name="content"
							value={newSong.content}
							onChange={handleFormChange}
							required
							className="w-3/4 rounded border border-gray-300 px-3 py-2"
						/>
					</div>
					<div className="mb-3 flex items-center">
						<label htmlFor="category" className="w-1/4 pr-2">
							Kategori:
						</label>
						<select
							id="category"
							name="category"
							value={newSong.category.id ?? 0}
							onChange={(e) => {
								const selectedId = parseInt(e.target.value, 10);
								const selectedCategory = { id: selectedId, name: "SNELA" };
								setNewSong((prev) => ({
									...prev,
									category: selectedCategory,
								}));
							}}
							required
							className="w-3/4 rounded border border-gray-300 px-3 py-2"
						>
							<option value={1}>SNELA</option>
							{/* Add more categories here */}
						</select>
					</div>
					<div className="mt-3 flex justify-end">
						<button
							type="submit"
							className="mr-2 rounded bg-blue-500 px-4 py-2 text-white"
						>
							Spara
						</button>
						<button
							type="button"
							onClick={handleCancel}
							className="rounded bg-red-500 px-4 py-2 text-white"
						>
							Avbryt
						</button>
					</div>
				</form>
			</div>
		);
	}

	return (
		<div className="rounded-lg bg-white p-8 shadow-md">
			<h1 className="mb-4 text-center text-2xl font-bold">
				Administrera sånger
			</h1>
			<p className="mb-4 text-gray-700">
				Här kan du skapa nyheter & redigera existerande sånger på hemsidan.
			</p>

			<div className="mb-6 flex gap-4">
				<button
					type="button"
					className="rounded bg-forange px-4 py-2 text-white hover:bg-forange"
					onClick={handleAddButtonClick}
				>
					Lägg till sång
				</button>
				<button
					type="button"
					className="rounded bg-forange px-4 py-2 text-white hover:bg-blue-600"
				>
					Uppdatera sång
				</button>
			</div>

			<h2 className="mb-4 px-3 text-xl font-semibold underline decoration-forange underline-offset-4">
				Sånginformation
			</h2>
			<table className="min-w-full rounded-lg border border-solid border-gray-300 bg-white">
				<thead>
					<tr className="bg-forange">
						<th className="ext-left border-b px-4 py-2">Titel</th>
						<th className="ext-left border-b px-4 py-2">Artist</th>
						<th className="ext-left border-b px-4 py-2">Id</th>
						<th className="ext-left border-b px-4 py-2">Lyssningar</th>
						<th className="ext-left border-b px-4 py-2">Åtgärd</th>
					</tr>
				</thead>
				<tbody>
					{songs.map((song) => (
						<tr
							className="transition duration-150 hover:bg-gray-50"
							key={song.id}
						>
							<td className="border-b px-4 py-2">{song.title}</td>
							<td className="border-b px-4 py-2">{song.author}</td>
							<td className="border-b px-4 py-2">{song.id}</td>
							<td className="border-b px-4 py-2">{song.views}</td>
							<td className="border-b px-4 py-2">
								<button
									type="button"
									className="rounded bg-red-600 px-2 py-1 text-white hover:bg-forange"
									onClick={handleUpdateButtonClick}
								>
									Redigera
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
