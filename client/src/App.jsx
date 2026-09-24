import AboutUs from './pages/AboutUsPG';
import Earn from './pages/Earn';
import HomePage from './pages/HomePage';
import ReviewsWholePage from './pages/ReviewWholePage';
import { Routes, Route, BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reviews" element={< ReviewsWholePage />} />
        <Route path='/about' element={<AboutUs />} />
        <Route path='/earn' element={<Earn />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
