'use client';
import Products from '@/components/customComponents/mainComponents/Products'
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { usePageContext } from '@/context/pageContext';
import { useUserContext } from '@/context/userContext'
import { IProduct } from '@/interfaces/modelInterface';
import React, { useEffect, useState } from 'react'

function Cart() {
  const {userCart} =  useUserContext();
  const {products} = usePageContext();
  const  [userCartData,setUserCartData] = useState<IProduct[] | null>(null);
  useEffect(() =>{
    if(userCart)
      setUserCartData(userCart.map((cart) => cart.product_id));
  },[userCart])
  return (
    <div>
        <h1 className='text-2xl  mb-6 font-semibold'>User Cart</h1>
        {userCartData &&  Array.isArray(userCartData) &&  userCartData.length  >  0 &&  <Products title=''  productsData={userCartData} />}
        {(!userCart || (Array.isArray(userCart) &&  userCart.length  === 0)) &&  <p  className='italic'>No Product in Cart...</p>}
        <br /><br />
        <h2  className='text-2xl font-semibold mb-4'>Explore  Products</h2>
        {products && Array.isArray(products) && products.length >   0 &&  <Products  title='' productsData={products} />}
        {!products &&  <div className="grid grid-cols-1 place-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-8">
        {Array.from({length:4}).map(() => <ProductCardSkeleton key={Math.random()} />)}  
        </div>}
    </div>
  )
}

export default Cart