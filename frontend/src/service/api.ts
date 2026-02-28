const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const fetchMessage = async () => {
  try {
    const response = await fetch(`${API_URL}/`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error("API fetch error:", error);
    return null;
  }
};