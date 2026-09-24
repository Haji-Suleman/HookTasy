import HomePage from './pages/HomePage';
import ReviewsPage from './pages/ReviewPage'
import { Routes, Route, BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
