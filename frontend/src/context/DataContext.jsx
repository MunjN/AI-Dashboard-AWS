import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const DataContext = createContext(null);
export const useData = () => useContext(DataContext);

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export function DataProvider({ children }) {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const idToken = Cookies.get("idToken");

        const res = await fetch(`${API_BASE}/api/tools`, {
          headers: idToken ? { Authorization: `Bearer ${idToken}` } : {}
        });

        const data = await res.json();
        setTools(data);
        setError("");
      } catch (e) {
        setError(e.message || "Failed to load tools");
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  return (
    <DataContext.Provider value={{ tools, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}
