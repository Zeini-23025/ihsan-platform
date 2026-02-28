import { useEffect, useState } from "react";
import { fetchMessage } from "./service/api";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    const getMessage = async () => {
      const result = await fetchMessage();
      if (result) {
        setMessage(result);
      } else {
        setMessage("Failed to fetch message from backend.");
      }
    };

    getMessage();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Frontend App 🚀</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;