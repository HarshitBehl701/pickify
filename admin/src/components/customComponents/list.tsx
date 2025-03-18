import React from "react";

const List = ({children,heading,listTitle,search,setSearch}:{children:React.ReactNode,heading:string[],listTitle:string,search:string,setSearch:React.Dispatch<React.SetStateAction<string>>}) => {
  return (
    <div className="bg-white">
      <div className="header flex items-center justify-between flex-wrap">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 capitalize">{listTitle}</h2>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-2 border rounded-full mb-4 w-72 px-6"
      />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          {/* Table Head */}
          <thead className="bg-gray-900 text-white">
          <tr>
              {heading.map((str) =>  <th className="py-3 px-4 border-b text-left capitalize" key={str+Math.random()}>{str}</th>)}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;