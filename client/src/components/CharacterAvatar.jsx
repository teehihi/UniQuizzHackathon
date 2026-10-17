import React, { useMemo } from 'react';
import characterManifest from '../assets/characterManifest.json';

/* ================= SLOT STYLES ================= */
const SLOTS = {
  base: {
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      zIndex: 0
    }
  },

  pants: {
    style: {
      position: 'absolute',
      top: '66%',
      left: '46%',
      width: '35%',
      transform: 'translateX(-50%)',
      zIndex: 4
    }
  },

  shoes: {
    style: {
      position: 'absolute',
      top: '95%',
      left: '46%',
      width: '32%',
      transform: 'translateX(-50%)',
      zIndex: 5
    }
  },

  shirts: {
    style: {
      position: 'absolute',
      top: '42%',
      left: '50%',
      width: '45%',
      transform: 'translateX(-50%)',
      zIndex: 6
    }
  },

  head: {
    style: {
      position: 'absolute',
      top: '9%',
      left: '50%',
      width: '38%',
      transform: 'translateX(-50%)',
      zIndex: 10
    }
  },

  hat: {
    style: {
      position: 'absolute',
      top: '6%',
      left: '50%',
      width: '45%',
      transform: 'translateX(-50%)',
      zIndex: 20
    }
  }
};

/* ================= COMPONENT ================= */

const CharacterAvatar = ({ config, size = 200, className = '' }) => {
  const activeConfig = {
    skin: 0,
    face: 0,
    hat: -1,
    shirts: 0,
    pants: -1,
    shoes: -1,
    set: -1,
    ...config
  };

  const activeSet = useMemo(() => {
    if (activeConfig.set == null || activeConfig.set === -1) return null;
    if (typeof activeConfig.set === 'number') {
      return characterManifest.sets?.[activeConfig.set] || null;
    }
    return characterManifest.sets?.find(
      s => s.id === activeConfig.set || s.key === activeConfig.set
    ) || null;
  }, [activeConfig.set]);

  const defaultShirtIndex = useMemo(() => {
    return characterManifest.shirts.findIndex(
      s => s.filename === 'aohub.svg'
    );
  }, []);

  const layers = useMemo(() => {
    if (activeSet) return [];

    const list = [];

    /* ===== BASE BODY ===== */
    list.push({
      src: '/character/nochain_body.svg',
      type: 'base'
    });

    /* ===== CLOTHES ===== */
    if (
      activeConfig.pants !== -1 &&
      characterManifest.pants[activeConfig.pants]
    ) {
      list.push({
        src: characterManifest.pants[activeConfig.pants].path,
        type: 'pants'
      });
    }

    if (
      activeConfig.shoes !== -1 &&
      characterManifest.shoes[activeConfig.shoes]
    ) {
      list.push({
        src: characterManifest.shoes[activeConfig.shoes].path,
        type: 'shoes'
      });
    }

    let shirtIdx = activeConfig.shirts;
    if (shirtIdx === -1 || shirtIdx == null) {
      shirtIdx = defaultShirtIndex;
    }

    if (shirtIdx !== -1 && characterManifest.shirts[shirtIdx]) {
      list.push({
        src: characterManifest.shirts[shirtIdx].path,
        type: 'shirts'
      });
    }

    /* ===== HEAD (SEPARATED SVG) ===== */
    list.push({
      src: '/character/nochain_head.svg',
      type: 'head'
    });

    /* ===== HAT ===== */
    if (activeConfig.hat !== -1 && characterManifest.hat[activeConfig.hat]) {
      list.push({
        src: characterManifest.hat[activeConfig.hat].path,
        type: 'hat'
      });
    }

    return list;
  }, [activeConfig, defaultShirtIndex, activeSet]);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {activeSet ? (
        /* NRO Dragon Ball Set with Part-Based Breathing Animation */
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '6%',
            width: activeSet.width,
            height: activeSet.height,
            transform: `translateX(-50%) scale(${(size * 0.84) / activeSet.height})`,
            transformOrigin: 'center bottom'
          }}
        >
          <style>{`
            @keyframes nro-breathe {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-2px); }
            }
            .animate-nro-breathe {
              animation: nro-breathe 1.2s ease-in-out infinite;
            }
          `}</style>

          {/* Đầu / Tóc (Head with breathing animation behind collar) */}
          {activeSet.head && (
            <img
              src={activeSet.head.path}
              alt="nro-head"
              className="animate-nro-breathe pointer-events-none select-none"
              style={{
                position: 'absolute',
                left: activeSet.head.x,
                top: activeSet.head.y,
                width: activeSet.head.width,
                height: activeSet.head.height,
                zIndex: 1,
                imageRendering: 'pixelated'
              }}
              draggable={false}
            />
          )}

          {/* Quần (Legs fixed on ground) */}
          {activeSet.pants && (
            <img
              src={activeSet.pants.path}
              alt="nro-pants"
              style={{
                position: 'absolute',
                left: activeSet.pants.x,
                top: activeSet.pants.y,
                width: activeSet.pants.width,
                height: activeSet.pants.height,
                zIndex: 2,
                imageRendering: 'pixelated'
              }}
              draggable={false}
              className="pointer-events-none select-none"
            />
          )}

          {/* Áo (Torso with breathing animation on top of head collar and pants) */}
          {activeSet.shirt && (
            <img
              src={activeSet.shirt.path}
              alt="nro-shirt"
              className="animate-nro-breathe pointer-events-none select-none"
              style={{
                position: 'absolute',
                left: activeSet.shirt.x,
                top: activeSet.shirt.y,
                width: activeSet.shirt.width,
                height: activeSet.shirt.height,
                zIndex: 3,
                imageRendering: 'pixelated'
              }}
              draggable={false}
            />
          )}
        </div>
      ) : (
        /* SCALE NHÂN VẬT – KHÔNG SCALE KHUNG */
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'scale(0.8)',
            transformOrigin: 'center top'
          }}
        >
          {layers.map((layer, idx) => {
            const style =
              SLOTS[layer.type]?.style || SLOTS.base.style;

            return (
              <img
                key={`${layer.type}-${idx}`}
                src={layer.src}
                alt={layer.type}
                style={style}
                draggable={false}
                className="pointer-events-none select-none"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CharacterAvatar;
