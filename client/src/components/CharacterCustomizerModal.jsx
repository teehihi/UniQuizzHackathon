import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterAvatar from './CharacterAvatar';
import characterManifest from '../assets/characterManifest.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDice, faSave, faUser, faTshirt, faShoePrints, faSmile, faHatCowboy, faBoxOpen } from '@fortawesome/free-solid-svg-icons';

const TABS = [
  { id: 'bundle', icon: faBoxOpen, label: 'Set đồ' },
  { id: 'hat', icon: faHatCowboy, label: 'Mũ' },
  { id: 'shirts', icon: faTshirt, label: 'Áo' },
  { id: 'pants', icon: 'P', label: 'Quần' }, // Custom icon text P
  { id: 'shoes', icon: faShoePrints, label: 'Giày' },
];

const CharacterCustomizerModal = ({ isOpen, onClose, initialConfig, onSave }) => {
  const [config, setConfig] = useState(initialConfig || {
    skin: 0, face: 0, hat: -1, shirts: 0, pants: -1, shoes: -1, bundle: -1
  });
  const [activeTab, setActiveTab] = useState('shirts');

  // Load default if needed
  useEffect(() => {
      // Ensure 'aohub' is active shirt if nothing else, handled by Avatar render but keeping state consistent is good.
      // But we allow state to be anything.
  }, []);

  if (!isOpen) return null;

  const handleSelectItem = (index) => {
      if (activeTab === 'bundle') {
          // Select bundle, clear clothes
          setConfig(prev => ({ 
              ...prev, 
              bundle: index,
              shirts: -1,
              pants: -1,
              shoes: -1
          }));
      } else if (['shirts', 'pants', 'shoes'].includes(activeTab)) {
          // Select clothes, clear bundle
          setConfig(prev => ({
              ...prev,
              [activeTab]: index,
              bundle: -1
          }));
      } else {
          // Others (Skin, Face, Hat)
          setConfig(prev => ({ ...prev, [activeTab]: index }));
      }
  };

  const handleRandomize = () => {
    // Logic: Randomize everything. 
    // 20% chance for Bundle?
    const useBundle = Math.random() < 0.2;
    const newConfig = {
        skin: 0, // Fixed
        face: 0, // Fixed
        hat: Math.random() < 0.5 ? -1 : Math.floor(Math.random() * (characterManifest.hat?.length || 1)),
    };

    if (useBundle && characterManifest.bundle?.length > 0) {
        newConfig.bundle = Math.floor(Math.random() * characterManifest.bundle.length);
        newConfig.shirts = -1;
        newConfig.pants = -1;
        newConfig.shoes = -1;
    } else {
        newConfig.bundle = -1;
        newConfig.shirts = Math.floor(Math.random() * (characterManifest.shirts?.length || 1));
        newConfig.pants = Math.random() < 0.3 ? -1 : Math.floor(Math.random() * (characterManifest.pants?.length || 1));
        newConfig.shoes = Math.random() < 0.3 ? -1 : Math.floor(Math.random() * (characterManifest.shoes?.length || 1));
    }
    setConfig(newConfig);
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const items = characterManifest[activeTab] || [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[600px] border border-gray-700"
      >
        {/* Left Panel: Controls */}
        <div className="flex-1 flex flex-col border-r border-gray-700 bg-[#222]">
          {/* Tabs */}
          <div className="flex p-2 gap-2 bg-[#2a2a2a] overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-xl flex items-center justify-center min-w-[50px] transition-all
                  ${activeTab === tab.id 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                title={tab.label}
              >
                {typeof tab.icon === 'string' ? <span className="font-bold">{tab.icon}</span> : <FontAwesomeIcon icon={tab.icon} />}
              </button>
            ))}
          </div>

          {/* Grid Selection */}
          <div className="flex-1 p-4 overflow-y-auto grid grid-cols-4 gap-3 content-start">
            {/* None Option for Hat, Shoes, Pants? */}
            {(activeTab === 'hat' || activeTab === 'pants' || activeTab === 'shoes' || activeTab === 'bundle') && (
                <button
                    onClick={() => handleSelectItem(-1)}
                    className={`aspect-square rounded-xl flex items-center justify-center border-2 border-dashed border-gray-600 text-gray-500 hover:border-gray-400 hover:text-white
                    ${config[activeTab] === -1 ? 'bg-gray-700 border-solid border-purple-500 text-purple-400' : ''}`}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            )}

            {items.map((item, index) => {
                // If item is Skin (object with id), use a representative part?
                // Or just render using Avatar with Isolated Mode.
                // For Skin, it has `parts.head`.
                return (
                    <button
                        key={index}
                        onClick={() => handleSelectItem(index)}
                        className={`aspect-square rounded-xl flex items-center justify-center relative overflow-hidden group transition-all p-2
                        ${config[activeTab] === index 
                            ? 'bg-purple-900/50 border-2 border-purple-500' 
                            : 'bg-gray-800 border border-gray-700 hover:border-gray-500'}`}
                    >
                        {/* Display Image directly from source, easier than full Avatar for small icon */}
                        {/* For Skin: Use head part. For others: Use main path */}
                        <img 
                            src={activeTab === 'skin' ? item.parts.head : item.path} 
                            alt={item.id}
                            className="w-full h-full object-contain drop-shadow-md"
                        />
                    </button>
                );
            })}
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="w-full md:w-[400px] bg-gradient-to-b from-gray-900 to-black relative flex flex-col items-center justify-center p-8">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>

          {/* Spotlight Effect */}
          <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-purple-500/20 to-transparent blur-3xl pointer-events-none"></div>

          <div className="relative z-10 mb-8">
            <CharacterAvatar config={config} size={300} />
          </div>

          <div className="flex gap-4 w-full px-8">
            <button 
              onClick={handleRandomize}
              className="px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
              title="Ngẫu nhiên"
            >
              <FontAwesomeIcon icon={faDice} size="lg" />
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faSave} /> Lưu Qbit của tôi
            </button>
          </div>
          
          <p className="mt-4 text-xs text-gray-500 text-center">
            Qbit sẽ đại diện cho bạn trong phòng chơi.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CharacterCustomizerModal;
