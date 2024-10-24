import { useState, useEffect } from "react";
import { Create } from "./Create";
import { type NewsRead, NewsService } from "../../../api";

export interface NewsItem {
	title: string;
	creator: string;
	dateCreated: string;
	id: number;
}

export default function News() {
	const [news, setNews] = useState<Array<NewsRead>>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Fetch news data when the component mounts
		const fetchNews = async () => {
			try {
				const response = await NewsService.getAllNews();
				setNews(response.data || []);
			} catch (error) {
				console.error("Error fetching news:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchNews();
	}, []);

	if (loading) {
		return <p className="text-center text-gray-600">Loading...</p>;
	}

	return (
		<div className="rounded-lg bg-white p-8 shadow-md">
			<h1 className="mb-4 text-center text-2xl font-bold">
				Administrera nyheter
			</h1>
			<p className="mb-4 text-gray-700">
				Här kan du skapa nyheter & redigera existerande nyheter på hemsidan.
			</p>
			<div className="mb-6 flex gap-4">
				<button
					type="button"
					className="rounded bg-forange px-4 py-2 text-white hover:bg-blue-600"
				>
					Skapa nyhet
				</button>
				<button
					type="button"
					className="rounded bg-forange px-4 py-2 text-white hover:bg-green-600"
				>
					Redigera nyheter
				</button>
			</div>
			<h2 className="mb-4 px-3 text-xl font-semibold underline decoration-forange underline-offset-4">
				Senaste nyheter
			</h2>
			<table className="min-w-full rounded-lg border border-solid border-gray-300 bg-white">
				<thead>
					<tr className="bg-forange">
						<th className="border-b px-4 py-2 text-left">Titel</th>
						<th className="border-b px-4 py-2 text-left">Skapare</th>
						<th className="border-b px-4 py-2 text-left">Datum skapad</th>
						<th className="border-b px-4 py-2 text-left">Redigera</th>
					</tr>
				</thead>
				<tbody>
					{news.map((newsItem, index) => (
						<tr
							key={index.toString()}
							className="transition duration-150 hover:bg-gray-50"
						>
							<td className="border-b px-4 py-2">{newsItem.title_sv}</td>
							<td className="border-b px-4 py-2">{newsItem.author_id}</td>
							<td className="border-b px-4 py-2">
								{new Date(newsItem.created_at).toLocaleDateString()}
							</td>
							<td className="border-b px-4 py-2">
								<button
									type="button"
									className="rounded bg-red-600 px-2 py-1 text-white hover:bg-forange"
								>
									Redigera
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<Create />
		</div>
	);
}
