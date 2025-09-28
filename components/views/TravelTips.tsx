import React from 'react';
import { TravelTipsIcon } from '../icons/Icons';

const travelTipsData = [
  {
    category: 'Packing Essentials',
    tips: [
      { title: 'Light Clothing', content: 'Pack breathable fabrics like cotton and linen for the daytime heat. Include a light jacket or shawl for cooler evenings, especially in the north.' },
      { title: 'Comfortable Footwear', content: 'You\'ll be doing a lot of walking. Bring sturdy, comfortable shoes. Also, pack sandals or slip-ons that are easy to remove when entering temples and homes.' },
      { title: 'Universal Adapter', content: 'India uses Type C, D, and M outlets. A universal travel adapter is a must to keep your devices charged.' },
      { title: 'Medication and First-Aid', content: 'Bring any personal medication, plus a basic first-aid kit with essentials like pain relievers, antiseptic wipes, and stomach remedies.' },
    ]
  },
  {
    category: 'Health & Safety',
    tips: [
      { title: 'Stay Hydrated Safely', content: 'Drink only bottled or purified water from sealed bottles. Avoid tap water, even for brushing your teeth. Dehydration is a common issue for travelers.' },
      { title: 'Street Food Caution', content: 'While delicious, be selective. Eat from busy stalls where food is cooked fresh in front of you. Avoid raw salads or pre-cut fruit that may have been washed in tap water.' },
      { title: 'Bargain Respectfully', content: 'Bargaining is common in local markets. Do it with a smile and a friendly attitude. Start at about half the asking price and meet somewhere in the middle.' },
      { title: 'Secure Your Valuables', content: 'Be mindful of your belongings in crowded places. Use a money belt or a secure bag. Avoid displaying expensive gadgets or jewelry openly.' },
    ]
  },
  {
    category: 'Cultural Etiquette',
    tips: [
      { title: 'Dress Modestly', content: 'When visiting religious sites (temples, mosques, etc.), it\'s important to cover your shoulders and knees. Carrying a scarf or shawl is a good idea to cover your head when required.' },
      { title: 'Use Your Right Hand', content: 'In Indian culture, the left hand is considered unclean. Always use your right hand for eating, shaking hands, and giving or receiving items.' },
      { title: 'Respect Elders', content: 'Elders are highly respected. It\'s customary to greet them first. A simple "Namaste" (placing palms together at the chest and bowing slightly) is a universally accepted greeting.' },
      { title: 'Photography Permissions', content: 'Always ask for permission before taking photos of people. Photography might be prohibited in some temples or sensitive areas, so look for signs.' },
    ]
  },
  {
    category: 'Useful Hindi Phrases',
    tips: [
        { title: 'Namaste (नमस्ते)', content: 'A respectful greeting for "Hello" and "Goodbye".' },
        { title: 'Dhanyavaad (धन्यवाद)', content: 'Means "Thank you".' },
        { title: 'Aap kaise hain? (आप कैसे हैं?)', content: 'A formal way of asking "How are you?".' },
        { title: 'Kitna hua? (कितना हुआ?)', content: 'Means "How much is this?". Use this when shopping.' },
        { title: 'Madad (मदद)', content: 'Means "Help".' },
    ]
  }
];

const TipCard: React.FC<{ title: string; content: string }> = ({ title, content }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-orange-600 dark:text-orange-400">{title}</h4>
        <p className="text-gray-600 dark:text-gray-300 mt-1">{content}</p>
    </div>
);


const TravelTips: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-orange-100 dark:bg-orange-900/50 rounded-full mb-4">
            <TravelTipsIcon />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Essential Travel Tips</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Your guide to a safe, respectful, and unforgettable journey through India.
        </p>
      </div>

      <div className="space-y-8">
        {travelTipsData.map((categoryData) => (
          <section key={categoryData.category}>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 pb-2 border-b-2 border-orange-500">
              {categoryData.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryData.tips.map((tip) => (
                <TipCard key={tip.title} title={tip.title} content={tip.content} />
              ))}
            </div>
          </section>
        ))}
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

export default TravelTips;