import Products from '@/components/customComponents/mainComponents/Products'
import React from 'react'

function Cart() {
  return (
    <div>
        <h1 className='text-2xl font-semibold'>User Cart</h1>
        <Products title=''/>
        <br /><br />
        <h2  className='text-2xl font-semibold'>View Similar Products</h2>
        <Products  title='' />
    </div>
  )
}

export default Cart