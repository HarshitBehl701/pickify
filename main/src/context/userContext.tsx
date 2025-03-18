'use client';
import { IOrder, IUser, IUserCart, IUserWishlist } from "@/interfaces/modelInterface";
import  {createContext, ReactNode, useContext} from "react";

export const  UserContext = createContext<IUserContext |null>(null);

export  const UserContextProvider = ({children,isLoggedIn,setIsLoggedIn,userData,setUserData,userCart,setUserCart,userWhislist,setUserWhislist,userOrders,setUserOrders}:IUserContextProvider) => {
    return  (
        <UserContext.Provider value={{isLoggedIn,setIsLoggedIn,userData,setUserData,userCart,setUserCart,userWhislist,setUserWhislist,userOrders,setUserOrders}}>
            {children}
        </UserContext.Provider>
    )
}

export const useUserContext  = () => {
    const  context = useContext(UserContext);
    if(!context)
        throw new Error("UserContext is not found. Make sure to wrap your components with UserContextProvider.");

    return context;
}

export interface IUserContext{
    isLoggedIn:boolean|null;
    setIsLoggedIn:React.Dispatch<React.SetStateAction<boolean|null>>;
    userData: IUser | null;
    setUserData:React.Dispatch<React.SetStateAction<IUser|null>>;
    userCart: IUserCart[] | null;
    setUserCart:React.Dispatch<React.SetStateAction<IUserCart[]|null>>;
    userWhislist: IUserWishlist[] | null;
    setUserWhislist:React.Dispatch<React.SetStateAction<IUserWishlist[]|null>>;
    userOrders: IOrder[] | null;
    setUserOrders:React.Dispatch<React.SetStateAction<IOrder[]|null>>;
}

export  interface  IUserContextProvider  extends IUserContext{
    children: ReactNode;
}