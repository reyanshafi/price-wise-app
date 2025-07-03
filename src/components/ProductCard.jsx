export default function ProductCard({ product }) {
  const {
    title,
    platform,
    price,
    image,
    link,
    shipping,
    discount,
    rating,
    originalPrice,
    coupon,
    taxNote,
  } = product;

  const shippingAmount = parseInt(shipping?.replace(/[^\d]/g, "")) || 0;
  const totalPrice = price + shippingAmount;
  const hasDiscount = discount && discount !== "Check offers";
  const discountPercentage = hasDiscount
    ? parseInt(discount.match(/\d+/)?.[0] || 0)
    : 0;

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Discount Ribbon */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md">
          {discount}
        </div>
      )}

      {/* Product Image */}
      <div className="relative pt-[100%] bg-gray-50 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="absolute top-0 left-0 w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            {platform}
          </p>
          <h2 className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug">
            {title}
          </h2>
        </div>

        {/* Rating */}
        {rating && (
          <div className="flex items-center mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Pricing */}
        <div className="mt-auto">
          {originalPrice && (
            <p className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString()}</p>
          )}

          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-gray-900">₹{price.toLocaleString()}</p>
            {hasDiscount && (
              <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Save {discountPercentage}%
              </span>
            )}
          </div>

          {shippingAmount > 0 ? (
            <p className="text-xs text-gray-500 mt-1">
              + ₹{shippingAmount.toLocaleString()} shipping •{" "}
              <span className="font-medium text-gray-700 ml-1">
                Total: ₹{totalPrice.toLocaleString()}
              </span>
            </p>
          ) : (
            <p className="text-xs text-green-600 font-medium mt-1">Free Shipping</p>
          )}

          {/* Coupon Info */}
          {coupon && (
            <p className="text-xs text-purple-600 font-medium mt-1">{coupon}</p>
          )}

          {/* Tax Note */}
          {taxNote && (
            <p className="text-[11px] text-gray-400 mt-1">{taxNote}</p>
          )}

          {/* Hidden Charges Note */}
          <p className="text-[11px] text-gray-400 mt-1">
            *Prices may vary at checkout due to coupons or taxes
          </p>
        </div>

        {/* Action Button */}
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium py-2 px-4 rounded-lg text-center transition-all duration-300 shadow-sm hover:shadow-md"
        >
          View on {platform}
        </a>
      </div>
    </div>
  );
}
