import React from 'react'
import ProductCard from './ProductCard'
import { IProduct } from '@/interfaces/modelInterface'

function Products({title,productsData}:{title:string,productsData:IProduct[] | IProduct}) {
  return (
    <div>
        <h1 className='bg-2 text-center  mb-6 text-3xl font-semibold text-gray-800'>{title}</h1>
        <div className="grid grid-cols-1 place-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-8">
        {Array.isArray(productsData) && productsData.map((product) => (
          <ProductCard  key={Math.random()} data={product}/>
        ))}
        {!Array.isArray(productsData) &&  productsData &&  <ProductCard  key={Math.random()} data={productsData}/>}
        </div>

    </div>
  )
}

export default Products