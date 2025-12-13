import React, { useMemo } from 'react';
import characterManifest from '../assets/characterManifest.json';

// Slot Configurations & Styles
// All values are percentages relative to the container 200x200
const SLOTS = {
  base: {
    style: {
      position: 'absolute',
      top: '0%',
      left: '0%',
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      zIndex: 0
    }
  },
  headOverlay: {
    style: {
      position: 'absolute',
      top: '0%',
      left: '0%',
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      zIndex: 11, // Above Shirt
      clipPath: 'ellipse(24% 20% at 50% 21%)' // Tighter crop around head/chin
    }
  },
  pants: {
    style: {
      position: 'absolute',
      top: '63%',
      left: '50%',
      width: '48%',
      transform: 'translateX(-50%)',
      zIndex: 5
    }
  },
  shoes: {
    style: {
      position: 'absolute',
      top: '85%',
      left: '50%',
      width: '45%',
      transform: 'translateX(-50%)',
      zIndex: 6
    }
  },
  shirts: {
    style: {
      position: 'absolute',
      top: '42%',
      left: '50%',
      width: '45%',
      transform: 'translateX(-50%)',
      zIndex: 10
    }
  },
  bundle: {
    style: {
      position: 'absolute',
      top: '10%',
      left: '50%',
      width: '80%',
      height: '90%',
      transform: 'translateX(-50%)',
      zIndex: 8
    }
  },
  hat: {
    style: {
      position: 'absolute',
      top: '-5%',
      left: '50%',
      width: '50%',
      transform: 'translateX(-50%)',
      zIndex: 20
    }
  }
};

const CharacterAvatar = ({ config, size = 200, className }) => {
  const activeConfig = {
    skin: 0,
    face: 0,
    hat: -1,
    shirts: 0,
    pants: -1,
    shoes: -1,
    bundle: -1,
    ...config
  };

  const defaultShirtIndex = useMemo(() => {
    return characterManifest.shirts.findIndex(s => s.filename === 'aohub.svg');
  }, []);

  const layers = useMemo(() => {
    const list = [
      { src: '/character/nochain.svg', type: 'base' },
      // Head Overlay to cover shirt collar
      { src: '/character/nochain.svg', type: 'headOverlay' }
    ];

    // 1. SKIN - Removed separate parts, using base body.

    // 2. FACE - Removed as per request

    // 3. CLOTHING / BUNDLE
    if (activeConfig.bundle !== undefined && activeConfig.bundle !== -1) {
      const bundleAsset = characterManifest.bundle[activeConfig.bundle];
      if (bundleAsset) {
        list.push({ src: bundleAsset.path, type: 'bundle' });
      }
    } else {
      // Shoes
      if (activeConfig.shoes !== -1 && characterManifest.shoes[activeConfig.shoes]) {
        list.push({ src: characterManifest.shoes[activeConfig.shoes].path, type: 'shoes' });
      }

      // Pants
      if (activeConfig.pants !== -1 && characterManifest.pants[activeConfig.pants]) {
        list.push({ src: characterManifest.pants[activeConfig.pants].path, type: 'pants' });
      }

      // Shirts
      let shirtIdx = activeConfig.shirts;
      if (shirtIdx === undefined || shirtIdx === -1) shirtIdx = defaultShirtIndex;
      if (shirtIdx !== -1 && characterManifest.shirts[shirtIdx]) {
        list.push({ src: characterManifest.shirts[shirtIdx].path, type: 'shirts' });
      }
    }

    // 4. HAT
    if (activeConfig.hat !== -1 && characterManifest.hat[activeConfig.hat]) {
      list.push({ src: characterManifest.hat[activeConfig.hat].path, type: 'hat' });
    }

    return list;
  }, [activeConfig, defaultShirtIndex]);

  return (
    <div className={`relative ${className} bg-gray-900/10 rounded-full overflow-hidden`} style={{ width: size, height: size }}>
      {/* Background circle? Optional */}
      {layers.map((layer, idx) => {
        const slotConfig = SLOTS[layer.type] || {};
        const style = slotConfig.style || {
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }; // Fallback to full

        return (
          <img
            key={`${layer.type}-${idx}`}
            src={layer.src}
            style={style}
            alt={layer.type}
            className="pointer-events-none"
          />
        );
      })}
    </div>
  );
};

export default CharacterAvatar;
