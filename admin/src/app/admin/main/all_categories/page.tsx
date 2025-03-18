'use client';
import AddCategory from "@/components/customComponents/AddCategory";
import EditCategory from "@/components/customComponents/EditCategory";
import List from "@/components/customComponents/list";
import UpdateCategoryImage from "@/components/customComponents/UpdateCategoryImage";
import {
  ICategory,
  ICategoryWithSubCategoryResponse,
} from "@/migrations/Migration";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";

function Categories() {
  const [categories, setCategories] = useState<
    ICategoryWithSubCategoryResponse[] | null
  >(null);
  const [currentItems, setCurrentItems] = useState<ICategory[] | null>(null);
  const [filteredCategories, setFilteredCategories] = useState<
    ICategory[] | null
  >(null);

  const heading: string[] = useMemo(
    () => ["ID", "Image", "Name", "Status", "Action"],
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
    setFilteredCategories(
      categories
        ? categories.filter((category) =>
            category.name.toLowerCase().includes(search.toLowerCase())
          )
        : []
    );
  }, [search, categories]);

  useEffect(() => {
    setIndexOfLastItem(currentPage * itemsPerPage);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (indexOfLastItem) setIndexOfFirstItem(indexOfLastItem - itemsPerPage);
  }, [indexOfLastItem, itemsPerPage]);

  useEffect(() => {
    if (
      filteredCategories &&
      indexOfFirstItem !== null &&
      indexOfLastItem !== null
    ) {
      setCurrentItems(
        filteredCategories.slice(indexOfFirstItem, indexOfLastItem)
      );
    }
  }, [
    filteredCategories,
    currentPage,
    itemsPerPage,
    indexOfFirstItem,
    indexOfLastItem,
  ]);
  return (
    <div>
      <AddCategory  />
      {currentItems &&
      Array.isArray(currentItems) &&
      currentItems.length > 0 ? (
        <List
          heading={heading}
          listTitle="Categories"
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
                  <UpdateCategoryImage category={category} />
                </td>
                <td className="py-3 px-4">{category.name}</td>
                <td className="py-3 px-4">
                  {category.is_active ? "Online" : "Offline"}
                </td>
                <td className="py-3 px-4">
                  <EditCategory category={category} />
                </td>
              </tr>
            ))}
        </List>
      ) : (
        <p className="italic">No Categories...</p>
      )}
      {indexOfLastItem !== null &&
        filteredCategories &&
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
                  indexOfLastItem < filteredCategories.length ? prev + 1 : prev
                )
              }
              disabled={indexOfLastItem >= filteredCategories.length}
              className="px-3 font-semibold cursor-pointer text-sm  text-white bg-black rounded mx-1"
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}

export default Categories;
