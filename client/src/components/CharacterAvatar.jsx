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
    back: -1,
    aura: -1,
    ...config
  };

  const activeAura = useMemo(() => {
    if (activeConfig.aura == null || activeConfig.aura === -1) return null;
    if (typeof activeConfig.aura === 'number') {
      return characterManifest.aura?.[activeConfig.aura] || null;
    }
    return characterManifest.aura?.find(
      a => a.id === activeConfig.aura
    ) || null;
  }, [activeConfig.aura]);

  const activeBack = useMemo(() => {
    if (activeConfig.back == null || activeConfig.back === -1) return null;
    if (typeof activeConfig.back === 'number') {
      return characterManifest.back?.[activeConfig.back] || null;
    }
    return characterManifest.back?.find(
      b => b.id === activeConfig.back
    ) || null;
  }, [activeConfig.back]);

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

  const renderAura = (layer, zIndex, scale = 0.68, bottom = -4) => {
    if (!layer) return null;
    return (
      <div
        key={`aura-layer-${zIndex}`}
        className="pointer-events-none select-none"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: bottom,
          width: layer.width,
          height: layer.frameHeight,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: 'center bottom',
          backgroundImage: `url(${layer.sheet})`,
          backgroundSize: '100% auto',
          backgroundRepeat: 'no-repeat',
          zIndex,
          imageRendering: 'pixelated',
          '--aura-height': `-${layer.sheetHeight}px`,
          animation: `anim-aura-step ${layer.duration || 0.45}s steps(${layer.frames || 4}) infinite`
        }}
      />
    );
  };

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <style>{`
        @keyframes nro-breathe {
          0%, 33%, 100% { transform: translateY(0); }
          50%, 85% { transform: translateY(-3px); }
        }
        .animate-nro-breathe {
          animation: nro-breathe 1.1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes nro-lightning-cycle {
          0%, 16.66% { background-position-y: 0%; }
          16.67%, 33.33% { background-position-y: 20%; }
          33.34%, 50% { background-position-y: 40%; }
          50.01%, 66.66% { background-position-y: 60%; }
          66.67%, 83.33% { background-position-y: 80%; }
          83.34%, 100% { background-position-y: 100%; }
        }
        .animate-nro-lightning {
          animation: nro-lightning-cycle 0.45s steps(1) infinite;
        }
        @keyframes anim-robot-cycle {
          from { background-position-y: 0px; }
          to { background-position-y: -1152px; }
        }
        @keyframes acc-anim-acc_mecha_saw {
          from { background-position-y: 0px; }
          to { background-position-y: -2240px; }
        }
        @keyframes acc-anim-acc_golden_spear {
          from { background-position-y: 0px; }
          to { background-position-y: -2240px; }
        }
        @keyframes acc-anim-acc_flame_sword {
          from { background-position-y: 0px; }
          to { background-position-y: -15480px; }
        }
        @keyframes acc-anim-acc_shadow_wings {
          from { background-position-y: 0px; }
          to { background-position-y: -520px; }
        }
        @keyframes acc-anim-acc_angel_wings {
          from { background-position-y: 0px; }
          to { background-position-y: -840px; }
        }
        @keyframes anim-head-nro_gogeta_ssj4 {
          from { background-position-y: 0px; }
          to { background-position-y: -248px; }
        }
        @keyframes anim-head-nro_set_ssj_blue_god {
          from { background-position-y: 0px; }
          to { background-position-y: -372px; }
        }
        @keyframes anim-set-nro_robot_pet {
          from { background-position-y: 0px; }
          to { background-position-y: -1152px; }
        }
        @keyframes anim-set-nro_pet_blue_dragon {
          from { background-position-y: 0px; }
          to { background-position-y: -1060px; }
        }
        @keyframes anim-set-nro_pet_mecha_drone {
          from { background-position-y: 0px; }
          to { background-position-y: -696px; }
        }
        @keyframes anim-set-nro_pet_teddy_bear {
          from { background-position-y: 0px; }
          to { background-position-y: -720px; }
        }
        @keyframes anim-set-nro_pet_pink_bunny {
          from { background-position-y: 0px; }
          to { background-position-y: -672px; }
        }
        @keyframes anim-set-nro_pet_green_frog {
          from { background-position-y: 0px; }
          to { background-position-y: -672px; }
        }
        @keyframes anim-aura-step {
          from { background-position-y: 0px; }
          to { background-position-y: var(--aura-height); }
        }
      `}</style>

      {activeSet ? (
        /* NRO Dragon Ball Set with Part-Based Breathing Animation */
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '6%',
            width: activeSet.width,
            height: activeSet.height,
            transform: `translateX(-50%) scale(${((size * 0.84) / activeSet.height) * (activeSet.scale || 1)})`,
            transformOrigin: 'center bottom'
          }}
        >
          {/* Hào quang nền (Aura Layer 0 - Behind character) */}
          {renderAura(activeAura?.layer0, 0, 0.68, -4)}
          {/* Phụ kiện sau lưng nhân vật (Back Accessory / Weapon) */}
          {activeBack && !activeSet.disableBack && activeSet.type !== 'animated' && (() => {
            const backScaleMultiplier = (activeSet.height || 144) / 144;
            const backScale = (activeBack.scale || 0.85) * backScaleMultiplier;
            const backOffsetX = ((activeBack.offsetX || 0) + (activeSet.backOffsetX || 0)) * backScaleMultiplier;
            const backOffsetY = ((activeBack.offsetY || 0) + (activeSet.backOffsetY || 0)) * backScaleMultiplier;

            return (
              <div
                className="pointer-events-none select-none"
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${backOffsetX}px)`,
                  top: `calc(38% + ${backOffsetY}px)`,
                  width: activeBack.frameWidth,
                  height: activeBack.frameHeight,
                  transform: `translate(-50%, -50%) scale(${backScale})`,
                  transformOrigin: 'center center',
                  backgroundImage: `url(${activeBack.sheet})`,
                  backgroundSize: '100% auto',
                  backgroundRepeat: 'no-repeat',
                  zIndex: 0,
                  imageRendering: 'pixelated',
                  animation: `acc-anim-${activeBack.id} ${activeBack.duration}s steps(${activeBack.frames}) infinite`
                }}
              />
            );
          })()}

          {/* Bóng nhân vật dưới chân (NRO paintShadow) */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: -4,
              transform: 'translateX(-50%)',
              width: activeSet.width * 0.48,
              height: 7,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              zIndex: 0
            }}
          />

          {activeSet.type === 'animated' ? (
            /* Nhân vật thuần Animation (như Robot) */
            <div
              className="pointer-events-none select-none"
              style={{
                position: 'absolute',
                left: '50%',
                bottom: 0,
                width: activeSet.width,
                height: activeSet.height,
                transform: 'translateX(-50%)',
                backgroundImage: `url(${activeSet.sheet})`,
                backgroundSize: '100% auto',
                backgroundRepeat: 'no-repeat',
                zIndex: 2,
                imageRendering: 'pixelated',
                animation: `anim-set-${activeSet.id} ${activeSet.duration || 0.8}s steps(${activeSet.frames}) infinite`
              }}
            />
          ) : (
            <>
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

              {/* Thân trên (Đầu + Áo nhún chung 1 khối đồng bộ tuyệt đối) */}
              <div
                className="animate-nro-breathe pointer-events-none select-none"
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 3
                }}
              >
                {/* Đầu / Tóc (Head behind collar, or in front if headOverShirt is true) */}
                {activeSet.head && (
                  <div
                    style={{
                      position: 'absolute',
                      left: activeSet.head.x,
                      top: activeSet.head.y,
                      width: activeSet.head.width,
                      height: activeSet.head.height,
                      zIndex: activeSet.headOverShirt ? 3 : 1
                    }}
                  >
                    {activeSet.head.sheet ? (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url(${activeSet.head.sheet})`,
                          backgroundSize: '100% auto',
                          backgroundRepeat: 'no-repeat',
                          imageRendering: 'pixelated',
                          animation: `anim-head-${activeSet.id} ${activeSet.head.duration || 0.45}s steps(${activeSet.head.frames}) infinite`
                        }}
                      />
                    ) : (
                      <img
                        src={activeSet.head.path}
                        alt="nro-head"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          imageRendering: 'pixelated'
                        }}
                        draggable={false}
                      />
                    )}
                  </div>
                )}

                {/* Áo (Torso on top of head collar and pants) */}
                {activeSet.shirt && (
                  <img
                    src={activeSet.shirt.path}
                    alt="nro-shirt"
                    style={{
                      position: 'absolute',
                      left: activeSet.shirt.x,
                      top: activeSet.shirt.y,
                      width: activeSet.shirt.width,
                      height: activeSet.shirt.height,
                      zIndex: 2,
                      imageRendering: 'pixelated'
                    }}
                    draggable={false}
                  />
                )}
              </div>

              {/* Hiệu ứng tia sét giật (NRO paintEff_Lvup_front) */}
              {activeSet.lightning && (
                <div
                  className="animate-nro-lightning pointer-events-none select-none"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: -8,
                    width: activeSet.width * 1.35,
                    height: (activeSet.width * 1.35 * 184) / 200,
                    transform: 'translateX(-50%)',
                    backgroundImage: `url(${activeSet.lightning})`,
                    backgroundSize: '100% 600%',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 4,
                    imageRendering: 'pixelated'
                  }}
                />
              )}
            </>
          )}

          {/* Hào quang tiền cảnh đè lên nhân vật (Aura Layer 1 - In front of character) */}
          {renderAura(activeAura?.layer1, 10, 0.68, -4)}
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
          {/* Hào quang nền (Aura Layer 0 - Behind character) */}
          {renderAura(activeAura?.layer0, 0, 0.65, 0)}

          {/* Phụ kiện sau lưng nhân vật (đồ lẻ: lật sang bên phải đối xứng) */}
          {activeBack && (
            <div
              className="pointer-events-none select-none"
              style={{
                position: 'absolute',
                left: `calc(50% + ${activeBack.standardOffsetX != null ? activeBack.standardOffsetX : -(activeBack.offsetX || 0)}px)`,
                top: `calc(48% + ${activeBack.standardOffsetY != null ? activeBack.standardOffsetY : (activeBack.offsetY || 0)}px)`,
                width: activeBack.frameWidth,
                height: activeBack.frameHeight,
                transform: `translate(-50%, -50%) scaleX(-1) scale(${activeBack.scale || 0.85})`,
                transformOrigin: 'center center',
                backgroundImage: `url(${activeBack.sheet})`,
                backgroundSize: '100% auto',
                backgroundRepeat: 'no-repeat',
                zIndex: 0,
                imageRendering: 'pixelated',
                animation: `acc-anim-${activeBack.id} ${activeBack.duration}s steps(${activeBack.frames}) infinite`
              }}
            />
          )}

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

          {/* Hào quang tiền cảnh đè lên nhân vật (Aura Layer 1 - In front of character) */}
          {renderAura(activeAura?.layer1, 25, 0.65, 0)}
        </div>
      )}
    </div>
  );
};

export default CharacterAvatar;
