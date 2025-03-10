import React from 'react'
import Categories from '@/components/customComponents/mainComponents/Categories'
import HomeHeader from '@/components/customComponents/mainComponents/HomeHeader'
import HomeCards from '@/components/customComponents/mainComponents/HomeCards'
import Products from '@/components/customComponents/mainComponents/Products'

function Index() {
  return (
    <>
    <HomeHeader />
    <br />
    <Categories  />
    <br /><br />
    <HomeCards title='top categories' />
    <br /><br />
    <HomeCards title='top picks' />
    <br /><br />
    <Products title='Explore' />
    </>
  )
}

export default Index