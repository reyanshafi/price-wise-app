"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AnalyticsService } from "@/services/analyticsService";
import {
  FiBarChart2,
  FiTrendingUp,
  FiDollarSign,
  FiShoppingCart,
  FiArrowLeft,
  FiHome,
  FiUser,
  FiLogOut,
  FiLoader,
  FiSearch,
  FiAlertCircle,
  FiCalendar,
  FiPieChart,
  FiActivity,
  FiAward,
} from "react-icons/fi";

export default function AnalyticsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const [analytics, spendingInsights] = await Promise.all([
          AnalyticsService.getUserAnalytics(user.uid, timeRange),
          AnalyticsService.getSpendingInsights(user.uid, timeRange)
        ]);

        setAnalyticsData(analytics);
        setInsights(spendingInsights);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, timeRange]);

  if (!user) {
    return null; // Will redirect
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--surface-2)] flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--surface-2)] flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="text-5xl text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-2)] pb-12">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="pw-navbar" style={{ position: 'relative', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div className="pw-navbar-inner">
          <a href="/" className="pw-logo">
            <img src="/pricewise-logo.svg" alt="PriceWise" style={{ width: 110, height: "auto" }} />
          </a>
          <div className="pw-nav-actions">
            <button
              onClick={() => router.back()}
              className="btn btn-ghost hidden sm:flex"
            >
              <FiArrowLeft size={14} /> Back
            </button>
            <div className="relative">
              <div 
                className="pw-user-pill cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="pw-user-avatar">{user.displayName?.[0] || user.email?.[0]?.toUpperCase() || "U"}</div>
                <span className="hidden sm:inline-block" style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.displayName || user.email?.split("@")[0]}
                </span>
              </div>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg py-1 z-50 border border-gray-200">
                  <a
                    href="/"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <FiHome size={14} /> Home
                  </a>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                    onClick={handleLogout}
                  >
                    <FiLogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Analytics Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, {user.displayName || "Shopper"}. Here's your shopping intelligence.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 p-2 rounded-none">
                <FiDollarSign className="text-green-600" size={20} />
              </div>
              <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-none">+{formatCurrency(analyticsData?.totalSavings || 0)}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(analyticsData?.totalSavings || 0)}</p>
            <p className="text-gray-500 text-sm mt-1">Total Savings</p>
          </div>
          
          <div className="bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-2 rounded-none">
                <FiSearch className="text-blue-600" size={20} />
              </div>
              <span className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-none">+{analyticsData?.totalSearches || 0}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analyticsData?.totalSearches || 0}</p>
            <p className="text-gray-500 text-sm mt-1">Price Searches</p>
          </div>
          
          <div className="bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-100 p-2 rounded-none">
                <FiShoppingCart className="text-purple-600" size={20} />
              </div>
              <span className="text-purple-600 text-xs font-bold bg-purple-50 px-2 py-1 rounded-none">+{analyticsData?.totalComparisons || 0}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analyticsData?.totalComparisons || 0}</p>
            <p className="text-gray-500 text-sm mt-1">Comparisons</p>
          </div>
          
          <div className="bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-yellow-100 p-2 rounded-none">
                <FiTrendingUp className="text-yellow-600" size={20} />
              </div>
              <span className="text-yellow-600 text-xs font-bold bg-yellow-50 px-2 py-1 rounded-none">{analyticsData?.conversionRate?.toFixed(1) || 0}%</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(analyticsData?.avgSavingsPerPurchase || 0)}</p>
            <p className="text-gray-500 text-sm mt-1">Avg Savings/Purchase</p>
          </div>
        </div>

        {/* Empty State */}
        {(!analyticsData || (analyticsData.totalSearches === 0 && analyticsData.totalComparisons === 0)) ? (
          <div className="text-center py-16 bg-white shadow-sm border border-gray-200">
            <FiBarChart2 className="text-5xl text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start Building Your Analytics</h3>
            <p className="text-gray-500 mb-6">
              Search for products and compare prices to see your personalized analytics here.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-none font-medium transition-colors shadow-sm"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Top Categories */}
              {analyticsData?.topCategories && Object.keys(analyticsData.topCategories).length > 0 && (
                <div className="bg-white p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiPieChart className="text-purple-500" /> Top Categories
                  </h3>
                  <div className="space-y-5">
                    {Object.entries(analyticsData.topCategories).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize text-sm font-medium w-1/4">{category}</span>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-100 h-2 w-full">
                            <div 
                              className="bg-purple-500 h-full transition-all duration-500"
                              style={{ width: `${(count / Math.max(...Object.values(analyticsData.topCategories))) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-gray-900 font-bold text-sm w-8 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights Section */}
              {insights && insights.recommendations && insights.recommendations.length > 0 && (
                <div className="bg-white p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiAward className="text-yellow-500" /> Smart Recommendations
                  </h3>
                  <div className="space-y-4">
                    {insights.recommendations.map((rec, index) => (
                      <div key={index} className="bg-gray-50 p-4 border border-gray-100">
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{rec.title}</h4>
                        <p className="text-gray-500 text-sm">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Charts and Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Recent Activity */}
              <div className="bg-white p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiActivity className="text-blue-500" /> Recent Activity
                </h3>
                <div className="space-y-3">
                  {analyticsData.dailyActivity && Object.entries(analyticsData.dailyActivity).slice(0, 5).map(([date, activity]) => (
                    <div key={date} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <p className="text-gray-900 font-bold text-sm">{date}</p>
                        <p className="text-gray-500 text-xs mt-1">{activity.searches} searches, {activity.comparisons} comparisons</p>
                      </div>
                      <div className="text-right mt-2 sm:mt-0 bg-green-50 px-3 py-1 text-green-700 font-bold text-xs">
                        {activity.purchases} purchases
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Savings Trend */}
              <div className="bg-white p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiCalendar className="text-green-500" /> Monthly Savings Trend
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {analyticsData?.monthlyData?.map((month, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 border border-gray-100">
                      <p className="text-gray-500 text-xs mb-1 font-medium">{month?.month || 'N/A'}</p>
                      <p className="text-green-600 font-bold text-lg">₹{month?.savings?.toLocaleString() || '0'}</p>
                      <p className="text-gray-400 text-xs mt-1">{month?.searches || 0} searches</p>
                    </div>
                  )) || (
                    <div className="text-center py-8 col-span-3">
                      <p className="text-gray-500">No data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
