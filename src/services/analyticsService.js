import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  increment,
  serverTimestamp,
  orderBy,
  limit,
  startAfter,
  endBefore,
  Timestamp
} from 'firebase/firestore';

export class AnalyticsService {
  // Track user search
  static async trackSearch(userId, searchTerm, resultsCount = 0) {
    try {
      await addDoc(collection(db, 'user_activities'), {
        userId,
        type: 'search',
        data: {
          searchTerm,
          resultsCount,
          timestamp: serverTimestamp()
        },
        createdAt: serverTimestamp()
      });

      // Update user stats
      await this.updateUserStats(userId, { totalSearches: increment(1) });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  // Track product view
  static async trackProductView(userId, product) {
    try {
      await addDoc(collection(db, 'user_activities'), {
        userId,
        type: 'product_view',
        data: {
          productName: product.name,
          productPrice: product.price,
          retailer: product.retailer,
          productUrl: product.link,
          timestamp: serverTimestamp()
        },
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  }

  // Track price comparison
  static async trackPriceComparison(userId, searchTerm, products) {
    try {
      const bestPrice = Math.min(...products.map(p => p.price));
      const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
      const potentialSavings = avgPrice - bestPrice;

      await addDoc(collection(db, 'user_activities'), {
        userId,
        type: 'price_comparison',
        data: {
          searchTerm,
          productsCompared: products.length,
          bestPrice,
          avgPrice,
          potentialSavings,
          timestamp: serverTimestamp()
        },
        createdAt: serverTimestamp()
      });

      // Update user stats
      await this.updateUserStats(userId, { 
        totalComparisons: increment(1),
        potentialSavings: increment(potentialSavings)
      });
    } catch (error) {
      console.error('Error tracking price comparison:', error);
    }
  }

  // Track price alert creation
  static async trackPriceAlert(userId, productName, targetPrice, currentPrice) {
    try {
      await addDoc(collection(db, 'user_activities'), {
        userId,
        type: 'price_alert',
        data: {
          productName,
          targetPrice,
          currentPrice,
          potentialSavings: currentPrice - targetPrice,
          timestamp: serverTimestamp()
        },
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking price alert:', error);
    }
  }

  // Track actual purchase (when user clicks "Buy Now")
  static async trackPurchase(userId, product, actualPrice) {
    try {
      await addDoc(collection(db, 'user_activities'), {
        userId,
        type: 'purchase',
        data: {
          productName: product.name,
          actualPrice,
          originalPrice: product.price,
          savings: product.price - actualPrice,
          retailer: product.retailer,
          timestamp: serverTimestamp()
        },
        createdAt: serverTimestamp()
      });

      // Update user stats
      await this.updateUserStats(userId, { 
        totalPurchases: increment(1),
        totalSavings: increment(product.price - actualPrice)
      });
    } catch (error) {
      console.error('Error tracking purchase:', error);
    }
  }

  // Update user statistics
  static async updateUserStats(userId, updates) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`analytics.${Object.keys(updates)[0]}`]: Object.values(updates)[0],
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  // Get user analytics data
  static async getUserAnalytics(userId, timeRange = '30d') {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      // Set time range
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      const activitiesRef = collection(db, 'user_activities');
      
      // Simplified query - just filter by userId first, then filter by date in memory
      // This avoids the need for composite indexes initially
      const q = query(
        activitiesRef,
        where('userId', '==', userId),
        limit(1000) // Limit to prevent excessive data fetching
      );

      const querySnapshot = await getDocs(q);
      const activities = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date();
        
        // Filter by date range in memory
        if (createdAt >= startDate && createdAt <= endDate) {
          activities.push({ id: doc.id, ...data });
        }
      });

      // Sort by date in memory
      activities.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

      return this.processAnalyticsData(activities);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  // Return default analytics when no data is available
  static getDefaultAnalytics() {
    return {
      totalSearches: 0,
      totalComparisons: 0,
      totalPurchases: 0,
      totalSavings: 0,
      avgSavingsPerPurchase: 0,
      topCategories: {},
      searchTrends: {},
      dailyActivity: {},
      potentialSavings: 0,
      conversionRate: 0
    };
  }

  // Process raw analytics data into insights
  static processAnalyticsData(activities) {
    const analytics = {
      totalSearches: 0,
      totalComparisons: 0,
      totalPurchases: 0,
      totalSavings: 0,
      avgSavingsPerPurchase: 0,
      topCategories: {},
      searchTrends: {},
      dailyActivity: {},
      potentialSavings: 0,
      conversionRate: 0
    };

    activities.forEach(activity => {
      const date = activity.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0] || new Date().toISOString().split('T')[0];
      
      // Initialize daily activity
      if (!analytics.dailyActivity[date]) {
        analytics.dailyActivity[date] = { searches: 0, comparisons: 0, purchases: 0 };
      }

      switch (activity.type) {
        case 'search':
          analytics.totalSearches++;
          analytics.dailyActivity[date].searches++;
          
          // Track search trends
          const searchTerm = activity.data.searchTerm.toLowerCase();
          analytics.searchTrends[searchTerm] = (analytics.searchTrends[searchTerm] || 0) + 1;
          break;

        case 'price_comparison':
          analytics.totalComparisons++;
          analytics.dailyActivity[date].comparisons++;
          analytics.potentialSavings += activity.data.potentialSavings || 0;
          
          // Extract category from search term
          const category = this.extractCategory(activity.data.searchTerm);
          analytics.topCategories[category] = (analytics.topCategories[category] || 0) + 1;
          break;

        case 'purchase':
          analytics.totalPurchases++;
          analytics.dailyActivity[date].purchases++;
          analytics.totalSavings += activity.data.savings || 0;
          break;
      }
    });

    // Calculate derived metrics
    analytics.avgSavingsPerPurchase = analytics.totalPurchases > 0 
      ? analytics.totalSavings / analytics.totalPurchases 
      : 0;
    
    analytics.conversionRate = analytics.totalSearches > 0 
      ? (analytics.totalPurchases / analytics.totalSearches) * 100 
      : 0;

    // Sort categories and search trends
    analytics.topCategories = Object.entries(analytics.topCategories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    analytics.searchTrends = Object.entries(analytics.searchTrends)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    return analytics;
  }

  // Extract category from search term
  static extractCategory(searchTerm) {
    const term = searchTerm.toLowerCase();
    
    const categories = {
      'electronics': ['phone', 'mobile', 'smartphone', 'iphone', 'samsung', 'oneplus', 'xiaomi'],
      'computers': ['laptop', 'computer', 'pc', 'macbook', 'dell', 'hp', 'lenovo'],
      'audio': ['headphones', 'earphones', 'speaker', 'airpods', 'bluetooth'],
      'fashion': ['shirt', 'shoes', 'dress', 'jeans', 'clothing', 'nike', 'adidas'],
      'home': ['appliance', 'refrigerator', 'washing machine', 'tv', 'ac', 'microwave'],
      'books': ['book', 'novel', 'textbook', 'magazine'],
      'sports': ['sports', 'fitness', 'gym', 'cricket', 'football']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => term.includes(keyword))) {
        return category;
      }
    }

    return 'other';
  }

  // Get spending insights
  static async getSpendingInsights(userId, timeRange = '30d') {
    try {
      const analytics = await this.getUserAnalytics(userId, timeRange);
      
      if (!analytics) return this.getDefaultInsights();

      const insights = {
        totalSavings: analytics.totalSavings,
        potentialSavings: analytics.potentialSavings,
        avgSavingsPerPurchase: analytics.avgSavingsPerPurchase,
        topCategories: analytics.topCategories,
        conversionRate: analytics.conversionRate,
        recommendations: []
      };

      // Generate recommendations
      if (analytics.conversionRate < 5) {
        insights.recommendations.push({
          type: 'conversion',
          title: 'Increase your savings rate',
          description: 'You\'re researching but not purchasing. Set price alerts to catch the best deals!'
        });
      }

      if (analytics.totalComparisons > 0 && analytics.totalPurchases === 0) {
        insights.recommendations.push({
          type: 'purchase',
          title: 'Time to buy?',
          description: 'You\'ve found some great deals. Consider making a purchase to start saving!'
        });
      }

      if (analytics.totalSearches === 0) {
        insights.recommendations.push({
          type: 'start',
          title: 'Start exploring',
          description: 'Search for products to begin tracking prices and finding the best deals!'
        });
      }

      return insights;
    } catch (error) {
      console.error('Error getting spending insights:', error);
      return this.getDefaultInsights();
    }
  }

  // Return default insights when no data is available
  static getDefaultInsights() {
    return {
      totalSavings: 0,
      potentialSavings: 0,
      avgSavingsPerPurchase: 0,
      topCategories: {},
      conversionRate: 0,
      recommendations: [
        {
          type: 'start',
          title: 'Welcome to PriceWise!',
          description: 'Start searching for products to begin tracking your savings and building your analytics.'
        }
      ]
    };
  }
}
