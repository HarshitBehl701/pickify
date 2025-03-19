"use client"
import Products from '@/components/customComponents/mainComponents/Products';
import { usePageContext } from '@/context/pageContext';
import { IProduct } from '@/interfaces/modelInterface';
import React, { useEffect, useState,use } from 'react';

function ProductSearch({ searchParams }: { searchParams: Promise<{ q?: string,category?:string,sub_category?:string }> }) {
    const { products } = usePageContext();
    const [filteredProducts, setFilteredProducts] = useState<IProduct[] | null>(null);
    const [filteredSimilarProducts, setFilteredSimilarProducts] = useState<IProduct[] | null>(null);
    
    const {q,category,sub_category} = use(searchParams);

    console.log(q,category,sub_category)

    useEffect(() => {
        if (!products || products.length === 0) return;

        let filtered: IProduct[] = [];

        if (q) {
            // Search by product name or description
            filtered = products.filter(product =>
                product.name.toLowerCase().includes(q.toString().toLowerCase()) ||
                product.description?.toLowerCase().includes(q.toString().toLowerCase())
            );
        } else if (category) {
            // Search by category name
            filtered = products.filter(product =>
                product.category.name.toLowerCase() === category.toString().toLowerCase()
            );
        } else if (sub_category) {
            // Search by sub-category name
            filtered = products.filter(product =>
                product.sub_category?.name.toLowerCase() === sub_category.toString().toLowerCase()
            );
        }

        setFilteredProducts(filtered.length > 0 ? filtered : null);

        if (filtered.length > 0) {
            const firstProductCategory = filtered[0].category.id;
            
            // Find similar products in the same category but not in filtered results
            const similar = products.filter(product =>
                product.category.id === firstProductCategory && !filtered.some(fp => fp.id === product.id)
            );
            setFilteredSimilarProducts(similar.length > 0 ? similar.slice(0, 5) : null);
        } else {
            setFilteredSimilarProducts(null);
        }
    }, [q, category, sub_category, products]);

    return (
        <div className="p-4 md:p-8">
            <h1 className='text-3xl font-semibold mb-4'>
                Showing Results for {`"${q ?? category ?? sub_category ?? 'Top Picks'}"`}
            </h1>

            {filteredProducts && filteredProducts.length > 0 ? (
                <Products title='' productsData={filteredProducts} />
            ) : (
                <p className="text-gray-500 mt-4">No products found.</p>
            )}

            {filteredSimilarProducts && filteredSimilarProducts.length > 0 && (
                <>
                    <h2 className='text-2xl font-semibold mt-12'>View Similar Products</h2>
                    <Products title='' productsData={filteredSimilarProducts} />
                </>
            )}
        </div>
    );
}

export default ProductSearch;