'use client';
import React, { useEffect, useState } from 'react'
import Categories from '@/components/customComponents/mainComponents/Categories'
import HomeHeader from '@/components/customComponents/mainComponents/HomeHeader'
import HomeCards from '@/components/customComponents/mainComponents/HomeCards'
import Products from '@/components/customComponents/mainComponents/Products'
import { ICategoryWithSubCategoryResponse } from '@/interfaces/modelInterface'
import { usePageContext } from '@/context/pageContext';

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
    <br /><br />
    {products && <Products title='Explore' productsData={products} />}
    </>
  )
}

export default Index