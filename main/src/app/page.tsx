'use client';
import React, { useEffect, useState } from 'react'
import Categories from '@/components/customComponents/mainComponents/Categories'
import HomeHeader from '@/components/customComponents/mainComponents/HomeHeader'
import HomeCards from '@/components/customComponents/mainComponents/HomeCards'
import Products from '@/components/customComponents/mainComponents/Products'
import { ICategoryWithSubCategoryResponse } from '@/interfaces/modelInterface'
import { usePageContext } from '@/context/pageContext';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import ImageCardSkeleton from '@/components/skeletons/ImageCardSkeleton';

function Index() {
  const {products,category_subCategory} = usePageContext();
  const  [filterTopCategories,setFilterTopCategories] = useState<ICategoryWithSubCategoryResponse['sub_categories']|null>(null);
  useEffect(() =>{
    if(filterTopCategories ===  null && category_subCategory)
    {
      category_subCategory.forEach((data) =>  {
        setFilterTopCategories((prev) =>  [
          ...(prev  || []),
          ...(data.sub_categories.slice(0,4))
        ]);
      })
    }
  },[filterTopCategories,category_subCategory]);
  return (
    <>
    <HomeHeader />
    <br />
    <Categories  />
    <br /><br />
    {filterTopCategories && <HomeCards title='top categories' data={filterTopCategories.slice(0,4)} />}
    <br /><br />
    {filterTopCategories && <HomeCards title='top picks' data={filterTopCategories.slice(5,9)} />}
    {!filterTopCategories && <div className="grid grid-cols-1 place-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-8" key={Math.random()}>
    {Array.from({length:4}).map(() => <ImageCardSkeleton key={Math.random()} />)}  
    </div>}
    <br /><br />
    {products && <Products title='Explore' productsData={products} />}
    {!products && <div className="grid grid-cols-1 place-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-8" key={Math.random()}>
    {Array.from({length:4}).map(() => <ProductCardSkeleton key={Math.random()} />)}  
    </div>}
    </>
  )
}

export default Index