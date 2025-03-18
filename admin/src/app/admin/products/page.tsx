"use client"
import List from "@/components/customComponents/list";
import { IProduct } from "@/migrations/Migration";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

function Products() {
  const [products, setProducts] = useState<IProduct[] | null>(null);
  const router = useRouter();
  const [currentItems, setCurrentItems] = useState<IProduct[] | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[] | null>(
    null
  );

  const heading: string[] = useMemo(
    () => ["ID", "Image", "Product Name", "Category", "Sub Category", "Status"],
    []
  );

  const [indexOfFirstItem, setIndexOfFirstItem] = useState<number | null>(null);
  const [indexOfLastItem, setIndexOfLastItem] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    if (products == null) {
      (async () => {
        try {
          const response = await axios.post(
            "/api/products/all_products",
            {},
            { withCredentials: true }
          );
          setProducts(response.data.data);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          setProducts([]);
        }
      })();
    }
  }, [products]);

  useEffect(() => {
    setFilteredProducts(
      products
        ? products.filter(
            (product) =>
              product.name.toLowerCase().includes(search.toLowerCase()) ||
              product.sub_category?.name
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              product.category?.name
                .toLowerCase()
                .includes(search.toLowerCase())
          )
        : []
    );
  }, [search, products]);

  useEffect(() => {
    setIndexOfLastItem(currentPage * itemsPerPage);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    if (indexOfLastItem) setIndexOfFirstItem(indexOfLastItem - itemsPerPage);
  }, [indexOfLastItem, itemsPerPage]);

  useEffect(() => {
    if (
      filteredProducts &&
      indexOfFirstItem !== null &&
      indexOfLastItem !== null
    ) {
      setCurrentItems(
        filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
      );
    }
  }, [
    filteredProducts,
    currentPage,
    itemsPerPage,
    indexOfFirstItem,
    indexOfLastItem,
  ]);

  return (
    <div>
      {currentItems &&
      Array.isArray(currentItems) &&
      currentItems.length > 0 ? (
        <List
          heading={heading}
          listTitle="Products"
          search={search}
          setSearch={setSearch}
        >
          {indexOfFirstItem !== null &&
            currentItems.map((obj, index) => (
              <tr
                className="border-b cursor-pointer hover:bg-gray-100 transition"
                key={obj.name + Math.random()}
                onClick={() =>
                  router.push(
                    `/admin/products/detail?product_name=${obj.name}&product_id=${obj.id}`
                  )
                }
              >
                <td className="py-3 px-4">{indexOfFirstItem + index + 1}</td>
                <td className="py-3 px-4">
                  <Image
                    src={`/assets/productAssets/${obj.images?.split(",")[0]}`}
                    width={80}
                    height={100}
                    alt="Product Image"
                    className="transition-opacity rounded-md duration-200"
                  />
                </td>
                <td className="py-3 px-4">{obj.name}</td>
                <td className="py-3 px-4">{obj.category.name}</td>
                <td className="py-3 px-4">{obj.sub_category?.name}</td>
                <td className="py-3 px-4">
                  {obj.is_active ? "Online" : "Offline"}
                </td>
              </tr>
            ))}
        </List>
      ) : (
        <p className="italic">No Products...</p>
      )}
      {indexOfLastItem !== null &&
        filteredProducts &&
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
                  indexOfLastItem < filteredProducts.length ? prev + 1 : prev
                )
              }
              disabled={indexOfLastItem >= filteredProducts.length}
              className="px-3 font-semibold cursor-pointer text-sm  text-white bg-black rounded mx-1"
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}

export default Products;
