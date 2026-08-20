import { useState } from "react";
import { Plus, Image as ImageIcon, Loader2 } from "lucide-react";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add product");
      }

      setSuccess(true);
      setFormData({ name: "", description: "", price: "", imageUrl: "" });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">Admin Panel</h1>
        <p className="text-neutral-500">Add new products to your global catalog. Changes will be visible immediately on the homepage.</p>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New T-Shirt
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-100">
            Product added successfully! It is now live on the global store.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Product Name
              </label>
              <input
                id="name"
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors bg-neutral-50 focus:bg-white"
                placeholder="e.g. Classic White Tee"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors bg-neutral-50 focus:bg-white resize-none"
                placeholder="Describe the material, fit, and style..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Price (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-neutral-500 font-medium">$</span>
                  </div>
                  <input
                    id="price"
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors bg-neutral-50 focus:bg-white"
                    placeholder="25.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Image URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ImageIcon className="w-4 h-4 text-neutral-400" />
                  </div>
                  <input
                    id="imageUrl"
                    required
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors bg-neutral-50 focus:bg-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding Product...
              </>
            ) : (
              "Publish Product"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
