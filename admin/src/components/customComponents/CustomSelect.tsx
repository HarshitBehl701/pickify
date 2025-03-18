import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react'

function CustomSelect({options, label,selected,setSelected}:{options:{value:unknown,display:string}[],label:string,selected:{value:unknown,display:string},setSelected:React.Dispatch<React.SetStateAction<{value:unknown,display:string} >>}) {
    const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative w-full">
    {label && <label className="block text-sm font-medium mb-1">{label}</label>}
    <div
      className="flex items-center justify-between p-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:border-gray-400"
      onClick={() => setIsOpen(!isOpen)}
    >
      <span>{selected.display}</span>
      <ChevronDown size={18} />
    </div>
    {isOpen && (
      <ul className="absolute w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto z-10">
        {options.map((option, index) => (
          <li
            key={index}
            className="p-2 hover:bg-gray-100 text-black cursor-pointer"
            onClick={() => {
              setSelected(option);
              setIsOpen(false);
            }}
          >
            {option.display}
          </li>
        ))}
      </ul>
    )}
  </div>
  )
}

export default CustomSelect