import React, { useEffect, useState } from "react";
import { ShoppingBag, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrls: string[];
  isSoldOut: boolean;
  createdAt: string;
};

function ProductCard({ product, key }: { product: Product; key?: React.Key }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const validImages = product.imageUrls?.filter(url => url.trim() !== "") || [];
  const images = validImages.length > 0 ? validImages : ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600"];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="aspect-[4/5] bg-neutral-100 relative overflow-hidden group/image">
        <img
          src={images[currentImageIndex]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600";
          }}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-sm opacity-0 group-hover/image:opacity-100 transition-opacity focus:outline-none"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-sm opacity-0 group-hover/image:opacity-100 transition-opacity focus:outline-none"
            >
              <ChevronRight className="w-5 h-5 text-neutral-800" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-4">
          <h3 className="font-semibold text-lg text-neutral-900 leading-tight">{product.name}</h3>
          <span className="font-bold text-neutral-900">${Number(product.price).toFixed(2)}</span>
        </div>
        <p className="text-sm text-neutral-500 mb-6 flex-1 line-clamp-2">{product.description}</p>
        
        {product.isSoldOut ? (
          <button disabled className="w-full py-3 px-4 bg-neutral-200 text-neutral-500 text-sm font-medium rounded-xl cursor-not-allowed">
            Sold Out
          </button>
        ) : (
          <button className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2">
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-12">
      <section className="text-center max-w-3xl mx-auto space-y-6 py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900">
          Premium Comfort, <br /> Born in Delhi.
        </h1>
        <p className="text-lg text-neutral-600 leading-relaxed">
          Discover our exclusive collection of high-quality T-shirts designed for everyday wear. Simple, stylish, and built to last.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Latest Collection</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600 bg-red-50 rounded-2xl border border-red-100">
            <p className="font-medium">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-neutral-100 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">No products yet</h3>
            <p className="text-neutral-500">Check back later or visit the Admin Panel to add some T-shirts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
