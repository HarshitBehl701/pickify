import dbConnection from "@/config/db";

export class Migration {
    private _dbConnection;

    constructor() {
        this._dbConnection = dbConnection;
    }

    private _usersTable: string = `
    CREATE  TABLE IF NOT EXISTS  users  (
        id INT   AUTO_INCREMENT  PRIMARY  KEY,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255) NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT  NULL,
        address  VARCHAR(255) NULL,
        is_active  TINYINT(1) NOT   NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE  CURRENT_TIMESTAMP
    )
    `

    private _userCartTable: string = `
    CREATE TABLE IF NOT EXISTS user_cart(
        id INT AUTO_INCREMENT  PRIMARY  KEY,
        user_id INT  NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        is_active TINYINT(1) NOT NULL DEFAULT  1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    )
    `

    private _userWhislistTable: string = `
    CREATE TABLE IF NOT EXISTS user_whislist(
        id INT AUTO_INCREMENT  PRIMARY  KEY,
        user_id INT  NOT NULL,
        product_id INT NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT  1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    )
    `

    private _adminsTable: string = `
    CREATE  TABLE IF NOT EXISTS  admins  (
        id INT   AUTO_INCREMENT  PRIMARY  KEY,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255) NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT  NULL,
        is_active  TINYINT(1) NOT   NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE  CURRENT_TIMESTAMP
    )
    `

    private _productsTable: string = `
    CREATE  TABLE IF NOT EXISTS  products  (
        id INT   AUTO_INCREMENT  PRIMARY  KEY,
        name VARCHAR(255) NOT NULL,
        images TEXT NULL,
        description TEXT NULL,
        specification TEXT NULL,
        category TINYINT(1) NOT  NULL,
        sub_category VARCHAR(255) NULL,
        price  INT NOT NULL DEFAULT 0,
        discount  INT  NOT NULL DEFAULT 0,
        views INT NOT NULL DEFAULT 0,
        average_rating INT NOT NULL DEFAULT 0,
        sum_rating INT NOT NULL DEFAULT 0,
        number_of_users_rate INT NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT  NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE  CURRENT_TIMESTAMP
    )
    `

    private _ordersTable: string = `
    CREATE  TABLE IF NOT EXISTS  orders  (
        id INT   AUTO_INCREMENT  PRIMARY  KEY,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        status  ENUM( 'Pending','Processing','Shipped','Delivered','Cancelled','Refunded','Failed','On Hold','Returned') NOT NULL DEFAULT 'Pending',
        rating TINYINT(1) NOT NULL  DEFAULT 0,
        price INT NOT NULL  DEFAULT 1,
        quantity INT NOT NULL  DEFAULT 1,
        is_active TINYINT(1) NOT  NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE  CURRENT_TIMESTAMP,
        FOREIGN  KEY (product_id) REFERENCES products(id),
        FOREIGN  KEY (user_id) REFERENCES users(id)
        )
    `

    private _commentsTable: string = `
    CREATE  TABLE IF NOT EXISTS  comments  (
        id INT   AUTO_INCREMENT  PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        user_id INT NOT  NULL,
        comment TEXT NOT  NULL,
        is_active TINYINT(1) NOT  NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE  CURRENT_TIMESTAMP,
        FOREIGN  KEY (order_id) REFERENCES  orders(id),
        FOREIGN  KEY (user_id)  REFERENCES  users(id)
        )
    `

    private _categoriesTable: string = `
    CREATE  TABLE IF NOT EXISTS  categories (
        id INT   AUTO_INCREMENT  PRIMARY  KEY,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255) NULL,
        is_active TINYINT(1) NOT  NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE  CURRENT_TIMESTAMP
        )
    `

    private _sub_categoriesTable: string = `
    CREATE  TABLE IF NOT EXISTS  sub_categories  (
        id INT   AUTO_INCREMENT  PRIMARY  KEY,
        category_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255) NULL,
        is_active TINYINT(1) NOT  NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE  CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id)  REFERENCES  categories(id)
    )
    `

    public async migrateTables() {
        const dbConnection  = await this._dbConnection;
        
        await  dbConnection.execute(this._adminsTable);
        await  dbConnection.execute(this._categoriesTable);
        await  dbConnection.execute(this._sub_categoriesTable);
        await  dbConnection.execute(this._productsTable);
        await  dbConnection.execute(this._usersTable);
        await  dbConnection.execute(this._userCartTable);
        await  dbConnection.execute(this._userWhislistTable);
        await  dbConnection.execute(this._ordersTable);
        await  dbConnection.execute(this._commentsTable);
    }

}

export interface IUser {
    id: number;
    name: string;
    image?: string;
    email: string;
    password: string;
    address?: string;
    is_active: number;
    created_at: Date;
    updated_at: Date;
}

export interface IAdmin {
    id: number;
    name: string;
    image?: string;
    email: string;
    password: string;
    is_active: number;
    created_at: Date;
    updated_at: Date;
}

export interface IProduct {
    id: number;
    name: string;
    images?: string;
    description?: string;
    specification?: string;
    category: ICategory;
    sub_category?: ISubCategory;
    price: number;
    discount: number;
    views: number;
    average_rating: number;
    sum_rating: number;
    number_of_users_rate: number;
    is_active: number;
    created_at: Date;
    updated_at: Date;
}

export interface IOrder {
    id: number;
    product_id: IProduct;
    user_id: IUser;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded' | 'Failed' | 'On Hold' | 'Returned';
    rating: number;
    price:number;
    quantity: number;
    is_active: number;
    created_at: Date;
    updated_at: Date;
}

export interface IUserCart {
    id: number;
    user_id: number;
    product_id: number;
    quantity:number;
    is_active: number;
    created_at: Date;
    updated_at: Date;
}

export interface IUserWishlist {
    id: number;
    user_id: number;
    product_id: number;
    is_active: number;
    created_at: Date;
    updated_at: Date;
}

export interface IComment {
    id: number;
    order_id: number;
    product_id:IProduct;
    user_id: IUser;
    comment: string;
    is_active: number;
    created_at: Date;
    updated_at: Date;
}

export interface ICategory {
    id: number;
    name: string;
    image?: string;
    is_active: number;
    created_at: Date;
    updated_at: Date;
}

export interface ISubCategory {
    id: number;
    category_id: ICategory;
    name: string;
    image?: string;
    is_active: number;
    created_at: Date;
    updated_at: Date;
}

export interface ICategoryWithSubCategoryQueries {
    category_id: number;
    category_name: string;
    category_image?: string;
    category_is_active: number;
    category_created_at: Date;
    category_updated_at: Date;
    sub_category_id?: number;
    sub_category_category_id?: ICategory;
    sub_category_name?: string;
    sub_category_image?: string;
    sub_category_is_active?: number;
    sub_category_created_at?: Date;
    sub_category_updated_at?: Date;
}

export interface ICategoryWithSubCategoryResponse extends ICategory {
    sub_categories:ISubCategory[]
}