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


// import { useState, useEffect } from "react";
// import "../Admin.css";
// import { Create } from "./Create";
// import { type NewsRead, NewsService } from "../../../api";

// export interface NewsItem {
//   title: string;
//   creator: string;
//   dateCreated: string;
//   id: number;
// }

// export default function News() {
//   const [news, setNews] = useState<Array<NewsRead>>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch news data when the component mounts
//     const fetchNews = async () => {
//       try {
//         const response = await NewsService.getAllNews();
//         setNews(response.data || []);
//       } catch (error) {
//         console.error("Error fetching news:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNews();
//   }, []);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   return (
//     <div className="content">
//       <h1>Administrera nyheter</h1>
//       <p>Här kan du skapa nyheter & redigera existerande nyheter på hemsidan.</p>
//       <button type="button">Skapa nyhet</button>
//       <button type="button">Redigera nyheter</button>
//       <h2>Senaste nyheter</h2>
//       <table>
//         <thead>
//           <tr>
//             <th>Titel</th>
//             <th>Skapare</th>
//             <th>Datum skapad</th>
//             <th>Redigera</th>
//           </tr>
//         </thead>
//         <tbody>
//           {news.map((newsItem, index) => (
//             <tr key={index.toString()}>
//               <td>{newsItem.title_sv}</td>
//               <td>{newsItem.author_id}</td>
//               <td>{new Date(newsItem.created_at).toLocaleDateString()}</td>
//               <td>
//                 <button type="button">Redigera</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <Create />
//     </div>
//   );
// }



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
    <div className="p-8 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Administrera nyheter</h1>
      <p className="text-gray-700 mb-6">
        Här kan du skapa nyheter & redigera existerande nyheter på hemsidan.
      </p>
      <div className="mb-6 flex gap-4">
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Skapa nyhet
        </button>
        <button
          type="button"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Redigera nyheter
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-4">Senaste nyheter</h2>
      <table className="min-w-full bg-white border border-gray-300 rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left py-2 px-4 border-b">Titel</th>
            <th className="text-left py-2 px-4 border-b">Skapare</th>
            <th className="text-left py-2 px-4 border-b">Datum skapad</th>
            <th className="text-left py-2 px-4 border-b">Redigera</th>
          </tr>
        </thead>
        <tbody>
          {news.map((newsItem, index) => (
            <tr
              key={index.toString()}
              className="hover:bg-gray-50 transition duration-150"
            >
              <td className="py-2 px-4 border-b">{newsItem.title_sv}</td>
              <td className="py-2 px-4 border-b">{newsItem.author_id}</td>
              <td className="py-2 px-4 border-b">
                {new Date(newsItem.created_at).toLocaleDateString()}
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  type="button"
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
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
