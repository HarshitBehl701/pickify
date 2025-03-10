import React from 'react'
import ProductCard from './ProductCard'

function Products({title}:{title:string}) {
  return (
    <div>
        <h1 className='bg-2 text-center  mb-6 text-3xl font-semibold text-gray-800'>{title}</h1>
        <div className="grid grid-cols-1 place-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-8">
        {Array.from({ length: 4 }).map(() => (
          <ProductCard  key={Math.random()}/>
        ))}
        </div>

    </div>
  )
}

export default Products