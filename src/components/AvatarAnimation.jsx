// src/components/AvatarAnimation.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";

const BOT_COLORS = {
  empathy:  { start: "#FFB6C1", end: "#FF8FB1" },
  insight:  { start: "#7AC2DD", end: "#5A8CF2" },
  solution: { start: "#3AA87A", end: "#9AE6B4" },
  cognitive:{ start: "#7A4DC8", end: "#B794F4" },
  default:  { start: "#667eea", end: "#764ba2" },
};

const AudioController = (() => {
  let audio = null;
  let playingToken = 0;
  let muted = false;

  function ensure() {
    if (!audio) {
      audio = new Audio();
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      audio.muted = muted;
    }
    return audio;
  }
  async function play(dataUrl) {
    const a = ensure();
    const myToken = ++playingToken;
    try {
      a.pause();
      a.currentTime = 0;
      a.src = dataUrl;
      a.muted = muted;
      a.load();
      const p = a.play();
      if (p && typeof p.then === "function") await p;

      if (myToken === playingToken) {
        await new Promise((resolve) => {
          const onEnd = () => {
            a.removeEventListener("ended", onEnd);
            resolve();
          };
          a.addEventListener("ended", onEnd, { once: true });
        });
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      throw err;
    }
  }
  function stop() {
    const a = ensure();
    playingToken++;
    a.pause();
  }
  function isSpeaking() {
    const a = ensure();
    return !a.paused;
  }
  function setMuted(v) {
    muted = !!v;
    const a = ensure();
    a.muted = muted;
  }
  function getMuted() {
    return muted;
  }
  return { play, stop, isSpeaking, setMuted, getMuted };
})();

const breathe = keyframes`
  0%   { transform: scale(1) translateZ(0); opacity: .22; }
  50%  { transform: scale(1.4) translateZ(0); opacity: .4; }
  100% { transform: scale(1) translateZ(0); opacity: .22; }
`;

const ripple = keyframes`
  0%   { transform: scale(0.8) translateZ(0); opacity: .4; }
  80%  { transform: scale(2.5) translateZ(0); opacity: 0; }
  100% { transform: scale(2.5) translateZ(0); opacity: 0; }
`;

const pulse = keyframes`
  0%,100% { transform: scale(1) translateZ(0); }
  50%     { transform: scale(1.04) translateZ(0); }
`;

const float = keyframes`
  0%,100% { transform: translateY(0px) translateZ(0); }
  50%     { transform: translateY(-2px) translateZ(0); }
`;

const shimmer = keyframes`
  0%   { transform: translateX(-100%) translateZ(0); }
  100% { transform: translateX(100%) translateZ(0); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg) translateZ(0); }
  to   { transform: rotate(360deg) translateZ(0); }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
  }
`;

const GlowStage = styled.div`
  position: absolute;
  inset: -45px;
  display: ${p => p.$speaking ? 'grid' : 'none'};
  place-items: center;
  pointer-events: none;
  z-index: 0;
  opacity: ${p => p.$speaking ? 1 : 0};
  transition: opacity .4s ease;
  
  @media (max-width: 768px) {
    inset: -38px;
  }
`;

const GlowCore = styled.div`
  position: absolute;
  width: 145px;
  height: 145px;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    ${p => p.$start}32 0%,
    ${p => p.$end}20 35%,
    ${p => p.$start}10 60%,
    transparent 80%
  );
  filter: blur(32px);
  will-change: transform, opacity;
  ${css`animation: ${breathe} 2.8s ease-in-out infinite;`}
  
  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
    filter: blur(28px);
  }
`;

const GlowSecondary = styled.div`
  position: absolute;
  width: 165px;
  height: 165px;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    transparent 25%,
    ${p => p.$color}15 55%,
    transparent 80%
  );
  filter: blur(42px);
  animation-delay: .2s;
  will-change: transform, opacity;
  ${css`animation: ${breathe} 3.2s ease-in-out infinite;`}
  
  @media (max-width: 768px) {
    width: 135px;
    height: 135px;
    filter: blur(36px);
  }
`;

const Ripple = styled.div`
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 1px solid ${p => p.$color}35;
  opacity: 0;
  animation-delay: ${p => p.$delay || "0s"};
  will-change: transform, opacity;
  ${css`animation: ${ripple} 2.6s cubic-bezier(.4,0,.6,1) infinite;`}
  
  @media (max-width: 768px) {
    width: 90px;
    height: 90px;
  }
`;

const ParticleOrbit = styled.div`
  position: absolute;
  width: 85px;
  height: 85px;
  will-change: transform, opacity;
  ${css`animation: ${rotate} 13s linear infinite;`}
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 50%;
    width: 4px;
    height: 4px;
    margin-left: -2px;
    border-radius: 50%;
    background: ${p => p.$color};
    box-shadow: 0 0 10px ${p => p.$color}90;
    opacity: .2;
  }
  
  @media (max-width: 768px) {
    width: 70px;
    height: 70px;
    
    &::before {
      width: 3px;
      height: 3px;
    }
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  z-index: 2;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,.06));
  backdrop-filter: blur(12px) saturate(1.3);
  box-shadow: 
    0 6px 24px rgba(0,0,0,.11),
    0 2px 8px rgba(0,0,0,.07),
    inset 0 1px 0 rgba(255,255,255,.28),
    inset 0 -1px 0 rgba(0,0,0,.04);
  transition: all .35s cubic-bezier(.4,0,.2,1);
  will-change: transform;
  ${p => p.$speaking 
    ? css`animation: ${pulse} 2.6s ease-in-out infinite, ${float} 4.2s ease-in-out infinite;`
    : css`animation: ${float} 5.5s ease-in-out infinite;`
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 18px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(255,255,255,.35), rgba(255,255,255,.08));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: .6;
  }
  
  &:hover {
    transform: scale(1.06) translateZ(0);
    box-shadow: 
      0 10px 32px rgba(0,0,0,.14),
      0 4px 12px rgba(0,0,0,.09),
      inset 0 1px 0 rgba(255,255,255,.35);
  }
  
  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    border-radius: 16px;
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
`;

const AvatarFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => p.$bg || "linear-gradient(135deg, #7AC2DD, #5A8CF2)"};
  color: #fff;
  font-weight: 800;
  font-size: 28px;
  text-shadow: 0 2px 8px rgba(0,0,0,.22);
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const AudioControl = styled.button`
  position: absolute;
  bottom: -7px;
  right: -7px;
  width: 26px;
  height: 26px;
  border-radius: 9px;
  background: ${p => p.$muted 
    ? 'linear-gradient(135deg, rgba(156,163,175,.96), rgba(107,114,128,.96))'
    : `linear-gradient(135deg, ${p.$start}f8, ${p.$end}f8)`
  };
  backdrop-filter: blur(12px) saturate(1.4);
  border: 0;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 
    0 3px 12px rgba(0,0,0,.18),
    0 1px 4px rgba(0,0,0,.12),
    inset 0 1px 0 rgba(255,255,255,.32);
  transition: all .25s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
  will-change: transform;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(255,255,255,.28) 50%,
      transparent 100%
    );
    transform: translateX(-100%);
    transition: transform .45s ease;
  }
  
  &:hover {
    transform: scale(1.12) translateY(-1px) translateZ(0);
    box-shadow: 
      0 5px 18px rgba(0,0,0,.22),
      0 2px 6px rgba(0,0,0,.15),
      inset 0 1px 0 rgba(255,255,255,.42);
    
    &::before {
      ${css`animation: ${shimmer} 1.1s ease;`}
    }
  }
  
  &:active {
    transform: scale(1.03) translateZ(0);
  }
  
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 13px;
    bottom: -6px;
    right: -6px;
  }
`;

const StatusDot = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10B981, #34D399);
  box-shadow: 
    0 0 0 2.5px rgba(255,255,255,.95),
    0 2px 8px rgba(16,185,129,.45);
  opacity: ${p => p.$visible ? 1 : 0};
  transform: scale(${p => p.$visible ? 1 : 0.8});
  transition: all .35s cubic-bezier(.4,0,.2,1);
  z-index: 10;
  will-change: opacity, transform;
  ${p => p.$visible && css`animation: ${pulse} 2.2s ease-in-out infinite;`}
  
  @media (max-width: 768px) {
    width: 11px;
    height: 11px;
    top: -4px;
    right: -4px;
  }
`;

async function fetchAnimation({ apiBase, text, botType }) {
  console.log("🎤 Fetching animation with botType:", botType);
  
  const res = await fetch(`${apiBase.replace(/\/+$/, "")}/api/chat/avatar/animate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      text: text,
      bot_type: botType
    }),
  });
  
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  
  console.log("🎤 API Response meta:", data.meta);
  return data;
}

export default function AvatarAnimation({
  apiBase = import.meta.env.VITE_API_BASE || "https://emobot-backend.onrender.com",
  text,
  botType = (localStorage.getItem("selectedBotType") || "solution"),
  avatarSrc = (localStorage.getItem("selectedBotImage") || ""),
  onError,
  showAudioControl = true,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(AudioController.getMuted());
  const [colors, setColors] = useState(BOT_COLORS[botType] || BOT_COLORS.default);
  const lastReqRef = useRef(0);
  const lastTextRef = useRef("");

  useEffect(() => {
    const c = BOT_COLORS[botType] || BOT_COLORS.default;
    setColors(c);
  }, [botType]);

  useEffect(() => {
    const trimmedText = (text || "").trim();
    
    if (!trimmedText || trimmedText === lastTextRef.current) {
      return;
    }
    
    lastTextRef.current = trimmedText;
    
    let cancelled = false;
    const myId = ++lastReqRef.current;

    console.log("🔊 Starting TTS for:", trimmedText.substring(0, 50));
    AudioController.stop();

    (async () => {
      try {
        const data = await fetchAnimation({ apiBase, text: trimmedText, botType });
        if (cancelled || myId !== lastReqRef.current) return;

        const b64 = data?.audio_base64;
        const speaking = !!b64;
        setIsSpeaking(speaking);

        if (b64) {
          try {
            await AudioController.play(b64);
          } finally {
            if (!cancelled && myId === lastReqRef.current) {
              setIsSpeaking(false);
            }
          }
        } else {
          setIsSpeaking(false);
        }
      } catch (e) {
        const msg = e?.message || "動畫/語音取得失敗";
        onError?.(msg);
        setIsSpeaking(false);
      }
    })();

    return () => {
      cancelled = true;
      AudioController.stop();
      setIsSpeaking(false);
    };
  }, [text, botType, apiBase, onError]);

  const toggleMute = () => {
    const v = !muted;
    AudioController.setMuted(v);
    setMuted(v);
  };

  const usedAvatar = useMemo(() => {
    if (avatarSrc && typeof avatarSrc === "string" && avatarSrc.startsWith("data:")) return avatarSrc;
    if (avatarSrc && typeof avatarSrc === "string" && avatarSrc.length > 4) return avatarSrc;
    return "";
  }, [avatarSrc]);

  const botLetter = useMemo(() => {
    const typeMap = {
      empathy: "L",
      insight: "S",
      solution: "N",
      cognitive: "C"
    };
    return typeMap[botType] || "A";
  }, [botType]);

  return (
    <AvatarContainer>
      {isSpeaking && (
        <GlowStage $speaking={isSpeaking} aria-hidden="true">
          <GlowCore $start={colors.start} $end={colors.end} />
          <GlowSecondary $color={colors.end} />
          <Ripple $color={colors.start} $delay="0s" />
          <Ripple $color={colors.end}   $delay=".45s" />
          <Ripple $color={colors.start} $delay=".9s" />
          <ParticleOrbit $color={colors.start} />
        </GlowStage>
      )}

      <AvatarWrapper $speaking={isSpeaking}>
        {usedAvatar ? (
          <AvatarImage src={usedAvatar} alt="avatar" />
        ) : (
          <AvatarFallback $bg={`linear-gradient(135deg, ${colors.start}, ${colors.end})`}>
            {botLetter}
          </AvatarFallback>
        )}
      </AvatarWrapper>

      <StatusDot $visible={isSpeaking} />

      {showAudioControl && (
        <AudioControl 
          onClick={toggleMute} 
          $start={colors.start} 
          $end={colors.end}
          $muted={muted}
          title={muted ? "取消靜音" : "靜音"}
          aria-label={muted ? "取消靜音" : "靜音"}
        >
          {muted ? <HiVolumeOff /> : <HiVolumeUp />}
        </AudioControl>
      )}
    </AvatarContainer>
  );
}