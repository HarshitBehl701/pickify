import React from 'react'
import ImageCard from './ImageCard'
import { ICategoryWithSubCategoryResponse } from '@/interfaces/modelInterface'

function HomeCards({title,data}:{title:string,data:ICategoryWithSubCategoryResponse['sub_categories']}) {
  return (
    <div>
        <h1 className='bg-2 capitalize text-center  mb-6 text-3xl font-semibold text-gray-800'>{title}</h1>
        <div className="grid grid-cols-1 place-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-8">
        {data.map((obj) => (
          <ImageCard link={`/products?sub_category=${obj.name}`}  key={Math.random()} image={`${process.env.NEXT_PUBLIC_API_SUB_CATEGORIES_ASSETS_URL}/${obj.image}`}  text={obj.name} />
        ))}
        </div>
        
    </div>
  )
}

export default HomeCards