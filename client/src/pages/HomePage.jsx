import React from 'react'
import CommentData from './CommentData'
import AboutUs from '../components/AboutUs'
import Footer from './Footer'
import Navbar from '../components/Navbar'
import ReviewsPage from '../components/ReviewPage'
import PromoBar from '../components/PromoBar'
import NewestCollection from "../components/NewestCollection"
const HomePage = () => {
    return (
        <>
            <PromoBar />
            <Navbar />
            <NewestCollection />
            <ReviewsPage />
            <AboutUs />
            <Footer />
        </>
    )
}

export default HomePage
