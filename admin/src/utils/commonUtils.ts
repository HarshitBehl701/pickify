import bcrypt from "bcrypt";

export const hashString = async  (str:string) => {
    return await bcrypt.hash(str,10);
}

export const verifyHashString = async  (hashString:string,normalString:string):Promise<boolean> => {
    return await bcrypt.compare(normalString,hashString);
}

export  const  responseStructure = (status:boolean,message:string,data?:unknown) => {
    const response:{status:boolean,message:string,data?:unknown}  =   {status:status,message:message};
    if(data)  response.data   =  data;
    return  response;
}

export const  handleCatchErrors = (error:unknown) =>{
    return  error   instanceof  Error  ? error.message  : 'Something   Went  Wrong';
}