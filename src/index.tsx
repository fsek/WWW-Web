import React, { Suspense, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import ReactDOM from "react-dom/client";
import "./index.css";
import AdminPage from "./routes/admin/Admin";
import { AuthService, client } from "./api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./i18n";

client.setConfig({ baseUrl: "http://127.0.0.1:8000" });

const token = await AuthService.authJwtLogin({
	body: { username: "boss@fsektionen.se", password: "dabdab" },
});

const myHeaders = new Headers();

myHeaders.append(
	"Authorization",
	`${token.data!.token_type} ${token.data!.access_token}`,
);

client.setConfig({ headers: myHeaders });

const queryClient = new QueryClient();

// OpenAPI.interceptors.request.use((request) => {
// 	(request.headers as Headers).set(
// 		"Authorization",
// 		// biome-ignore lint/style/noNonNullAssertion: <explanation>
// 		`${token.data!.token_type} ${token.data!.access_token}`,
// 	);
// 	return request;
// });

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

const rootElement = document.getElementById("root");
if (rootElement) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<React.StrictMode>
			<Suspense>
				<QueryClientProvider client={queryClient}>
					<RouterProvider router={router} />
				</QueryClientProvider>
			</Suspense>
		</React.StrictMode>,
	);
}
