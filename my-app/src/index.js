import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/App";
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';


const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

const queryClient = new QueryClient()

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</React.StrictMode>
)
