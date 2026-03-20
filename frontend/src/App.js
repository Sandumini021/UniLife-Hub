import React, { useState } from "react";
import Dashboard1 from "./components/Dashboard1";
import DashboardHome from "./components/DashboardHome";

function App() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <Dashboard1 onGetStarted={() => setStarted(true)} />;
  }

  return <DashboardHome />;
}

export default App;



