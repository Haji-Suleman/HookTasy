import React from 'react'
import CommentData from './CommentData'
import AboutUs from '../components/AboutUs'
import Footer from './Footer'
import Navbar from '../components/Navbar'
const HomePage = () => {
    return (
        <>
            <Navbar />
            <CommentData />
            <AboutUs />
            <Footer />
        </>
    )
}

export default HomePage
