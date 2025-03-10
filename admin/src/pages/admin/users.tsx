import List from "@/components/customComponents/list";
import React from "react";

const heading: string[] = ["ID", "Name", "Email", "Role"];
const sampleData: { name: string; email: string; status: string }[] = [
    {
        name:'John',
        email:"john@gmail.com",
        status:"Active"
    },
    {
        name:'John',
        email:"john@gmail.com",
        status:"Active"
    }
];

function users() {
  return (
    <div>
      <List heading={heading} listTitle="Users">
        {sampleData.map((obj, index) => (
          <tr
            className="border-b hover:bg-gray-100 transition"
            key={obj.name + Math.random()}
          >
            <td className="py-3 px-4">{index + 1}</td>
            <td className="py-3 px-4">{obj.name}</td>
            <td className="py-3 px-4">{obj.email}</td>
            <td className="py-3 px-4">{obj.status}</td>
          </tr>
        ))}
      </List>
    </div>
  );
}

export default users;
