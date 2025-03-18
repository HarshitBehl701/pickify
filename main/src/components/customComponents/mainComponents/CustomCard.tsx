import { cn } from "@/utils/cn";
import React, { ReactNode } from "react";

const CustomCard = ({children,customCss = ''}:{children:ReactNode,customCss?:string}) => {
  return (
    <div className={cn("border w-full max-w-[280px] rounded-lg border-gray-300 shadow-md p-4 transition-transform duration-300 hover:shadow-lg hover:scale-105",customCss)}>
      {children}
    </div>
  );
};

export default CustomCard;