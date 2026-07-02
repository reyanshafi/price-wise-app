"use client"
import { useState, useEffect } from 'react';
import { FiBarChart, FiTrendingUp, FiDollarSign, FiShoppingCart, FiCalendar, FiTarget } from 'react-icons/fi';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState({
    totalSavings: 15420,
    priceDropsDetected: 23,
    averageDiscount: 18,
    topCategory: 'Electronics',
    weeklyTrend: 'up',
    totalAlerts: 42
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-indigo-200">Track your savings and shopping insights</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm">Total Savings</p>
                <p className="text-2xl font-bold text-white">₹{analytics.totalSavings.toLocaleString()}</p>
              </div>
              <FiDollarSign className="text-green-400 text-2xl" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm">Price Drops</p>
                <p className="text-2xl font-bold text-white">{analytics.priceDropsDetected}</p>
              </div>
              <FiTrendingUp className="text-blue-400 text-2xl" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm">Avg. Discount</p>
                <p className="text-2xl font-bold text-white">{analytics.averageDiscount}%</p>
              </div>
              <FiTarget className="text-yellow-400 text-2xl" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm">Active Alerts</p>
                <p className="text-2xl font-bold text-white">{analytics.totalAlerts}</p>
              </div>
              <FiShoppingCart className="text-purple-400 text-2xl" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Savings Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Monthly Savings</h3>
            <div className="h-64 flex items-end justify-between space-x-1 sm:space-x-2 overflow-x-auto pb-6 pt-2">
              {[45, 67, 89, 123, 156, 134, 178, 165, 142, 198, 234, 267].map((height, index) => (
                <div key={index} className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg relative min-w-[20px] sm:min-w-0">
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-1000"
                    style={{ height: `${height}px` }}
                  ></div>
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-[10px] sm:text-xs text-indigo-200">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Top Categories</h3>
            <div className="space-y-4">
              {[
                { name: 'Electronics', percentage: 45, color: 'bg-blue-500' },
                { name: 'Fashion', percentage: 25, color: 'bg-purple-500' },
                { name: 'Home & Garden', percentage: 20, color: 'bg-green-500' },
                { name: 'Sports', percentage: 10, color: 'bg-yellow-500' }
              ].map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">{category.name}</span>
                    <span className="text-white font-semibold">{category.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className={`${category.color} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'Price drop detected', product: 'iPhone 15 Pro', amount: '₹5,000', time: '2 hours ago' },
              { action: 'Alert triggered', product: 'Samsung Galaxy Watch', amount: '₹3,200', time: '5 hours ago' },
              { action: 'New product tracked', product: 'MacBook Air M2', amount: '₹12,000', time: '1 day ago' },
              { action: 'Price increase', product: 'AirPods Pro', amount: '₹2,500', time: '2 days ago' }
            ].map((activity, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white/5 rounded-lg gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">{activity.action}</p>
                    <p className="text-indigo-200 text-xs sm:text-sm">{activity.product}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right ml-5 sm:ml-0">
                  <p className="text-green-400 font-semibold text-sm sm:text-base">{activity.amount}</p>
                  <p className="text-indigo-200 text-xs sm:text-sm">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
