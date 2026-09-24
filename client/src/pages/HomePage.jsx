import React from 'react'
import CommentData from './CommentData'
import AboutUs from '../components/AboutUs'
import Footer from './Footer'
import Navbar from '../components/Navbar'
import ReviewsPage from '../components/ReviewPage'
const HomePage = () => {
    return (
        <>
            <Navbar />
            <ReviewsPage />
            <AboutUs />
            <Footer />
        </>
    )
}

export default HomePage
