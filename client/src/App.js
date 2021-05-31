import React from "react";
import Layout from "views";
import { BrowserRouter as Router } from "react-router-dom"

function App() {
  return (
    <Router>
      <div className="App">
        <Layout />
      </div>
    </Router>
  );
}

export default App;
