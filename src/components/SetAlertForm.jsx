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
      className="bg-white p-6 rounded-xl shadow-md border border-gray-200 max-w-xl mx-auto mt-8 space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-800">
        🔔 Set a Price Drop Alert
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Product URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded-md"
          placeholder="https://www.amazon.in/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Target Price (₹)
        </label>
        <input
          type="number"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded-md"
          placeholder="12999"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded-md"
          placeholder="you@example.com"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition"
      >
        {loading ? "Setting Alert..." : "Set Alert"}
      </button>

      {successMsg && (
        <p className="text-green-600 text-sm mt-2">{successMsg}</p>
      )}
    </form>
  );
}
