import { lazy, Suspense } from 'react'; // Added lazy and Suspense
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Authen } from './Auth';
import { StoreProvider } from './StoreContext';
import SingleProduct from './components/SingleProduct';

// Dynamically import your whole pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ReviewsWholePage = lazy(() => import('./pages/ReviewWholePage'));
const AboutUs = lazy(() => import('./pages/AboutUsPG'));
const Earn = lazy(() => import('./pages/Earn'));
const PlaceOrder = lazy(() => import('./pages/PlaceOrder'));
const Verify = lazy(() => import('./pages/Verify'));

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        {/* Wrapped Routes in Suspense with a visual fallback placeholder */}
        <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '20%' }}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reviews" element={<ReviewsWholePage />} />
            <Route path='/about' element={<AboutUs />} />
            <Route path='/earn' element={<Earn />} />
            <Route path='/account' element={<Authen />} />
            <Route path="/checkout" element={<PlaceOrder />} />
            <Route path="/verify" element={<Verify />} />

            <Route path="/product/:id" element={<SingleProduct />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </StoreProvider>
  )
}

export default App;
