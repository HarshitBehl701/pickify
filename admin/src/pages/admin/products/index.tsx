import List from "@/components/customComponents/list";
import React from "react";

const heading: string[] = ["ID", "Product Name", "Category","Sub Category", "Status"];
const sampleData: { name: string; category: string;subCategory: string; status: string }[] = [
    {
        name:'Mobile',
        category:"Mobile",
        subCategory:"Mobile",
        status:"Active"
    },
    {
        name:'Mobile',
        category:"Mobile",
        subCategory:"Mobile",
        status:"Active"
    },
    {
        name:'Mobile',
        category:"Mobile",
        subCategory:"Mobile",
        status:"Active"
    },
    {
        name:'Mobile',
        category:"Mobile",
        subCategory:"Mobile",
        status:"Active"
    },
];

function Products() {
  return (
    <div>
      <List heading={heading} listTitle="Products">
        {sampleData.map((obj, index) => (
          <tr
            className="border-b hover:bg-gray-100 transition"
            key={obj.name + Math.random()}
          >
            <td className="py-3 px-4">{index + 1}</td>
            <td className="py-3 px-4">{obj.name}</td>
            <td className="py-3 px-4">{obj.category}</td>
            <td className="py-3 px-4">{obj.subCategory}</td>
            <td className="py-3 px-4">{obj.status}</td>
          </tr>
        ))}
      </List>
    </div>
  );
}

export default Products ;