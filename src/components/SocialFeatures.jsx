import { useState } from 'react';
import { FiShare2, FiHeart, FiMessageCircle, FiUsers, FiStar, FiThumbsUp } from 'react-icons/fi';

export default function SocialFeatures({ product }) {
  const [liked, setLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: 'Sarah K.',
      rating: 5,
      text: 'Great deal! Saved ₹2,000 using PriceWise alerts!',
      time: '2 hours ago',
      likes: 12
    },
    {
      id: 2,
      user: 'Mike R.',
      rating: 4,
      text: 'Product quality is excellent. Delivery was quick too.',
      time: '1 day ago',
      likes: 8
    }
  ]);

  const shareProduct = (platform) => {
    const shareData = {
      title: `Check out this deal on ${product.title}`,
      text: `Found an amazing deal on ${product.title} for just ₹${product.price}!`,
      url: window.location.href
    };

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`);
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`);
    }
    
    setShowShareModal(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
    setShowShareModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Social Actions */}
      <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            liked ? 'bg-red-500 text-white' : 'bg-white/20 text-gray-300 hover:bg-white/30'
          }`}
        >
          <FiHeart className={liked ? 'fill-current' : ''} />
          <span>{liked ? 'Liked' : 'Like'}</span>
        </button>
        
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 text-gray-300 hover:bg-white/30 rounded-lg transition-all"
        >
          <FiShare2 />
          <span>Share</span>
        </button>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-white/20 text-gray-300 hover:bg-white/30 rounded-lg transition-all">
          <FiMessageCircle />
          <span>Discuss</span>
        </button>
        
        <div className="flex items-center gap-2 text-gray-300">
          <FiUsers />
          <span>247 people tracking this</span>
        </div>
      </div>

      {/* Community Reviews */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FiStar className="text-yellow-400" />
          Community Reviews
        </h3>
        
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white/10 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {review.user[0]}
                  </div>
                  <div>
                    <div className="text-white font-medium">{review.user}</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">{review.time}</span>
              </div>
              
              <p className="text-gray-300 mb-3">{review.text}</p>
              
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-gray-400 hover:text-white">
                  <FiThumbsUp className="w-4 h-4" />
                  <span>{review.likes}</span>
                </button>
                <button className="text-gray-400 hover:text-white">Reply</button>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all">
          Add Your Review
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Share this deal</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => shareProduct('whatsapp')}
                className="flex items-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <span>📱</span> WhatsApp
              </button>
              
              <button
                onClick={() => shareProduct('twitter')}
                className="flex items-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <span>🐦</span> Twitter
              </button>
              
              <button
                onClick={() => shareProduct('facebook')}
                className="flex items-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span>📘</span> Facebook
              </button>
              
              <button
                onClick={copyLink}
                className="flex items-center gap-2 p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                <span>🔗</span> Copy Link
              </button>
            </div>
            
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
