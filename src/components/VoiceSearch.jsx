import { useState, useRef, useEffect } from 'react';
import { FiMic, FiMicOff, FiSearch } from 'react-icons/fi';

export default function VoiceSearch({ onSearch }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setTranscript(speechToText);
        onSearch(speechToText);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, [onSearch]);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-3 rounded-full transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
        title={isListening ? 'Stop listening' : 'Start voice search'}
      >
        {isListening ? <FiMicOff size={20} /> : <FiMic size={20} />}
      </button>
      
      {isListening && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Listening...</span>
        </div>
      )}
      
      {transcript && (
        <div className="flex items-center gap-2 text-green-600">
          <FiSearch size={16} />
          <span className="text-sm">"{transcript}"</span>
        </div>
      )}
    </div>
  );
}
