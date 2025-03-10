import React from "react";

const List = ({children,heading,listTitle}:{children:React.ReactNode,heading:string[],listTitle:string}) => {
  return (
    <div className="bg-white">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 capitalize">{listTitle}</h2>

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