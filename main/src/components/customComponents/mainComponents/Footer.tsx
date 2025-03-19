import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-2">
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
      {/* Logo / Brand Name */}
      <div className="text-lg font-semibold">
        <Link href={'/'}>
        <Image
            src={`${process.env.NEXT_PUBLIC_API_MAIN_ASSETS_URL}/${process.env.NEXT_PUBLIC_LOGO_RBG_NAME}`}
            width={120}
            height={120}
            alt="Pickify"
        />
        </Link>
      </div>

      {/* Copyright */}
      <div className="text-sm mt-4 md:mt-0">
        © {new Date().getFullYear()} Pickify. All rights reserved.
      </div>
    </div>
  </footer>
  )
}

export default Footer