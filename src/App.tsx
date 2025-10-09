import { Navigate, Routes, Route, NavLink } from "react-router-dom";
import HomePage from "./features/home/HomePage";
import QuoteWizardPage from "./features/quote/QuoteWizardPage";
import ClientsPage from "./features/clients/ClientsPage";
import PdfViewerPage from "./pdf/PdfViewerPage";
import Shell from "./ui/Shell";
import NotFoundPage from "./features/clients/NotFoundPage";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quote" element={<QuoteWizardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/pdf/:number" element={<PdfViewerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Shell>
  );
}
