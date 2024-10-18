import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import ReactDOM from "react-dom/client";
import "./index.css";
import AdminPage from "./routes/admin/Admin";
import { AuthService, client } from "./api";
import { OpenAPI } from "./api/core/OpenAPI";

client.setConfig({baseUrl: "http://127.0.0.1:8000"})

const token = await AuthService.authJwtLogin({
	body: { username: "boss@fsektionen.se", password: "dabdab" },
});
OpenAPI.interceptors.request.use((request) => {
	(request.headers as Headers).set(
		"Authorization",
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		`${token.data!.token_type} ${token.data!.access_token}`,
	);
	return request;
});

console.log("Router initialized");


const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
	},
	{
		path: "/admin/*",
		element: <AdminPage />,
	},
]);

// const router = createBrowserRouter([
// 	{
// 	  path: "/",
// 	  element: <h1>Hello World</h1>, // Replace <App /> temporarily with a simple component
// 	},
//   ]);

const rootElement = document.getElementById('root');
if (rootElement) {
	const root = ReactDOM.createRoot(rootElement);
	console.log("hej")
	root.render(<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,)
	console.log("hej")
	//root.render(<h1>Hello, World!</h1>);

}

// const rootElement = document.getElementById('root');
// if (rootElement) {
// 	const root = ReactDOM.createRoot(rootElement);
// 	console.log("hej")
// 	root.render(
// 		<RouterProvider router={router} />,)
// 	console.log("hej")
// 	//root.render(<h1>Hello, World!</h1>);

// }
// ReactDOM.createRoot(document.getElementById("root")!).render(
// 	<React.StrictMode>
// 		<RouterProvider router={router} />
// 	</React.StrictMode>,
// );

// import React from 'react';
// import ReactDOM from 'react-dom/client';

// const rootElement = document.getElementById('root');
// if (rootElement) {
//   const root = ReactDOM.createRoot(rootElement);
//   root.render(<h1>Hello, World!</h1>);
// }



// // import React from "react";
// // import { createBrowserRouter, RouterProvider } from "react-router-dom";
// // import App from "./App";
// // import ReactDOM from "react-dom/client";
// // import "./index.css";
// // import AdminPage from "./routes/admin/Admin";
// // import { AuthService, client } from "./api";
// // import { OpenAPI } from "./api/core/OpenAPI";

// // client.setConfig({ baseUrl: "http://127.0.0.1:8000" });

// // console.log("hej");

// // (async () => {
// //   try {
// //     const token = await AuthService.authJwtLogin({
// //       body: { username: "boss@fsektionen.se", password: "dabdab" },
// //     });
// //     OpenAPI.interceptors.request.use((request) => {
// //       (request.headers as Headers).set(
// //         "Authorization",
// //         `${token.data!.token_type} ${token.data!.access_token}`,
// //       );
// //       return request;
// //     });

// //     const router = createBrowserRouter([
// //       {
// //         path: "/",
// //         element: <App />,
// //       },
// //       {
// //         path: "/admin/*",
// //         element: <AdminPage />,
// //       },
// //     ]);

// //     ReactDOM.createRoot(document.getElementById("root")!).render(
// //       <React.StrictMode>
// //         <RouterProvider router={router} />
// //       </React.StrictMode>,
// //     );
// //   } catch (error) {
// //     console.error("Error during authentication:", error);
// //   }
// // })();

// // ...other imports

// // const AppRoot = () => {
// //   useEffect(() => {
// //     const authenticate = async () => {
// //       try {
// //         const token = await AuthService.authJwtLogin({
// //           body: { username: "boss@fsektionen.se", password: "dabdab" },
// //         });
// //         OpenAPI.interceptors.request.use((request) => {
// //           (request.headers as Headers).set(
// //             "Authorization",
// //             `${token.data!.token_type} ${token.data!.access_token}`,
// //           );
// //           return request;
// //         });
// //       } catch (error) {
// //         console.error("Error during authentication:", error);
// //       }
// //     };

// //     authenticate();
// //   }, []);

// //   const router = createBrowserRouter([
// //     {
// //       path: "/",
// //       element: <App />,
// //     },
// //     {
// //       path: "/admin/*",
// //       element: <AdminPage />,
// //     },
// //   ]);

// //   return (
// //     <React.StrictMode>
// //       <RouterProvider router={router} />
// //     </React.StrictMode>
// //   );
// // };

// // ReactDOM.createRoot(document.getElementById("root")!).render(<AppRoot />);


// import React from 'react';
// import ReactDOM from 'react-dom/client';

// const rootElement = document.getElementById('root');
// if (rootElement) {
//   const root = ReactDOM.createRoot(rootElement);
//   root.render(<h1>Hello, World!</h1>);
// }
