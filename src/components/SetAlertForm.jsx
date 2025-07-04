"use client";
import { useState } from "react";

export default function SetAlertForm() {
  const [url, setUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/set-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productUrl: url,
          targetPrice: parseFloat(targetPrice),
          email,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("🎉 Alert set successfully!");
        setUrl("");
        setTargetPrice("");
        setEmail("");
      } else {
        alert(data.message || "Failed to set alert.");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/20 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-xl max-w-xl mx-auto mt-8 space-y-6"
    >
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        🔔 Set a Price Drop Alert
      </h2>

      <div>
        <label className="block text-sm font-medium text-blue-100 mb-1">
          Product URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="w-full border-0 px-4 py-3 rounded-lg bg-white/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow"
          placeholder="https://www.amazon.in/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-100 mb-1">
          Target Price (₹)
        </label>
        <input
          type="number"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          required
          className="w-full border-0 px-4 py-3 rounded-lg bg-white/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow"
          placeholder="12999"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-100 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border-0 px-4 py-3 rounded-lg bg-white/80 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow"
          placeholder="you@example.com"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl"
      >
        {loading ? "Setting Alert..." : "Set Alert"}
      </button>

      {successMsg && (
        <p className="text-green-300 text-sm mt-2">{successMsg}</p>
      )}
    </form>
  );
}
