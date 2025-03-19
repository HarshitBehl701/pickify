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
            const adminEmail = process.env.ADMIN_EMAIL ?? "pickify@gmail.com";
            const adminDefaultPassword = await hashString(process.env.ADMIN_DEFAULT_PASS ?? "pickify@123");

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
                    image: "v1742382576/category_fashion_kvr9hr.jpg"
                },
                {
                    name: 'Electronics',
                    image: "v1742382576/category_electronics_d7q8gw.jpg"
                },
                {
                    name: 'Home & Kitchen',
                    image: "v1742382576/category_home_and_kitchen_up6xms.jpg"
                },
                {
                    name: 'Beauty & Health',
                    image: "v1742382577/category_health_and_beauty_vqbkew.jpg"
                },
                {
                    name: 'Sports & Outdoors',
                    image: "v1742382577/category_sport_and_outdoor_reups4.jpg"
                },
                {
                    name: 'Toys & Games',
                    image: "v1742382577/category_toy_and_game_o4ez5z.jpg"
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
                    image: "v1742382579/sub_category_men_fashion_fqnmww.jpg"
                },
                {
                    category_id: 1,
                    name: "Women's Clothing",
                    image: "v1742382581/sub_category_women_clothing_bqg71g.jpg"
                },
                {
                    category_id: 1,
                    name: 'Footwear',
                    image: "v1742382578/sub_category_footwear_na6hwy.jpg"
                },
                {
                    category_id: 2,
                    name: 'Mobiles',
                    image: "v1742382579/sub_category_mobiles_xibuto.jpg"
                },
                {
                    category_id: 2,
                    name: 'Laptops',
                    image: "v1742382579/sub_category_laptop_myaxcx.jpg"
                },
                {
                    category_id: 2,
                    name: 'Tablets',
                    image: "v1742382581/sub_category_tablet_rg1drg.jpg"
                },
                {
                    category_id: 3,
                    name: 'Home  Decor',
                    image: "v1742382579/sub_category_home_decor_aoco0v.jpg"
                },
                {
                    category_id: 3,
                    name: 'Furniture',
                    image: "v1742382579/sub_category_furniture_infhml.jpg"
                },
                {
                    category_id: 3,
                    name: 'Cookware',
                    image: "v1742382578/sub_category_cookware_r4aepf.jpg"
                },
                {
                    category_id: 3,
                    name: 'Storage',
                    image: "v1742382581/sub_category_storage_akwlnm.jpg"
                },
                {
                    category_id: 4,
                    name: 'Skincare',
                    image: "v1742382580/sub_category_skin_care_cisftd.jpg"
                },
                {
                    category_id: 4,
                    name: 'Makeup',
                    image: "v1742382579/sub_category_makeup_nl631x.jpg"
                },
                {
                    category_id: 4,
                    name: 'Hair Care',
                    image: "v1742382579/sub_category_hair_care_gcrikh.jpg"
                },
                {
                    category_id: 4,
                    name: 'Personal Care',
                    image: "v1742382580/sub_category_personal_care_gnofpv.jpg"
                },
                {
                    category_id: 5,
                    name: 'Fitness Equipment',
                    image: "v1742382578/sub_category_fitness_equipment_h2whex.jpg"
                },
                {
                    category_id: 5,
                    name: 'Outdoor Gear',
                    image: "v1742382580/sub_category_outdoor_gear_ctbflf.jpg"
                },
                {
                    category_id: 5,
                    name: 'Sportswear',
                    image: "v1742382581/sub_category_sportswear_rvjqog.jpg"
                },
                {
                    category_id: 6,
                    name: "Educational Toy's",
                    image: "v1742382578/sub_category_educational_toys_jehrve.jpg"
                },
                {
                    category_id: 6,
                    name: "Board  Games",
                    image: "v1742382578/sub_category_board_games_mcbq8g.jpg"
                },
                {
                    category_id: 6,
                    name: "Outdoor Play",
                    image: "v1742382580/sub_category_outdoor_play_bl9zb7.jpg"
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
                { name: "Nike Air Force 1 Sneakers", images: "v1742381916/nike_air_force_1_2_sghb7d.webp,v1742381916/nike_air_force_1_3_wegyky.webp,v1742381916/nike_air_force_1_4_jcgogv.webp,v1742381916/nike_air_force_1_5_wu5vms.webp", description: "Classic Nike sneakers with a sleek design and superior comfort.", specification: "Material: Leather, Sole: Rubber, Closure: Lace-up", category: 1, sub_category: 3, price: 13000, discount: 2999 },
                { name: "Levi's 511 Slim Fit Jeans", images: "v1742381913/levis_511_slim_fit_jeans_1_uvg4nu.jpg,v1742381913/levis_511_slim_fit_jeans_2_q7vz4a.jpg,v1742381913/levis_511_slim_fit_jeans_3_td33yj.jpg,v1742381913/levis_511_slim_fit_jeans_4_jgaaez.jpg", description: "Stylish and comfortable slim-fit jeans from Levi's.", specification: "Material: Denim, Fit: Slim, Closure: Button & Zip", category: 1, sub_category: 1, price: 3499, discount: 15 },
                { name: "Zara Women’s Floral Dress", images: "v1742381922/zara_women_floral_dress_1_rw3ksl.jpg,v1742381923/zara_women_floral_dress_2_vzdtq2.jpg,v1742381923/zara_women_floral_dress_3_u6gchn.jpg,v1742381923/zara_women_floral_dress_4_vs7ncl.jpg,v1742381923/zara_women_floral_dress_5_zybplz.jpg", description: "Elegant floral dress with a flattering fit.", specification: "Material: Polyester, Sleeve: Short, Pattern: Floral", category: 1, sub_category: 2, price: 4599, discount: 12 },
                { name: "Puma Running Shoes", images: "v1742381919/puma_running_shoes_1_yoeadv.jpg,v1742381919/puma_running_shoes_2_aqiqsq.jpg,v1742381920/puma_running_shoes_3_hamneq.jpg,v1742381920/puma_running_shoes_4_zykmka.jpg", description: "Lightweight running shoes for superior performance.", specification: "Material: Mesh, Sole: Rubber, Closure: Lace-up", category: 1, sub_category: 3, price: 5799, discount: 18 },
                { name: "Adidas Men's Training Jacket", images: "v1742381907/adidas_men_training_jacket_1_tdpwq2.jpg,v1742381908/adidas_men_training_jacket_2_tdvuq2.jpg,v1742381908/adidas_men_training_jacket_3_jx8xzk.jpg", description: "Stylish and warm training jacket from Adidas.", specification: "Material: Polyester, Fit: Regular, Closure: Zip-up", category: 1, sub_category: 1, price: 4299, discount: 20 },

                // Electronics
                { name: "Apple iPhone 15 Pro", images: "v1742381909/apple_iphone_15_pro_1_xx1lmp.jpg,v1742381909/apple_iphone_15_pro_2_atewfa.jpg,v1742381910/apple_iphone_15_pro_3_kyjpd4.jpg,v1742381910/apple_iphone_15_pro_4_ehzriw.jpg", description: "The latest iPhone with a powerful A16 chip.", specification: "Display: 6.1-inch OLED, Chipset: A16 Bionic, Camera: Triple 48MP", category: 2, sub_category: 4, price: 134999, discount: 5 },
                { name: "Dell XPS 15 Laptop", images: "v1742381912/dell_XPS_15_laptop_1_bo2qsq.jpg,v1742381908/dell_XPS_15_laptop_2_tw7vfv.jpg,v1742381908/dell_XPS_15_laptop_3_fmmdpc.jpg,v1742381908/dell_XPS_15_laptop_4_lvzix1.jpg", description: "Powerful laptop with a stunning 4K display.", specification: "Processor: Intel i7, RAM: 16GB, Storage: 512GB SSD", category: 2, sub_category: 5, price: 169999, discount: 8 },
                { name: "Samsung Galaxy Tab S9", images: "v1742381920/samsung_Galaxy_Tab_S9_1_yk0ldn.jpg,v1742381920/samsung_Galaxy_Tab_S9_2_s7yprg.jpg,v1742381920/samsung_Galaxy_Tab_S9_3_cswvmy.jpg", description: "High-performance tablet with an AMOLED display.", specification: "Display: 11-inch AMOLED, RAM: 8GB, Storage: 256GB", category: 2, sub_category: 6, price: 79999, discount: 10 },
                { name: "Sony WH-1000XM5 Headphones", images: "v1742381920/sony_WH-1000XM5_Headphones_1_k2hiee.jpg,v1742381921/sony_WH-1000XM5_Headphones_2_unskog.jpg,v1742381921/sony_WH-1000XM5_Headphones_3_qlaich.jpg,v1742381921/sony_WH-1000XM5_Headphones_4_ik5tgh.jpg", description: "Noise-canceling headphones with superior sound quality.", specification: "Type: Over-ear, Connectivity: Bluetooth, Battery: 30 hours", category: 2, sub_category: 4, price: 29999, discount: 12 },
                { name: "Apple MacBook Air M2", images: "v1742381910/apple_MacBook_Air_M2_2_bcndas.jpg,v1742381911/apple_MacBook_Air_M2_1_uj2hf9.jpg,v1742381910/apple_MacBook_Air_M2_3_k9jfzt.jpg", description: "Lightweight laptop with M2 chip for fast performance.", specification: "Processor: M2, RAM: 8GB, Storage: 256GB SSD", category: 2, sub_category: 5, price: 119999, discount: 7 },

                // Home & Kitchen
                {
                    name: "Ikea MALM Bed Frame",
                    images: "v1742381911/ikea_MALM_Bed_Frame_1_rxy4ss.jpg,v1742381911/ikea_MALM_Bed_Frame_2_fiszpx.jpg,v1742381912/ikea_MALM_Bed_Frame_3_ltgn20.jpg",
                    description: "A sturdy and stylish bed frame with a sleek modern design.",
                    specification: "Material: Wood, Size: Queen, Color: White",
                    category: 3,
                    sub_category: 8,
                    price: 15999,
                    discount: 12
                },
                {
                    name: "Philips Air Fryer XL",
                    images: "v1742381917/philips_Air_Fryer_XL_1_enocff.jpg,v1742381917/philips_Air_Fryer_XL_2_mxkop1.jpg,v1742381918/philips_Air_Fryer_XL_3_htd12t.jpg",
                    description: "Large-capacity air fryer for healthier and crispy cooking.",
                    specification: "Capacity: 6.2L, Power: 2000W, Features: Rapid Air Technology",
                    category: 3,
                    sub_category: 9,
                    price: 7999,
                    discount: 20
                },
                {
                    name: "Solimo Storage Organizer",
                    images: "v1742381920/solimo_Storage_Organizer_1_iinsvw.jpg,v1742381920/solimo_Storage_Organizer_2_o8lrpc.jpg",
                    description: "Multi-purpose storage organizer for home and office use.",
                    specification: "Material: Plastic, Compartments: 5, Color: Beige",
                    category: 3,
                    sub_category: 10,
                    price: 1999,
                    discount: 15
                },
                {
                    name: "Home Centre Velvet Curtains",
                    images: "v1742381909/home_Centre_Velvet_Curtains_1_kmitgk.jpg,v1742381909/home_Centre_Velvet_Curtains_2_osh0di.jpg,v1742381910/home_Centre_Velvet_Curtains_3_mligyt.jpg",
                    description: "Luxurious velvet curtains to enhance your home decor.",
                    specification: "Material: Velvet, Length: 7ft, Includes: 2 panels",
                    category: 3,
                    sub_category: 7,
                    price: 2499,
                    discount: 18
                },
                {
                    name: "Prestige Non-Stick Cookware Set",
                    images: "v1742381919/prestige_Non_Stick_Cookware_Set_1_ukt8wd.jpg,v1742381919/prestige_Non_Stick_Cookware_Set_2_exx1xl.jpg,v1742381919/prestige_Non_Stick_Cookware_Set_3_tuyhel.jpg",
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
                    images: "v1742381917/ordinary_Niacinamide_Serum_1_mjyqec.jpg,v1742381917/ordinary_Niacinamide_Serum_2_zfsrhp.jpg",
                    description: "A high-strength serum that helps reduce blemishes and improve skin texture.",
                    specification: "Key Ingredients: Niacinamide 10%, Zinc 1%, Skin Type: All, Volume: 30ml",
                    category: 4,
                    sub_category: 11,
                    price: 999,
                    discount: 5
                },
                {
                    name: "Maybelline Fit Me Foundation",
                    images: "v1742381914/maybelline_Fit_Me_Foundation_1_gbgs3x.jpg,v1742381914/maybelline_Fit_Me_Foundation_2_bese18.jpg,v1742381914/maybelline_Fit_Me_Foundation_3_qqzwhp.jpg",
                    description: "Lightweight foundation that provides a natural matte finish.",
                    specification: "Coverage: Medium, Skin Type: Normal to Oily, Shade Range: Multiple, Volume: 30ml",
                    category: 4,
                    sub_category: 12,
                    price: 799,
                    discount: 10
                },
                {
                    name: "L’Oreal Professional Shampoo",
                    images: "v1742381913/lOreal_Professional_Shampoo_1_npi6xo.jpg,v1742381914/lOreal_Professional_Shampoo_2_iqr7bh.jpg,v1742381914/lOreal_Professional_Shampoo_3_j9pqgi.jpg,v1742381914/lOreal_Professional_Shampoo_4_hrmjvv.jpg",
                    description: "Salon-quality shampoo that nourishes and strengthens hair.",
                    specification: "Hair Type: All, Benefits: Anti-Frizz & Damage Repair, Volume: 500ml",
                    category: 4,
                    sub_category: 13,
                    price: 1199,
                    discount: 15
                },
                {
                    name: "Philips Body Groomer",
                    images: "v1742381918/philips_Body_Groomer_1_fossgf.jpg,v1742381918/philips_Body_Groomer_2_pzc4mt.jpg",
                    description: "A skin-friendly body trimmer designed for gentle and precise grooming.",
                    specification: "Blade Type: Stainless Steel, Waterproof: Yes, Battery Life: 60 mins",
                    category: 4,
                    sub_category: 14,
                    price: 2299,
                    discount: 12
                },
                {
                    name: "Minimalist Sunscreen SPF 50",
                    images: "v1742381914/minimalist_Sunscreen_SPF_50_1_tlifwf.jpg,v1742381915/minimalist_Sunscreen_SPF_50_2_zukz7o.jpg,v1742381915/minimalist_Sunscreen_SPF_50_3_zdknbx.jpg",
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
                    images: "v1742381922/yonex_Nanoray_7000i_Badminton_Racket_1_pocf3u.jpg,v1742381922/yonex_Nanoray_7000i_Badminton_Racket_2_wyacwy.jpg,v1742381922/yonex_Nanoray_7000i_Badminton_Racket_3_uyfek3.jpg",
                    description: "Lightweight badminton racket designed for fast swings and high repulsion.",
                    specification: "Material: Aluminum-Graphite, Weight: 85g, Grip Size: G4, String Tension: 30 lbs",
                    category: 5,
                    sub_category: 15,
                    price: 2499,
                    discount: 12
                },
                {
                    name: "Nike Pro Dri-FIT Men's Tights",
                    images: "v1742381916/nike_Pro_Dri_FIT_Men_Tights_1_ftf8n9.jpg,v1742381917/nike_Pro_Dri_FIT_Men_Tights_2_rwqlpx.jpg,v1742381917/nike_Pro_Dri_FIT_Men_Tights_3_oghoga.jpg",
                    description: "Compression tights designed for maximum flexibility and moisture-wicking comfort.",
                    specification: "Material: 90% Polyester, 10% Spandex, Fit: Compression, Technology: Dri-FIT",
                    category: 5,
                    sub_category: 17,
                    price: 3299,
                    discount: 15
                },
                {
                    name: "Wildcraft Trekking Backpack",
                    images: "v1742381921/wildcraft_Trekking_Backpack_1_vvh6li.jpg,v1742381921/wildcraft_Trekking_Backpack_2_po8qe2.jpg,v1742381921/wildcraft_Trekking_Backpack_3_v8zt8k.jpg",
                    description: "Durable and spacious backpack for trekking and outdoor adventures.",
                    specification: "Capacity: 45L, Material: Nylon, Features: Padded Straps, Water-Resistant",
                    category: 5,
                    sub_category: 16,
                    price: 4999,
                    discount: 10
                },
                {
                    name: "Adidas Predator Football Shoes",
                    images: "v1742381907/adidas_Predator_Football_Shoes_1_yxe4am.jpg,v1742381909/adidas_Predator_Football_Shoes_2_pfhxdp.jpg,v1742381909/adidas_Predator_Football_Shoes_3_qs0o18.jpg",
                    description: "High-performance football shoes designed for excellent grip and ball control.",
                    specification: "Material: Synthetic, Sole Type: Firm Ground, Closure: Lace-Up, Technology: Controlskin",
                    category: 5,
                    sub_category: 17,
                    price: 5499,
                    discount: 18
                },
                {
                    name: "Decathlon Yoga Mat",
                    images: "v1742381910/decathlon_Yoga_Mat_1_ockvij.jpg,v1742381912/decathlon_Yoga_Mat_2_cvijsx.jpg,v1742381912/decathlon_Yoga_Mat_3_ai6t8b.jpg",
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
                    images: "v1742381912/lEGO_Star_Wars_Millennium_Falcon_1_kr8umy.jpg,v1742381912/lEGO_Star_Wars_Millennium_Falcon_2_zzw11u.jpg,v1742381913/lEGO_Star_Wars_Millennium_Falcon_3_nssslf.jpg",
                    description: "Iconic LEGO Star Wars set featuring a highly detailed Millennium Falcon spaceship.",
                    specification: "Pieces: 1351, Age: 9+, Dimensions: 44cm x 32cm x 14cm, Material: ABS Plastic",
                    category: 6,
                    sub_category: 18,
                    price: 14999,
                    discount: 8
                },
                {
                    name: "Monopoly Board Game",
                    images: "v1742381915/monopoly_Board_Game_1_rafvnf.jpg,v1742381915/monopoly_Board_Game_2_mlbbdy.jpg",
                    description: "Classic family board game of buying, selling, and trading properties.",
                    specification: "Players: 2-6, Age: 8+, Includes: Game Board, 8 Tokens, 28 Title Deed Cards, 16 Chance Cards, 16 Community Chest Cards",
                    category: 6,
                    sub_category: 19,
                    price: 1599,
                    discount: 10
                },
                {
                    name: "Nerf Elite 2.0 Blaster",
                    images: "v1742381915/nerf_Elite_2.0_Blaster_1_aitidn.jpg,v1742381915/nerf_Elite_2.0_Blaster_2_oktdlr.jpg,v1742381916/nerf_Elite_2.0_Blaster_3_wtpcgi.jpg",
                    description: "High-performance Nerf blaster with customizable options for battle action.",
                    specification: "Includes: 12 Darts, Firing Range: Up to 90 feet, Material: Plastic, Features: Tactical Rails for Customization",
                    category: 6,
                    sub_category: 20,
                    price: 2999,
                    discount: 12
                },
                {
                    name: "Play-Doh Fun Factory",
                    images: "v1742381918/play_Doh_Fun_Factory_1_wqnini.jpg,v1742381918/play_Doh_Fun_Factory_2_nvvspy.jpg,v1742381919/play_Doh_Fun_Factory_3_trvfj4.jpg",
                    description: "Creative Play-Doh set with shaping tools and colorful dough.",
                    specification: "Includes: 2 Tubs of Play-Doh, 1 Fun Factory Tool, Age: 3+, Material: Non-Toxic Dough",
                    category: 6,
                    sub_category: 18,
                    price: 999,
                    discount: 15
                },
                {
                    name: "Hot Wheels Ultimate Garage",
                    images: "v1742381911/hot_Wheels_Ultimate_Garage_1_lsyb84.jpg,v1742381911/hot_Wheels_Ultimate_Garage_2_gneqbc.jpg,v1742381911/hot_Wheels_Ultimate_Garage_3_rvol4x.jpg",
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