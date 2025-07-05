import { useState, useRef, useEffect } from 'react';
import { FiCamera, FiX, FiShoppingCart, FiMapPin } from 'react-icons/fi';

export default function QRScanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [comparison, setComparison] = useState(null);
  const videoRef = useRef(null);

  const openScanner = async () => {
    setIsOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const closeScanner = () => {
    setIsOpen(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const mockScanResult = () => {
    // Simulate QR code scan result
    const mockData = {
      productName: 'iPhone 15 Pro Max',
      storePrice: 134900,
      storeName: 'Croma Electronics',
      location: 'Mall Road, Delhi'
    };
    
    setScannedData(mockData);
    
    // Simulate online price comparison
    setTimeout(() => {
      setComparison({
        onlinePrices: [
          { store: 'Amazon', price: 129900, discount: 5000 },
          { store: 'Flipkart', price: 131900, discount: 3000 },
          { store: 'Reliance Digital', price: 134900, discount: 0 }
        ],
        recommendation: 'Buy online and save ₹5,000!'
      });
    }, 2000);
  };

  return (
    <>
      <button
        onClick={openScanner}
        className="fixed bottom-20 left-6 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        title="Scan QR Code to compare prices"
      >
        <FiCamera size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">QR Code Scanner</h3>
              <button
                onClick={closeScanner}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            {!scannedData ? (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 bg-gray-200 rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-white rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <FiCamera size={48} className="mx-auto mb-2" />
                      <p>Position QR code within frame</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={mockScanResult}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Simulate Scan (Demo)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FiShoppingCart className="text-blue-500" />
                    <h4 className="font-semibold">{scannedData.productName}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMapPin />
                    <span>{scannedData.storeName}, {scannedData.location}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-lg font-bold text-gray-800">
                      ₹{scannedData.storePrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {comparison ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-600">Online Comparison</h4>
                    {comparison.onlinePrices.map((price, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{price.store}</span>
                        <div className="text-right">
                          <div className="font-bold">₹{price.price.toLocaleString()}</div>
                          {price.discount > 0 && (
                            <div className="text-sm text-green-600">
                              Save ₹{price.discount.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <div className="text-green-800 font-semibold">
                        💡 {comparison.recommendation}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-600">Comparing prices...</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setScannedData(null)}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Scan Again
                  </button>
                  <button
                    onClick={closeScanner}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
