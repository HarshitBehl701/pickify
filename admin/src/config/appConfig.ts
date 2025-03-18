import { Migration } from "@/migrations/Migration";
import { Seeders } from "@/migrations/Seeders";

async function  configApp(){
    const tables =  new Migration();
    await tables.migrateTables().then(async () => {
        const seedDb  = new Seeders();
        seedDb.initConnection();
        seedDb.runSeeders()
    })
    
}

configApp();