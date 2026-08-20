import { useState, useEffect } from "react";
import { Plus, Image as ImageIcon, Loader2, Edit2, Check, X, ShieldAlert, LogOut, Trash2 } from "lucide-react";
import { Product } from "./HomePage";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrls: [""],
    isSoldOut: false,
  });

  const getAuthHeader = () => {
    return "Basic " + btoa(`${authForm.username}:${authForm.password}`);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authForm.username === "admin" && authForm.password === "admin1234") {
      setIsAuthenticated(true);
      setAuthError("");
      fetchProducts();
    } else {
      setAuthError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthForm({ username: "", password: "" });
    setProducts([]);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError("Could not load products.");
    }
  };

  const handleAddImageUrl = () => {
    setFormData({ ...formData, imageUrls: [...formData.imageUrls, ""] });
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.imageUrls];
    newUrls[index] = value;
    setFormData({ ...formData, imageUrls: newUrls });
  };

  const handleRemoveImageUrl = (index: number) => {
    const newUrls = formData.imageUrls.filter((_, i) => i !== index);
    setFormData({ ...formData, imageUrls: newUrls });
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrls: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [""],
      isSoldOut: product.isSoldOut,
    });
    setSuccess(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", price: "", imageUrls: [""], isSoldOut: false });
    setSuccess(false);
    setError("");
  };

  const toggleSoldOut = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify({ ...product, isSoldOut: !product.isSoldOut }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: getAuthHeader(),
        },
      });
      if (!res.ok) throw new Error("Failed to delete product");
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProductToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Filter out empty URL strings
    const cleanedUrls = formData.imageUrls.filter(url => url.trim() !== "");

    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          imageUrls: cleanedUrls,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${editingId ? "update" : "add"} product`);
      }

      setSuccess(true);
      cancelEdit();
      fetchProducts();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
        <div className="text-center mb-8">
          <div className="bg-neutral-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6 text-neutral-900" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Admin Login</h1>
          <p className="text-neutral-500 mt-2">Enter your credentials to access the panel.</p>
        </div>
        
        {authError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {authError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">User ID</label>
            <input
              required
              type="text"
              value={authForm.username}
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors bg-neutral-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
            <input
              required
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors bg-neutral-50 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 px-4 mt-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">Admin Panel</h1>
          <p className="text-neutral-500">Manage your global catalog. Changes are live instantly.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors bg-white px-4 py-2 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {editingId ? <Edit2 className="w-5 h-5 text-neutral-900" /> : <Plus className="w-5 h-5 text-neutral-900" />}
            {editingId ? "Edit Product" : "Add New T-Shirt"}
          </h2>
          {editingId && (
            <button onClick={cancelEdit} className="text-sm text-neutral-500 hover:text-neutral-900">
              Cancel Edit
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-100">
            {editingId ? "Product updated successfully!" : "Product added successfully! It is now live."}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Product Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors bg-neutral-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors bg-neutral-50 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Price (USD)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-neutral-500 font-medium">$</span>
                  </div>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors bg-neutral-50 focus:bg-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isSoldOut"
                  checked={formData.isSoldOut}
                  onChange={(e) => setFormData({ ...formData, isSoldOut: e.target.checked })}
                  className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <label htmlFor="isSoldOut" className="text-sm font-medium text-neutral-700">
                  Mark as Sold Out
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Product Images</label>
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <ImageIcon className="w-4 h-4 text-neutral-400" />
                    </div>
                    <input
                      required={index === 0}
                      type="url"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors bg-neutral-50 focus:bg-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {formData.imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(index)}
                      className="p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add another image
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              editingId ? "Update Product" : "Publish Product"
            )}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-6">Manage Products</h2>
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          {products.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">No products available.</div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {products.map((product) => (
                <li key={product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 sm:items-center hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <img 
                      src={product.imageUrls?.find(url => url.trim() !== "") || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600"} 
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover bg-neutral-100"
                    />
                    <div>
                      <h3 className="font-semibold text-neutral-900">{product.name}</h3>
                      <p className="text-sm text-neutral-500">${Number(product.price).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:justify-end">
                    <button
                      onClick={() => toggleSoldOut(product)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 ${product.isSoldOut ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                    >
                      <span className="sr-only">Toggle Sold Out</span>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${product.isSoldOut ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm font-medium w-20 text-neutral-600">
                      {product.isSoldOut ? 'Sold Out' : 'Available'}
                    </span>
                    
                    <button
                      onClick={() => startEdit(product)}
                      className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-neutral-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-neutral-900 mb-2">Delete Product</h3>
            <p className="text-center text-neutral-500 mb-6">
              Are you sure you want to delete "{productToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
