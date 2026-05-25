import { Outlet } from "react-router-dom";
import { Header } from "./components/Header";
import { SelectionToolbar } from "./components/SelectionToolbar";
import { SelectionProvider } from "./lib/selection";

export default function App() {
  return (
    <SelectionProvider>
      <div className="app-shell">
        <Header />
        <main className="page-wrap">
          <Outlet />
        </main>
        <SelectionToolbar />
      </div>
    </SelectionProvider>
  );
}
