// App.js
import React, { useEffect } from "react";
import HomePage from "./components/Homepage";
import SocketService from "./SocketService";

function App() {
  useEffect(() => {
    SocketService.connect();
    return () => SocketService.disconnect();
  }, []);

  return (
    <div>
      <HomePage />
    </div>
  );
}

export default App;
