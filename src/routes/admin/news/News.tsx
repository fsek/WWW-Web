// import "../Admin.css";
// import { Create } from "./Create";
// import { type NewsRead, NewsService } from "../../../api";

// // biome-ignore lint/style/noNonNullAssertion: <explanation>
// const news: Array<NewsRead> = await NewsService.getAllNews().then((val) => val.data!);
// //const news: NewsItem[] = [{title: "Ny app", creator: "Cajsa", dateCreated: "32/3-2025"}]
// export interface NewsItem {
// 	title: string;
// 	creator: string;
// 	dateCreated: string;
// 	id: number;
// }

// export default function News() {
// 	return (
// 		<div className="content">
// 			<h1>Administrera nyheter</h1>
// 			<p>
// 				Här kan du skapa nyheter & redigera existerande nyheter på hemsidan.
// 			</p>
// 			<button type="button">Skapa nyhet</button>
// 			<button type="button">Redigera nyheter</button>
// 			<h2>Senaste nyheter</h2>
// 			<table>
// 				<tr>
// 					<th>Titel</th>
// 					<th>Skapare</th>
// 					<th>Datum skapad</th>
// 					<th>Redigera</th>
// 				</tr>
// 				{news.map((news, index) => {
// 					return (
// 						<tr key={index.toString()}>
// 							<td>{news.title_sv}</td>
// 							<td>{news.author_id}</td>
// 							<td>{news.created_at.toISOString()}</td>
// 							<td>
// 								<button type="button">Redigera</button>
// 							</td>
// 						</tr>
// 					);
// 				})}
// 			</table>
// 			<Create />
// 		</div>
// 	);
// }
import { useState, useEffect } from "react";
import "../Admin.css";
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
    return <p>Loading...</p>;
  }

  return (
    <div className="content">
      <h1>Administrera nyheter</h1>
      <p>Här kan du skapa nyheter & redigera existerande nyheter på hemsidan.</p>
      <button type="button">Skapa nyhet</button>
      <button type="button">Redigera nyheter</button>
      <h2>Senaste nyheter</h2>
      <table>
        <thead>
          <tr>
            <th>Titel</th>
            <th>Skapare</th>
            <th>Datum skapad</th>
            <th>Redigera</th>
          </tr>
        </thead>
        <tbody>
          {news.map((newsItem, index) => (
            <tr key={index.toString()}>
              <td>{newsItem.title_sv}</td>
              <td>{newsItem.author_id}</td>
              <td>{new Date(newsItem.created_at).toLocaleDateString()}</td>
              <td>
                <button type="button">Redigera</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Create />
    </div>
  );
}
