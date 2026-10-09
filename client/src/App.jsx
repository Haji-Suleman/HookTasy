import { lazy, Suspense } from 'react';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { StoreProvider } from './StoreContext';

// Dynamically import your whole pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ReviewsWholePage = lazy(() => import('./pages/ReviewWholePage'));
const AboutUs = lazy(() => import('./pages/AboutUsPG'));
const Earn = lazy(() => import('./pages/Earn'));
const PlaceOrder = lazy(() => import('./pages/PlaceOrder'));
const Verify = lazy(() => import('./pages/Verify'));
const SingleProduct = lazy(() => import('./components/SingleProduct'));
const Authen = lazy(() => import('./Auth').then((m) => ({ default: m.Authen })));

function App() {
  return (
    <>
      <StoreProvider>
        <BrowserRouter>
          <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/reviews" element={<ReviewsWholePage />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/earn" element={<Earn />} />
              <Route path="/account" element={<Authen />} />
              <Route path="/checkout" element={<PlaceOrder />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/product/:id" element={<SingleProduct />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </StoreProvider>
      <SpeedInsights />
    </>
  );
}

export default App;