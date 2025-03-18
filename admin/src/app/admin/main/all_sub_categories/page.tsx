'use client';
import AddSubCategory from "@/components/customComponents/AddSubCategory";
import EditSubCategory from "@/components/customComponents/EditSubCategory";
import List from "@/components/customComponents/list";
import UpdateSubCategoryImage from "@/components/customComponents/UpdateSubCategoryImage";
import {
  ICategoryWithSubCategoryResponse,
  ISubCategory,
} from "@/migrations/Migration";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";

export interface ICustomSubCategory extends ISubCategory {
  category_name: string;
}

function SubCategories() {
  const [categories, setCategories] = useState<
    ICategoryWithSubCategoryResponse[] | null
  >(null);
  const [currentItems, setCurrentItems] = useState<ICustomSubCategory[] | null>(
    null
  );
  const [filteredSubCategories, setFilteredSubCategories] = useState<
    ICustomSubCategory[] | null
  >(null);

  const heading: string[] = useMemo(
    () => ["ID", "Name", "Category", "Image", "Status", "Action"],
    []
  );

  const [indexOfFirstItem, setIndexOfFirstItem] = useState<number | null>(null);
  const [indexOfLastItem, setIndexOfLastItem] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    if (categories == null) {
      (async () => {
        try {
          const response = await axios.post(
            "/api/main/all_category_subcategory",
            {},
            { withCredentials: true }
          );
          setCategories(response.data.data);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          setCategories([]);
        }
      })();
    }
  }, [categories]);

  useEffect(() => {
    const filteredProducts: ICustomSubCategory[] = [];
    if (categories) {
      categories.forEach((category) => {
        const filteredArr: ISubCategory[] = category.sub_categories.filter(
          (sub_category) =>
            sub_category.name.toLowerCase().includes(search.toLowerCase())
        );
        filteredProducts.push(
          ...filteredArr.map((arr) => ({
            ...arr,
            category_name: category.name,
          }))
        );
      });
    }
    setFilteredSubCategories(filteredProducts);
  }, [search, categories]);

  useEffect(() => {
    setIndexOfLastItem(currentPage * itemsPerPage);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (indexOfLastItem) setIndexOfFirstItem(indexOfLastItem - itemsPerPage);
  }, [indexOfLastItem, itemsPerPage]);

  useEffect(() => {
    if (
      filteredSubCategories &&
      indexOfFirstItem !== null &&
      indexOfLastItem !== null
    ) {
      setCurrentItems(
        filteredSubCategories.slice(indexOfFirstItem, indexOfLastItem)
      );
    }
  }, [
    filteredSubCategories,
    currentPage,
    itemsPerPage,
    indexOfFirstItem,
    indexOfLastItem,
  ]);

  return (
    <div>
      {categories  &&  <AddSubCategory categories={categories} />}
      {currentItems &&
      Array.isArray(currentItems) &&
      currentItems.length > 0 ? (
        <List
          heading={heading}
          listTitle="Sub Categories"
          search={search}
          setSearch={setSearch}
        >
          {indexOfFirstItem !== null &&
            currentItems.map((category, index) => (
              <tr
                className="border-b cursor-pointer hover:bg-gray-100 transition"
                key={index}
              >
                <td className="py-3 px-4">{indexOfFirstItem + index + 1}</td>
                <td className="py-3 px-4">
                  <UpdateSubCategoryImage sub_category={category} />
                </td>
                <td className="py-3 px-4">{category.name}</td>
                <td className="py-3 px-4">{category.category_name}</td>
                <td className="py-3 px-4">
                  {category.is_active ? "Online" : "Offline"}
                </td>
                <td className="py-3 px-4">
                  <EditSubCategory subCategory={category} />
                </td>
              </tr>
            ))}
        </List>
      ) : (
        <p className="italic">No Sub Categories...</p>
      )}
      {indexOfLastItem !== null &&
        filteredSubCategories &&
        currentItems &&
        currentItems.length > 0 && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 cursor-pointer hover:underline text-sm rounded mx-1"
            >
              Prev
            </button>
            <span className="px-4 py-2">{currentPage}</span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  indexOfLastItem < filteredSubCategories.length
                    ? prev + 1
                    : prev
                )
              }
              disabled={indexOfLastItem >= filteredSubCategories.length}
              className="px-3 font-semibold cursor-pointer text-sm  text-white bg-black rounded mx-1"
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}

export default SubCategories;
