import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route
            path="/"
            element={<h1 className="text-3xl font-bold">Marketplace Home</h1>}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
