"use client";
import { use, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { IProduct } from "@/interfaces/modelInterface";
import { toast, Toaster } from "sonner";
import axios from "axios";
import Products from "@/components/customComponents/mainComponents/Products";
import { usePageContext } from "@/context/pageContext";
import { useUserContext } from "@/context/userContext";
import Comments from "@/components/customComponents/mainComponents/Comments";
import { Star } from "lucide-react";

function ProductDetail({ searchParams }: { searchParams: Promise<{ product_id?: string }> }) {
  const [quantity, setQuantity] = useState(1);
  const [productData, setProductData] = useState<IProduct | null>(null);
  const [similarProducts, setSimilarProducts] = useState<IProduct[] | null>(
    null
  );
  const [otherProducts, setOtherProducts] = useState<IProduct[] | null>(null);
  const { products } = usePageContext();
  const [whislistId, setWhislistId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>(
    "/assets/mainAssets/logos/logo.png"
  );
  const {product_id} =  use(searchParams);

  useEffect(() => {
    if (productData && "id" in productData) {
      (async () => {
        await axios.post("/api/products/add_view", {
          product_id: productData?.id,
        });
      })();
    }
  }, [productData]);

  const [lastFetchedProductId, setLastFetchedProductId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (product_id && product_id !== lastFetchedProductId) {
      setLastFetchedProductId(product_id as string);
      (async () => {
        try {
          const response = await axios.post("/api/products/product_detail", {
            product_id: parseInt(product_id as string),
          });
          setProductData(response.data.data);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          toast.error("Something Went Wrong");
        }
      })();
    }
  }, [product_id, lastFetchedProductId]);

  useEffect(() => {
    if (productData) setSelectedImage(productData.images?.split(",")[0] ?? "");
  }, [productData]);

  useEffect(() => {
    if (productData && 'id' in  productData && products) {
      const filteredProducts = products.filter((item: IProduct) => {
        return (
          item.sub_category &&
          item.sub_category.name === productData.sub_category?.name &&
          item.id !== productData?.id
        );
      });
      setSimilarProducts(filteredProducts);
    }
  }, [productData, products]);

  useEffect(() => {
    if (productData && products) {
      const filteredProducts = products.filter((item: IProduct) => {
        return (
          item.category &&
          item.category.name === productData.category?.name &&
          item.id !== productData?.id
        );
      });
      setOtherProducts(filteredProducts);
    }
  }, [productData, products]);

  const { userWhislist, userCart, userOrders } = useUserContext();
  const [isCurrentProductInWhislist, setIsCurrentProductInWhislist] =
    useState<boolean>(false);
  const [isCurrentProductInCart, setIsCurrentProductInCart] =
    useState<boolean>(false);
  const [cartId, setCartId] = useState<number | null>(null);

  const [lastCheckedProductId, setLastCheckedProductId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (
      productData && 'id' in productData &&
      userWhislist &&
      productData?.id.toString() !== lastCheckedProductId
    ) {
      setLastCheckedProductId(productData?.id.toString());
      let isInWishlist = false;
      let wishlistItemId: number | null = null;

      for (let i = 0; i < userWhislist.length; i++) {
        if (userWhislist[i].product_id?.id === productData?.id) {
          isInWishlist = true;
          wishlistItemId = userWhislist[i].id;
          break;
        }
      }

      setIsCurrentProductInWhislist(isInWishlist);
      setWhislistId(wishlistItemId);
    }
  }, [productData, userWhislist, lastCheckedProductId]);

  useEffect(() => {
    if (productData && userCart) {
      let isInCart = false;
      let cartItemId: number | null = null;
      let productQuantity = 1;

      for (let i = 0; i < userCart.length; i++) {
        if (userCart[i]?.product_id?.id === productData?.id) {
          isInCart = true;
          cartItemId = userCart[i].id;
          productQuantity = userCart[i].quantity;
          break;
        }
      }

      setIsCurrentProductInCart(isInCart);
      setCartId(cartItemId);
      setQuantity(productQuantity);
    }
  }, [productData, userCart]);

  const handleUserWhislist = useCallback(
    async (action: "remove" | "add") => {
      if (productData &&  'id' in  productData) {
        try {
          const data: {
            product_id: number;
            action: "remove" | "add";
            whislist_id?: number;
          } = {
            product_id: productData?.id,
            action: action,
          };
          if (action === "remove" && whislistId) data.whislist_id = whislistId;

          await axios.post("/api/users/whislist/manage_whislist", data, {
            withCredentials: true,
          });

          toast.success(`Successfully updated wishlist`);
          setTimeout(() => window.location.reload(), 1000);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          toast.error("An unexpected error occurred");
        }
      }
    },
    [productData, whislistId]
  );

  const handleUserCart = useCallback(
    async (action: "remove" | "add") => {
      if (productData && 'id' in  productData) {
        try {
          const data: {
            product_id?: number;
            quantity?: number;
            action: "remove" | "add";
            cart_id?: number;
          } = {
            action: action,
          };
          if (action === "add") {
            data.product_id = productData?.id;
            data.quantity = quantity;
          } else if (action === "remove" && cartId) {
            data.cart_id = cartId;
          }

          await axios.post("/api/users/cart/manage_cart", data, {
            withCredentials: true,
          });

          toast.success(`Successfully updated cart`);
          setTimeout(() => window.location.reload(), 1000);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          toast.error("An unexpected error occurred");
        }
      }
    },
    [productData, cartId, quantity]
  );

  const handlePlaceOrder = useCallback(async () => {
    if (productData && isCurrentProductInCart && cartId) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const response = await axios.post(
          "/api/orders/place_order",
          { cart_id: cartId },
          { withCredentials: true }
        );
        toast.success(`Successfully place  Order`);
        setTimeout(() => window.location.reload(), 1000);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    }
  }, [productData, cartId, isCurrentProductInCart]);

  const [isCurrentProductInOrder, setIsCurrentProductInOrder] =
    useState<boolean>(false);
  const [isCommentLocked, setIsCommentLocked] = useState<boolean>(true);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    if (productData  &&  'id' in  productData && userOrders) {
      let isInOrdersList = false;
      let userRating = 0;
      for (let i = 0; i < userOrders.length; i++) {
        if (productData?.id === userOrders[i].product_id?.id) {
          isInOrdersList = true;
          setOrderId(userOrders[i].id);
          userRating = userOrders[i].rating;
          break;
        }
      }
      setUserRating(userRating);
      setIsCurrentProductInOrder(isInOrdersList);
    }
  }, [productData, userOrders]);

  useEffect(() => {
    if (isCurrentProductInOrder) setIsCommentLocked(false);
    else setIsCommentLocked(true);
  }, [isCurrentProductInOrder]);

  const handleAddRating = useCallback(
    async (rating: number) => {
      if (orderId) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const response = await axios.post(
            "/api/orders/add_order_rating",
            { order_id: orderId, rating: rating },
            { withCredentials: true }
          );
          toast.success(`Successfully Updated  Rating`);
          setTimeout(() => window.location.reload(), 1000);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          toast.error("An unexpected error occurred");
        }
      }
    },
    [orderId]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Details Section */}
      {productData && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Product Image Gallery */}
          <div>
            <div className="border  w-full h-96 rounded-lg overflow-hidden">
              <Image
                src={
                  selectedImage == "/assets/mainAssets/logos/logo.png"
                    ? selectedImage
                    : `${process.env.NEXT_PUBLIC_API_ASSETS_URL}/products/${selectedImage}`
                }
                width={100}
                height={384}
                unoptimized
                alt={productData.name}
                className="object-contain w-full  h-full"
              />
            </div>

            <div className="flex gap-4 mt-4  flex-wrap">
              {productData.images &&
                Array.isArray(productData.images.split(",")) &&
                productData.images.split(",").length > 0 &&
                productData.images
                  .split(",")
                  .map((img, index) => (
                    <Image
                      key={index}
                      src={`${process.env.NEXT_PUBLIC_API_ASSETS_URL}/products/${img}`}
                      width={80}
                      height={80}
                      unoptimized
                      alt="Thumbnail"
                      className={`cursor-pointer object-contain border rounded-md ${
                        img === selectedImage
                          ? "border-[#FF4F79]"
                          : "border-gray-300"
                      }`}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">{productData.name}</h2>
            <p className="text-xl font-bold text-[#FF4F79]">
              {productData.price}
            </p>
            <p className="text-gray-700">{productData.description}</p>
            <p className="text-gray-700">{productData.specification}</p>
            <div className="ml-auto flex items-center gap-1">
              {[...Array(5)].map((_, i) => {
                return (
                  <Star
                    key={i}
                    size={20}
                    fill={userRating && i < userRating ? "#FACC15" : "#6B7280"}
                    stroke={
                      userRating && i < userRating ? "#FACC15" : "#6B7280"
                    }
                    className="cursor-pointer"
                    onClick={() => handleAddRating(i + 1)}
                  />
                );
              })}
            </div>
            {/* Quantity Selector */}
            <div className="flex items-center space-x-3">
              <button
                disabled={isCurrentProductInCart}
                className="px-3 py-2 cursor-pointer bg-gray-200 rounded-md"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <span className="text-lg font-medium">{quantity}</span>
              <button
                disabled={isCurrentProductInCart}
                className="px-3 py-2 cursor-pointer bg-gray-200 rounded-md"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 flex-wrap">
              {isCurrentProductInCart && (
                <button
                  className="bg-blue-500 cursor-pointer text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </button>
              )}
              <button
                className="bg-[#FF4F79] cursor-pointer text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e23b62]"
                onClick={() =>
                  handleUserCart(isCurrentProductInCart ? "remove" : "add")
                }
              >
                {isCurrentProductInCart ? "Remove   From Cart" : "Add to Cart"}
              </button>
              <button
                className="border cursor-pointer border-[#FF4F79] text-[#FF4F79] px-6 py-3 rounded-lg font-semibold hover:bg-[#FF4F79] hover:text-white"
                onClick={() =>
                  handleUserWhislist(
                    isCurrentProductInWhislist ? "remove" : "add"
                  )
                }
              >
                {!isCurrentProductInWhislist
                  ? "Add to Wishlist"
                  : "Remove  From  Whislist"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      {productData &&  'id' in productData && (
        <Comments
          product_id={productData?.id}
          isCommentAllowed={!isCommentLocked}
          order_id={orderId}
        />
      )}

      {/* Similar Products */}
      <h2 className="text-2xl font-semibold mt-12">View Similar Products</h2>
      {similarProducts &&
        Array.isArray(similarProducts) &&
        similarProducts.length > 0 && (
          <Products title="" productsData={similarProducts} />
        )}
      {!similarProducts ||
        (Array.isArray(similarProducts) && similarProducts.length == 0 && (
          <p className="italic">No similar Products...</p>
        ))}

      {/* Explore */}
      <h2 className="text-2xl font-semibold mt-12">Explore Other Products</h2>
      {otherProducts &&
        Array.isArray(otherProducts) &&
        otherProducts.length > 0 && (
          <Products title="" productsData={otherProducts} />
        )}
      <Toaster />
    </div>
  );
}

export default ProductDetail;