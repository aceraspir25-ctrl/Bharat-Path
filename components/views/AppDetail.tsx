import React from 'react';

const AppDetail: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 text-center animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white">
          App Details: <span className="text-orange-500">Bharat Path</span> (भारत पथ)
        </h1>
        <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mt-2">
          Travel & Tourism App
        </h2>

        <div className="my-8 border-t border-dashed border-gray-300 dark:border-gray-600"></div>

        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          With Bharat Path, you don't just travel; you feel the <span className="font-bold">Soul of India</span>. Our app connects you with ancient temples, vibrant art, and centuries-old traditions that shape the nation.
        </p>

        <blockquote className="my-8 p-6 bg-orange-50 dark:bg-gray-700/50 border-l-4 border-orange-500 italic text-gray-800 dark:text-gray-200 rounded-r-lg">
          <p className="text-xl">
            "Every mile is a story waiting to be told. Bharat Path guides you not just to destinations, but helps you unlock the secrets of India's rich culture and profound heritage."
          </p>
        </blockquote>
        
        <p className="text-md text-gray-600 dark:text-gray-400">
          Crafted by <span className="font-semibold text-orange-500">Shashank Mishra</span>, this app is the meeting point of technology and India's glorious history. Come, walk the true 'Path' of Bharat.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AppDetail;
