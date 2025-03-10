import Image from "next/image";

const ProductDetails = () => {
  // Sample Product Data
  const product = {
    name: "Wireless Bluetooth Headphones",
    description:
      "High-quality noise-canceling Bluetooth headphones with a long battery life.",
    price: 4999,
    category: "Electronics",
    subcategory: "Headphones",
    stock: 25,
    status: "In Stock",
    images: [
      "/assets/mainAssets/logos/logo.png",
      "/assets/mainAssets/logos/logo.png",
      "/assets/mainAssets/logos/logo.png",
    ],
  };

  return (
    <div className="h-full  flex items-center  justify-center">
        <div className="bg-white shadow-lg border  border-gray-200 rounded-lg p-6 w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
        <span
          className={`px-3 py-1 rounded text-white ${
            product.status === "In Stock" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {product.status}
        </span>
      </div>

      {/* Product Information */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-700">{product.name}</h3>
        <p className="text-gray-600">{product.description}</p>
        <p className="text-gray-800 font-medium">Price: ₹{product.price}</p>
        <p className="text-gray-600">
          <strong>Category:</strong> {product.category} - {product.subcategory}
        </p>
        <p className="text-gray-800">
          <strong>Stock:</strong> {product.stock} units
        </p>
      </div>

      {/* Product Images */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Images</h3>
        <div className="grid grid-cols-3 gap-2">
          {product.images.map((img, index) => (
            <div key={index} className="relative w-24 h-24">
              <Image
                src={img}
                alt={`Product Image ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded border"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Edit Product
        </button>
        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
          Manage Stock
        </button>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
          Delete Product
        </button>
      </div>
    </div>
    </div>
  );
};

export default ProductDetails;