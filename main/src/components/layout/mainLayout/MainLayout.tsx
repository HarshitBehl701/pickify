import Footer from '@/components/customComponents/mainComponents/Footer'
import Navbar from '@/components/customComponents/mainComponents/Navbar'
import React, { ReactNode } from 'react'

function MainLayout({children}:{children:ReactNode}) {
  return (
    <div>
        <Navbar />
        <div className="main w-[95%] mx-auto py-10 min-h-[90dvh] w-container">
        {children}
        </div>
        <Footer />
    </div>
  )
}

export default MainLayout