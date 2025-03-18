"use client"; // ✅ Ensure this is at the top

import {
  ICategoryWithSubCategoryResponse,
  IProduct,
} from "@/interfaces/modelInterface";
import React, { createContext, ReactNode, useContext } from "react";

export const PageContext = createContext<IPageContext | null>(null);

export const PageContextProvider = ({ children,products,setProducts,category_subCategory,setCategory_subCategory }:IPageContextProvider) => {
  return (
    <PageContext.Provider
      value={{
        products,
        setProducts,
        category_subCategory,
        setCategory_subCategory,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error(
      "PageContext is not found. Wrap your components with PageContextProvider."
    );
  }
  return context;
};

interface IPageContext {
  products: IProduct[] | null;
  setProducts: React.Dispatch<React.SetStateAction<IProduct[] | null>>;
  category_subCategory: ICategoryWithSubCategoryResponse[] | null;
  setCategory_subCategory: React.Dispatch<
    React.SetStateAction<ICategoryWithSubCategoryResponse[] | null>
  >;
}

interface   IPageContextProvider extends  IPageContext{
    children:ReactNode;
}