'use client';
import { usePageContext } from "@/context/pageContext";
import { cn } from "@/utils/cn";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

function SearchComponents({ className }: { className?: string }) {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [suggestions, setSuggestions] = useState<{ type: "product" | "category" | "sub_category"; name: string; id: number }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    
    const { products, category_subCategory } = usePageContext();

    useEffect(() => {
        if(products &&  category_subCategory)
        {
          if (!searchQuery.trim()) {
            // Show 5 random products when search is empty
            setSuggestions(
                products
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 5)
                    .map((product) => ({ type: "product", name: product.name, id: product.id }))
            );
            return;
        }

        const filteredSuggestions: { type: "product" | "category" | "sub_category"; name: string; id: number }[] = [];

        // Searching in Products
        products.forEach((product) => {
            if (product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                filteredSuggestions.push({ type: "product", name: product.name, id: product.id });
            }
        });

        // Searching in Categories
        category_subCategory.forEach((category) => {
            if (category.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                filteredSuggestions.push({ type: "category", name: category.name, id: category.id });
            }
            
            // Searching in Sub-Categories
            category.sub_categories.forEach((sub) => {
                if (sub.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                    filteredSuggestions.push({ type: "sub_category", name: sub.name, id: sub.id });
                }
            });
        });

        setSuggestions(filteredSuggestions);
        }
    }, [searchQuery, products, category_subCategory]);

    const handleSearch = () => {
        if (searchQuery.trim() !== "") {
            window.location.href = `/products?q=${searchQuery}`;
        }
    };

    return (
        <div className="relative w-full sm:w-[40%]">
            <div className={cn("flex bg-white rounded-lg overflow-hidden border border-gray-300", className ?? '')}>
                <input
                    type="text"
                    className="p-2 text-black w-full outline-none"
                    placeholder="Search for products, categories..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                />
                <button onClick={handleSearch} className="bg-[#FF4F79] p-3 flex items-center justify-center">
                    <Search className="text-white" size={20} />
                </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white shadow-md border border-gray-200 rounded-lg mt-2 max-h-60 overflow-y-auto z-50">
                    {suggestions.map((item, index) => (
                        <div
                            key={index}
                            className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between"
                            onClick={() => window.location.href = 
                                item.type === "product" ? `/products?q=${item.name}` :
                                item.type === "category" ? `/products?category=${item.name}` :
                                `/products?sub_category=${item.name}`
                            }
                        >
                            <span className="text-black">{item.name}</span>
                            <span className="text-sm text-gray-400">
                                {item.type === "product" ? "Product" : item.type === "category" ? "Category" : "Sub-Category"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchComponents;