
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
    product_id: IProduct;
    quantity:number;
    is_active: number;
    created_at: Date;
    updated_at: Date;
}

export interface IUserWishlist {
    id: number;
    user_id: number;
    product_id: IProduct;
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