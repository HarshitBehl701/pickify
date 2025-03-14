import Products from '@/components/customComponents/mainComponents/Products'
import { usePageContext } from '@/context/pageContext';
import { useUserContext } from '@/context/userContext'
import React from 'react'

function Cart() {
  const {userCart} =  useUserContext();
  const {products} = usePageContext();
  return (
    <div>
        <h1 className='text-2xl  mb-6 font-semibold'>User Cart</h1>
        {userCart &&  userCart.length  >  0 && userCart.map((cart) => <Products title=''  productsData={cart.product_id} key={cart.id} />)}
        {(!userCart || (Array.isArray(userCart) &&  userCart.length  === 0)) &&  <p  className='italic'>No Product in Cart...</p>}
        <br /><br />
        {products   &&  <h2  className='text-2xl font-semibold'>Explore  Products</h2>}
        {products  &&  <Products  title='' productsData={products} />}
    </div>
  )
}

export default Cart