import AboutUs from './pages/AboutUsPG';
import Earn from './pages/Earn';
import HomePage from './pages/HomePage';
import ReviewsWholePage from './pages/ReviewWholePage';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Authen } from './Auth';
import { StoreProvider } from './StoreContext';
import PlaceOrder from './pages/PlaceOrder';
function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reviews" element={< ReviewsWholePage />} />
          <Route path='/about' element={<AboutUs />} />
          <Route path='/earn' element={<Earn />} />
          <Route path='/account' element={<Authen />} />
          <Route path="/checkout" element={<PlaceOrder />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>

  )
}

export default App
