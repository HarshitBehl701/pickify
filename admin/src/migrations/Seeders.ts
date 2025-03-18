import dbConnection from "@/config/db";
import { hashString } from "@/utils/commonUtils";
import { Connection } from "mysql2/promise";

export class Seeders {
    private _dbConnection!: Connection | null;


    public async initConnection() {
        this._dbConnection = await dbConnection;
    }


    private async seedAdmin() {
        if (this._dbConnection) {
            const adminEmail = process.env.ADMIN_EMAIL ?? "";
            const adminDefaultPassword = await hashString(process.env.ADMIN_DEFAULT_PASS ?? "");

            const query = `INSERT INTO \`admins\` (name, email, password) VALUES (?, ?, ?)`;
            this._dbConnection.query(query, ["pickify", adminEmail, adminDefaultPassword]).then(() => {
                console.log("Admin inserted successfully");
                process.exit(0);
            });
        }
    }

    private async seedCategories() {
        if (this._dbConnection) {
            const categories: { name: string, image: string }[] = [
                {
                    name: 'Fashion',
                    image: "category_fashion.jpg"
                },
                {
                    name: 'Electronics',
                    image: "category_electronics.jpg"
                },
                {
                    name: 'Home & Kitchen',
                    image: "category_home_and_kitchen.jpg"
                },
                {
                    name: 'Beauty & Health',
                    image: "category_health_and_beauty.jpg"
                },
                {
                    name: 'Sports & Outdoors',
                    image: "category_sport_and_outdoor.jpg"
                },
                {
                    name: 'Toys & Games',
                    image: "category_toy_and_game.jpg"
                },
            ];
            const formattedCategories = categories.map((category) => [category.name, category.image, 1]);
            this._dbConnection.query(
                `INSERT INTO \`categories\` (name,image,is_active) VALUES ?`,
                [formattedCategories],
            ).then(() => {
                console.log("Categories inserted successfully:");
                this.seedSubCategories();
            });
        }
    }

    private async seedSubCategories() {
        if (this._dbConnection) {
            const sub_categories: { category_id: number, name: string, image: string }[] = [
                {
                    category_id: 1,
                    name: "Men's Clothing",
                    image: "sub_category_men_fashion.jpg"
                },
                {
                    category_id: 1,
                    name: "Women's Clothing",
                    image: "sub_category_women_clothing.jpg"
                },
                {
                    category_id: 1,
                    name: 'Footwear',
                    image: "sub_category_footwear.jpg"
                },
                {
                    category_id: 2,
                    name: 'Mobiles',
                    image: "sub_category_mobiles.jpg"
                },
                {
                    category_id: 2,
                    name: 'Laptops',
                    image: "sub_category_laptop.jpg"
                },
                {
                    category_id: 2,
                    name: 'Tablets',
                    image: "sub_category_tablet.jpg"
                },
                {
                    category_id: 3,
                    name: 'Home  Decor',
                    image: "sub_category_home_decor.jpg"
                },
                {
                    category_id: 3,
                    name: 'Furniture',
                    image: "sub_category_furniture.jpg"
                },
                {
                    category_id: 3,
                    name: 'Cookware',
                    image: "sub_category_cookware.jpg"
                },
                {
                    category_id: 3,
                    name: 'Storage',
                    image: "sub_category_storage.jpg"
                },
                {
                    category_id: 4,
                    name: 'Skincare',
                    image: "sub_category_skin_care.jpg"
                },
                {
                    category_id: 4,
                    name: 'Makeup',
                    image: "sub_category_makeup.jpg"
                },
                {
                    category_id: 4,
                    name: 'Hair Care',
                    image: "sub_category_hair_care.jpg"
                },
                {
                    category_id: 4,
                    name: 'Personal Care',
                    image: "sub_category_personal_care.jpg"
                },
                {
                    category_id: 5,
                    name: 'Fitness Equipment',
                    image: "sub_category_fitness_equipment.jpg"
                },
                {
                    category_id: 5,
                    name: 'Outdoor Gear',
                    image: "sub_category_outdoor_gear.jpg"
                },
                {
                    category_id: 5,
                    name: 'Sportswear',
                    image: "sub_category_sportswear.jpg"
                },
                {
                    category_id: 6,
                    name: "Educational Toy's",
                    image: "sub_category_educational_toys.jpg"
                },
                {
                    category_id: 6,
                    name: "Board  Games",
                    image: "sub_category_board_games.jpg"
                },
                {
                    category_id: 6,
                    name: "Outdoor Play",
                    image: "sub_category_outdoor_play.jpg"
                }
            ];
            const formattedSubCategories = sub_categories.map((sub_category) => [sub_category.category_id, sub_category.name, sub_category.image, 1]);
            this._dbConnection.query(`
                INSERT  INTO \`sub_categories\` (category_id,name,image,is_active) VALUES ?    
            `, [formattedSubCategories]
            ).then(() => {
                this.seedProducts();
                console.log("Sub Categories inserted successfully:");
            });
        }
    }

    private async seedProducts() {
        if (this._dbConnection) {
            const products: { name: string; images: string, description: string, specification: string; category: number; sub_category: number; price: number; discount: number }[] = [
                // Fashion
                { name: "Nike Air Force 1 Sneakers", images: "nike_air_force_1_2.jpg,nike_air_force_1_3.jpg,nike_air_force_1_4.jpg,nike_air_force_1_5.jpg", description: "Classic Nike sneakers with a sleek design and superior comfort.", specification: "Material: Leather, Sole: Rubber, Closure: Lace-up", category: 1, sub_category: 3, price: 13000, discount: 2999 },
                { name: "Levi's 511 Slim Fit Jeans", images: "levis_511_slim_fit_jeans_1.jpg,levis_511_slim_fit_jeans_2.jpg,levis_511_slim_fit_jeans_3.jpg,levis_511_slim_fit_jeans_4.jpg", description: "Stylish and comfortable slim-fit jeans from Levi's.", specification: "Material: Denim, Fit: Slim, Closure: Button & Zip", category: 1, sub_category: 1, price: 3499, discount: 15 },
                { name: "Zara Women’s Floral Dress", images: "zara_women_floral_dress_1.jpg,zara_women_floral_dress_2.jpg,zara_women_floral_dress_3.jpg,zara_women_floral_dress_4.jpg,zara_women_floral_dress_5.jpg", description: "Elegant floral dress with a flattering fit.", specification: "Material: Polyester, Sleeve: Short, Pattern: Floral", category: 1, sub_category: 2, price: 4599, discount: 12 },
                { name: "Puma Running Shoes", images: "puma_running_shoes_1.jpg,puma_running_shoes_2.jpg,puma_running_shoes_3.jpg,puma_running_shoes_4.jpg", description: "Lightweight running shoes for superior performance.", specification: "Material: Mesh, Sole: Rubber, Closure: Lace-up", category: 1, sub_category: 3, price: 5799, discount: 18 },
                { name: "Adidas Men's Training Jacket", images: "adidas_men_training_jacket_1.jpg,adidas_men_training_jacket_2.jpg,adidas_men_training_jacket_3.jpg", description: "Stylish and warm training jacket from Adidas.", specification: "Material: Polyester, Fit: Regular, Closure: Zip-up", category: 1, sub_category: 1, price: 4299, discount: 20 },

                // Electronics
                { name: "Apple iPhone 15 Pro", images: "apple_iphone_15_pro_1.jpg,apple_iphone_15_pro_2.jpg,apple_iphone_15_pro_3.jpg,apple_iphone_15_pro_4.jpg", description: "The latest iPhone with a powerful A16 chip.", specification: "Display: 6.1-inch OLED, Chipset: A16 Bionic, Camera: Triple 48MP", category: 2, sub_category: 4, price: 134999, discount: 5 },
                { name: "Dell XPS 15 Laptop", images: "dell_XPS_15_laptop_1.jpg,dell_XPS_15_laptop_2.jpg,dell_XPS_15_laptop_3.jpg,dell_XPS_15_laptop_4.jpg", description: "Powerful laptop with a stunning 4K display.", specification: "Processor: Intel i7, RAM: 16GB, Storage: 512GB SSD", category: 2, sub_category: 5, price: 169999, discount: 8 },
                { name: "Samsung Galaxy Tab S9", images: "samsung_Galaxy_Tab_S9_1.jpg,samsung_Galaxy_Tab_S9_2.jpg,samsung_Galaxy_Tab_S9_3.jpg", description: "High-performance tablet with an AMOLED display.", specification: "Display: 11-inch AMOLED, RAM: 8GB, Storage: 256GB", category: 2, sub_category: 6, price: 79999, discount: 10 },
                { name: "Sony WH-1000XM5 Headphones", images: "sony_WH-1000XM5_Headphones_1.jpg,sony_WH-1000XM5_Headphones_2.jpg,sony_WH-1000XM5_Headphones_3.jpg,sony_WH-1000XM5_Headphones_4.jpg", description: "Noise-canceling headphones with superior sound quality.", specification: "Type: Over-ear, Connectivity: Bluetooth, Battery: 30 hours", category: 2, sub_category: 4, price: 29999, discount: 12 },
                { name: "Apple MacBook Air M2", images: "apple_MacBook_Air_M2_2.jpg,apple_MacBook_Air_M2_1.jpg,apple_MacBook_Air_M2_3.jpg", description: "Lightweight laptop with M2 chip for fast performance.", specification: "Processor: M2, RAM: 8GB, Storage: 256GB SSD", category: 2, sub_category: 5, price: 119999, discount: 7 },

                // Home & Kitchen
                {
                    name: "Ikea MALM Bed Frame",
                    images: "ikea_MALM_Bed_Frame_1.jpg,ikea_MALM_Bed_Frame_2.jpg,ikea_MALM_Bed_Frame_3.jpg",
                    description: "A sturdy and stylish bed frame with a sleek modern design.",
                    specification: "Material: Wood, Size: Queen, Color: White",
                    category: 3,
                    sub_category: 8,
                    price: 15999,
                    discount: 12
                },
                {
                    name: "Philips Air Fryer XL",
                    images: "philips_Air_Fryer_XL_1.jpg,philips_Air_Fryer_XL_2.jpg,philips_Air_Fryer_XL_3.jpg",
                    description: "Large-capacity air fryer for healthier and crispy cooking.",
                    specification: "Capacity: 6.2L, Power: 2000W, Features: Rapid Air Technology",
                    category: 3,
                    sub_category: 9,
                    price: 7999,
                    discount: 20
                },
                {
                    name: "Solimo Storage Organizer",
                    images: "solimo_Storage_Organizer_1.jpg,solimo_Storage_Organizer_2.jpg",
                    description: "Multi-purpose storage organizer for home and office use.",
                    specification: "Material: Plastic, Compartments: 5, Color: Beige",
                    category: 3,
                    sub_category: 10,
                    price: 1999,
                    discount: 15
                },
                {
                    name: "Home Centre Velvet Curtains",
                    images: "home_Centre_Velvet_Curtains_1.jpg,home_Centre_Velvet_Curtains_2.jpg,home_Centre_Velvet_Curtains_3.jpg",
                    description: "Luxurious velvet curtains to enhance your home decor.",
                    specification: "Material: Velvet, Length: 7ft, Includes: 2 panels",
                    category: 3,
                    sub_category: 7,
                    price: 2499,
                    discount: 18
                },
                {
                    name: "Prestige Non-Stick Cookware Set",
                    images: "prestige_Non_Stick_Cookware_Set_1.jpg,prestige_Non_Stick_Cookware_Set_2.jpg,prestige_Non_Stick_Cookware_Set_3.jpg",
                    description: "Premium non-stick cookware set for effortless cooking.",
                    specification: "Includes: 3 Pans, Material: Aluminum, Coating: Non-Stick",
                    category: 3,
                    sub_category: 9,
                    price: 5499,
                    discount: 25
                },

                // Beauty & Health
                {
                    name: "The Ordinary Niacinamide Serum",
                    images: "ordinary_Niacinamide_Serum_1.jpg,ordinary_Niacinamide_Serum_2.jpg",
                    description: "A high-strength serum that helps reduce blemishes and improve skin texture.",
                    specification: "Key Ingredients: Niacinamide 10%, Zinc 1%, Skin Type: All, Volume: 30ml",
                    category: 4,
                    sub_category: 11,
                    price: 999,
                    discount: 5
                },
                {
                    name: "Maybelline Fit Me Foundation",
                    images: "maybelline_Fit_Me_Foundation_1.jpg,maybelline_Fit_Me_Foundation_2.jpg,maybelline_Fit_Me_Foundation_3.jpg",
                    description: "Lightweight foundation that provides a natural matte finish.",
                    specification: "Coverage: Medium, Skin Type: Normal to Oily, Shade Range: Multiple, Volume: 30ml",
                    category: 4,
                    sub_category: 12,
                    price: 799,
                    discount: 10
                },
                {
                    name: "L’Oreal Professional Shampoo",
                    images: "lOreal_Professional_Shampoo_1.jpg,lOreal_Professional_Shampoo_2.jpg,lOreal_Professional_Shampoo_3.jpg,lOreal_Professional_Shampoo_4.jpg",
                    description: "Salon-quality shampoo that nourishes and strengthens hair.",
                    specification: "Hair Type: All, Benefits: Anti-Frizz & Damage Repair, Volume: 500ml",
                    category: 4,
                    sub_category: 13,
                    price: 1199,
                    discount: 15
                },
                {
                    name: "Philips Body Groomer",
                    images: "philips_Body_Groomer_1.jpg,philips_Body_Groomer_2.jpg",
                    description: "A skin-friendly body trimmer designed for gentle and precise grooming.",
                    specification: "Blade Type: Stainless Steel, Waterproof: Yes, Battery Life: 60 mins",
                    category: 4,
                    sub_category: 14,
                    price: 2299,
                    discount: 12
                },
                {
                    name: "Minimalist Sunscreen SPF 50",
                    images: "minimalist_Sunscreen_SPF_50_1.jpg,minimalist_Sunscreen_SPF_50_2.jpg,minimalist_Sunscreen_SPF_50_3.jpg",
                    description: "Lightweight, non-greasy sunscreen with broad-spectrum UV protection.",
                    specification: "SPF: 50 PA+++, Skin Type: All, Finish: Matte, Volume: 50ml",
                    category: 4,
                    sub_category: 11,
                    price: 499,
                    discount: 7
                },


                // Sports & Outdoors
                {
                    name: "Yonex Nanoray 7000i Badminton Racket",
                    images: "yonex_Nanoray_7000i_Badminton_Racket_1.jpg,yonex_Nanoray_7000i_Badminton_Racket_2.jpg,yonex_Nanoray_7000i_Badminton_Racket_3.jpg",
                    description: "Lightweight badminton racket designed for fast swings and high repulsion.",
                    specification: "Material: Aluminum-Graphite, Weight: 85g, Grip Size: G4, String Tension: 30 lbs",
                    category: 5,
                    sub_category: 15,
                    price: 2499,
                    discount: 12
                },
                {
                    name: "Nike Pro Dri-FIT Men's Tights",
                    images: "nike_Pro_Dri_FIT_Men_Tights_1.jpg,nike_Pro_Dri_FIT_Men_Tights_2.jpg,nike_Pro_Dri_FIT_Men_Tights_3.jpg",
                    description: "Compression tights designed for maximum flexibility and moisture-wicking comfort.",
                    specification: "Material: 90% Polyester, 10% Spandex, Fit: Compression, Technology: Dri-FIT",
                    category: 5,
                    sub_category: 17,
                    price: 3299,
                    discount: 15
                },
                {
                    name: "Wildcraft Trekking Backpack",
                    images: "wildcraft_Trekking_Backpack_1.jpg,wildcraft_Trekking_Backpack_2.jpg,wildcraft_Trekking_Backpack_3.jpg",
                    description: "Durable and spacious backpack for trekking and outdoor adventures.",
                    specification: "Capacity: 45L, Material: Nylon, Features: Padded Straps, Water-Resistant",
                    category: 5,
                    sub_category: 16,
                    price: 4999,
                    discount: 10
                },
                {
                    name: "Adidas Predator Football Shoes",
                    images: "adidas_Predator_Football_Shoes_1.jpg,adidas_Predator_Football_Shoes_2.jpg,adidas_Predator_Football_Shoes_3.jpg",
                    description: "High-performance football shoes designed for excellent grip and ball control.",
                    specification: "Material: Synthetic, Sole Type: Firm Ground, Closure: Lace-Up, Technology: Controlskin",
                    category: 5,
                    sub_category: 17,
                    price: 5499,
                    discount: 18
                },
                {
                    name: "Decathlon Yoga Mat",
                    images: "decathlon_Yoga_Mat_1.jpg,decathlon_Yoga_Mat_2.jpg,decathlon_Yoga_Mat_3.jpg",
                    description: "Eco-friendly and non-slip yoga mat designed for comfort and stability.",
                    specification: "Material: TPE, Thickness: 6mm, Dimensions: 183cm x 61cm, Features: Anti-Skid, Lightweight",
                    category: 5,
                    sub_category: 15,
                    price: 1999,
                    discount: 20
                },


                // Toys & Games
                {
                    name: "LEGO Star Wars Millennium Falcon",
                    images: "lEGO_Star_Wars_Millennium_Falcon_1.jpg,lEGO_Star_Wars_Millennium_Falcon_2.jpg,lEGO_Star_Wars_Millennium_Falcon_3.jpg",
                    description: "Iconic LEGO Star Wars set featuring a highly detailed Millennium Falcon spaceship.",
                    specification: "Pieces: 1351, Age: 9+, Dimensions: 44cm x 32cm x 14cm, Material: ABS Plastic",
                    category: 6,
                    sub_category: 18,
                    price: 14999,
                    discount: 8
                },
                {
                    name: "Monopoly Board Game",
                    images: "monopoly_Board_Game_1.jpg,monopoly_Board_Game_2.jpg",
                    description: "Classic family board game of buying, selling, and trading properties.",
                    specification: "Players: 2-6, Age: 8+, Includes: Game Board, 8 Tokens, 28 Title Deed Cards, 16 Chance Cards, 16 Community Chest Cards",
                    category: 6,
                    sub_category: 19,
                    price: 1599,
                    discount: 10
                },
                {
                    name: "Nerf Elite 2.0 Blaster",
                    images: "nerf_Elite_2.0_Blaster_1.jpg,nerf_Elite_2.0_Blaster_2.jpg,nerf_Elite_2.0_Blaster_3.jpg",
                    description: "High-performance Nerf blaster with customizable options for battle action.",
                    specification: "Includes: 12 Darts, Firing Range: Up to 90 feet, Material: Plastic, Features: Tactical Rails for Customization",
                    category: 6,
                    sub_category: 20,
                    price: 2999,
                    discount: 12
                },
                {
                    name: "Play-Doh Fun Factory",
                    images: "play_Doh_Fun_Factory_1.jpg,play_Doh_Fun_Factory_2.jpg,play_Doh_Fun_Factory_3.jpg",
                    description: "Creative Play-Doh set with shaping tools and colorful dough.",
                    specification: "Includes: 2 Tubs of Play-Doh, 1 Fun Factory Tool, Age: 3+, Material: Non-Toxic Dough",
                    category: 6,
                    sub_category: 18,
                    price: 999,
                    discount: 15
                },
                {
                    name: "Hot Wheels Ultimate Garage",
                    images: "hot_Wheels_Ultimate_Garage_1.jpg,hot_Wheels_Ultimate_Garage_2.jpg,hot_Wheels_Ultimate_Garage_3.jpg",
                    description: "Massive Hot Wheels garage with multiple parking spaces and racing tracks.",
                    specification: "Levels: 4, Includes: 2 Hot Wheels Cars, Material: Plastic, Features: Moving Elevator, Loop Track",
                    category: 6,
                    sub_category: 20,
                    price: 7999,
                    discount: 18
                },

            ];

            const formattedProducts = products.map((product) => [product.name, product.images, product.description, product.specification, product.category, product.sub_category, product.price, product.discount, 1]);

            this._dbConnection.query(`
                INSERT  INTO \`products\` (name,images,description,specification,category,sub_category,price,discount,is_active) VALUES ?    
            `, [formattedProducts]
            ).then(() => {
                console.log("Products inserted successfully:");
            });
        }
    }

    public async runSeeders() {
        await this.seedAdmin();
        await this.seedCategories();
        await this.seedAdmin();
    }

}