import Products from '@/components/customComponents/mainComponents/Products';
import { useRouter } from 'next/router';
import React from 'react'

function ProductSearch() {
    const router = useRouter();
    const { q,category } = router.query; // Get query parameter (?q=...)
  return (
    <div>
        <h1 className='text-3xl font-semibold'>Showing  Results for {`"${q ?? category ?? ''}"`}...</h1>        
        <Products title='' />
        <Products title='' />
        <h2 className='text-3xl  font-semibold mt-16'>View  Similar  Products</h2>
        <Products title='' />
        <Products title='' />
    </div>
  )
}

export default ProductSearch