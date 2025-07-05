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
  FiMenu,
  FiX,
  FiLoader,
  FiSearch,
  FiAlertCircle,
  FiSave,
  FiCalendar,
  FiPieChart,
  FiActivity,
  FiTarget,
  FiRefreshCw,
  FiAward,
  FiPercent,
  FiEye,
} from "react-icons/fi";

export default function AnalyticsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl text-blue-400 mx-auto mb-4" />
          <p className="text-white text-lg">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="text-5xl text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl text-blue-400 mx-auto mb-4" />
          <p className="text-white text-lg">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950">
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 text-white"
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={toggleMobileMenu} />
        )}

        {/* Mobile Menu */}
        <div className={`lg:hidden fixed top-0 right-0 h-full w-64 bg-blue-900/95 backdrop-blur-sm border-l border-white/20 transform transition-transform duration-300 z-40 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <FiUser className="text-white" />
              <span className="text-white text-sm">{user.displayName || user.email}</span>
            </div>
            <button
              onClick={() => {
                router.push("/");
                setMobileMenuOpen(false);
              }}
              className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FiHome /> Home
            </button>
            <button
              onClick={() => {
                router.back();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FiArrowLeft /> Back
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FiLogOut /> Sign Out
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-between mb-12">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <FiBarChart2 size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">PriceWise Analytics</h1>
              <p className="text-blue-100 text-sm">Your Personal Shopping Intelligence</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <FiUser className="text-white" />
              <span className="text-white text-sm">{user.displayName || user.email}</span>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full border border-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <FiArrowLeft /> Back
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full border border-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <FiHome /> Home
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full border border-red-500 transition-all duration-300 flex items-center gap-2"
            >
              <FiLogOut /> Sign Out
            </button>
          </div>
        </nav>

        {/* Mobile Header */}
        <div className="lg:hidden mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <FiBarChart2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Analytics</h1>
              <p className="text-blue-100 text-sm">Your Shopping Intelligence</p>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-8 text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Welcome back, {user.displayName || "Shopper"}!
          </h2>
          <p className="text-blue-100 text-sm sm:text-base">
            Here&apos;s how much you&apos;ve saved with PriceWise
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <FiDollarSign className="text-green-400" size={20} />
              <span className="text-green-400 text-xs font-medium">+{formatCurrency(analyticsData?.totalSavings || 0)}</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{formatCurrency(analyticsData?.totalSavings || 0)}</p>
            <p className="text-blue-200 text-xs sm:text-sm">Total Savings</p>
          </div>
          
          <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <FiSearch className="text-blue-400" size={20} />
              <span className="text-blue-400 text-xs font-medium">+{analyticsData?.totalSearches || 0}</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{analyticsData?.totalSearches || 0}</p>
            <p className="text-blue-200 text-xs sm:text-sm">Price Searches</p>
          </div>
          
          <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <FiShoppingCart className="text-purple-400" size={20} />
              <span className="text-purple-400 text-xs font-medium">+{analyticsData?.totalComparisons || 0}</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{analyticsData?.totalComparisons || 0}</p>
            <p className="text-blue-200 text-xs sm:text-sm">Comparisons</p>
          </div>
          
          <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <FiTrendingUp className="text-yellow-400" size={20} />
              <span className="text-yellow-400 text-xs font-medium">{analyticsData?.conversionRate?.toFixed(1) || 0}%</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{formatCurrency(analyticsData?.avgSavingsPerPurchase || 0)}</p>
            <p className="text-blue-200 text-xs sm:text-sm">Avg Savings</p>
          </div>
        </div>

        {/* Empty State or Data Display */}
        {(!analyticsData || (analyticsData.totalSearches === 0 && analyticsData.totalComparisons === 0)) ? (
          <div className="text-center py-12">
            <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-8 border border-blue-800">
              <FiBarChart2 className="text-5xl text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Start Building Your Analytics</h3>
              <p className="text-blue-100 mb-6">
                Search for products and compare prices to see your personalized analytics here
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Categories Section */}
            {analyticsData?.topCategories && Object.keys(analyticsData.topCategories).length > 0 && (
              <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-800 mb-8">
                <h3 className="text-xl font-bold text-white mb-6">Top Shopping Categories</h3>
                <div className="space-y-4">
                  {Object.entries(analyticsData.topCategories).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-blue-100 capitalize">{category}</span>
                      <div className="flex items-center gap-3">
                        <div className="bg-white/10 rounded-full h-2 w-24 overflow-hidden">
                          <div 
                            className="bg-blue-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(count / Math.max(...Object.values(analyticsData.topCategories))) * 100}%` }}
                          />
                        </div>
                        <span className="text-white font-medium text-sm">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Trends */}
            {analyticsData?.searchTrends && Object.keys(analyticsData.searchTrends).length > 0 && (
              <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-800 mb-8">
                <h3 className="text-xl font-bold text-white mb-6">Your Search Trends</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(analyticsData.searchTrends).slice(0, 6).map(([term, count]) => (
                    <div key={term} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100 text-sm capitalize">{term}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights Section */}
            {insights && insights.recommendations && insights.recommendations.length > 0 && (
              <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-800 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-500/20 rounded-lg p-3">
                    <FiAward className="text-yellow-400" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Smart Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {insights.recommendations.map((rec, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold text-white mb-2">{rec.title}</h4>
                      <p className="text-blue-100 text-sm">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Charts and Data */}
        {analyticsData && (analyticsData.totalSearches > 0 || analyticsData.totalComparisons > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Activity */}
            <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-800">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FiActivity className="text-blue-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {analyticsData.dailyActivity && Object.entries(analyticsData.dailyActivity).slice(0, 5).map(([date, activity]) => (
                  <div key={date} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm sm:text-base">{date}</p>
                      <p className="text-blue-200 text-xs">{activity.searches} searches, {activity.comparisons} comparisons</p>
                    </div>
                    <div className="text-right mt-2 sm:mt-0">
                      <p className="text-green-400 font-semibold text-sm">{activity.purchases} purchases</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <p className="text-blue-200">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Search Terms */}
            <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-800">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FiPieChart className="text-purple-400" />
                Top Search Terms
              </h3>
              <div className="space-y-3">
                {analyticsData.searchTrends && Object.entries(analyticsData.searchTrends).slice(0, 5).map(([term, count]) => (
                  <div key={term} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm sm:text-base capitalize">{term}</p>
                      <p className="text-blue-200 text-xs">{count} searches</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <p className="text-blue-200">No search history yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Monthly Savings Trend */}
        <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-800 mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FiCalendar className="text-yellow-400" />
            Monthly Savings Trend
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {analyticsData?.monthlyData?.map((month, index) => (
              <div key={index} className="text-center p-3 bg-white/5 rounded-lg">
                <p className="text-blue-200 text-xs mb-1">{month?.month || 'N/A'}</p>
                <p className="text-white font-semibold text-sm sm:text-base">₹{month?.savings?.toLocaleString() || '0'}</p>
                <p className="text-blue-300 text-xs">{month?.searches || 0} searches</p>
              </div>
            )) || (
              <div className="text-center py-8">
                <p className="text-blue-200">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 sm:p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Keep Saving More!</h3>
          <p className="text-yellow-100 mb-4 text-sm sm:text-base">
            You&apos;re doing great! Continue using PriceWise to maximize your savings.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-white text-yellow-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 text-sm sm:text-base"
          >
            Start New Search
          </button>
        </div>
      </div>
    </div>
  );
}
