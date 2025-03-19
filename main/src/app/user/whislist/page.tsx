'use client';
import Products from '@/components/customComponents/mainComponents/Products'
import { usePageContext } from '@/context/pageContext';
import { useUserContext } from '@/context/userContext'
import { IProduct } from '@/interfaces/modelInterface';
import React, { useEffect, useState } from 'react'

function Whislist() {
  const {userWhislist} =  useUserContext();
  const {products} = usePageContext();
  const  [whislistProducts,setWhislistProducts] = useState<IProduct[] |  null>(null);
  

  useEffect(() => {
    if(userWhislist)
      setWhislistProducts(userWhislist?.map((data) => data.product_id));
  },[userWhislist]);  
  return (
    <div>
        <h1 className='text-2xl  mb-6 font-semibold'>User Whislist</h1>
        {whislistProducts &&  Array.isArray(whislistProducts) &&  whislistProducts.length  >  0 && <Products title=''  productsData={whislistProducts}/> }
        {(!userWhislist || (Array.isArray(userWhislist) &&  userWhislist.length  === 0)) &&  <p  className='italic'>Whislist is empty...</p>}
        <br /><br />
        {products   &&  <h2  className='text-2xl font-semibold'>Explore  Products</h2>}
        {products  &&  <Products  title='' productsData={products} />}
    </div>
  )
}

export default Whislist