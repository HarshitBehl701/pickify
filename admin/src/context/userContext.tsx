"use client"
import { IUser } from "@/migrations/Migration";
import  {createContext, useContext} from  "react";


export  const  UserContext = createContext<IUserContext | null>(null)


export  const  UserContextProvider = ({children,userData,setUserData,isLoggedIn,setIsLoggedIn}:IUserContextProvider) => {
    return (
        <UserContext.Provider value={{userData,setUserData,isLoggedIn,setIsLoggedIn}}>
            {children}
        </UserContext.Provider>
    )
}

export  const useUserContext = () =>{
    const context  =  useContext(UserContext);
    if(!context)
        throw new   Error("User Context  Not Found");
    return context;
}

export  interface   IUserContext {
    userData: IUser |  null,
    setUserData: React.Dispatch<React.SetStateAction<IUser|null>>;
    isLoggedIn:boolean |null,
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean|null>>;
}

export interface IUserContextProvider extends IUserContext{
    children:  React.ReactNode;
}