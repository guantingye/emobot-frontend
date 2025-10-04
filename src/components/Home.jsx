// src/components/Home.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import homeBackground from "../assets/Home_background.png";
import homeP1 from "../assets/Home_p1.png";
import bot1 from "../assets/bot1.png";
import bot2 from "../assets/bot2.png";
import bot6 from "../assets/bot6.png";
import bot4 from "../assets/bot4.png";
import userIcon from "../assets/profile.png";
import { MdEmojiPeople, MdChat, MdFavorite, MdPsychology } from "react-icons/md";
import { FiX, FiMail, FiFileText, FiShield } from "react-icons/fi";
import logoIcon from "../assets/logofig.png";
import PersonaModal from "./PersonaModal";
import personas from "../data/botPersonas";

/* ================= 視覺動效 ================= */
const shimmer = keyframes`
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
`;
const pulseGlow = keyframes`
  0%, 100% { transform: translate(-50%, -50%) scale(0.98); opacity: .18; filter: blur(26px); }
  50% { transform: translate(-50%, -50%) scale(1.06); opacity: .34; filter: blur(18px); }
`;
const floatY = keyframes` 0%,100% { transform: translateY(0) } 50% { transform: translateY(-2px) } `;
const borderShift = keyframes` 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } `;
const fadeIn = keyframes` from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } `;

/* ================ 基礎樣式(保留) ================ */
const Container = styled.div`
  width: 100vw;
  font-family: "Noto Sans TC", sans-serif;
  overflow-x: hidden;
`;

const Header = styled.header`
  width: 100%;
  height: 70px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  position: fixed;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 20px rgba(43, 57, 147, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(43, 57, 147, 0.1);
  @media (max-width: 768px) { height: 60px; padding: 0 16px; }
  @media (max-width: 480px) { height: 55px; padding: 0 12px; }
`;

const Logo = styled.div`
  font-size: 35px; font-weight: bold; color: #2b3993; display: flex; align-items: center; cursor: pointer;
  transition: all 0.3s ease; text-shadow: 0 2px 4px rgba(43, 57, 147, 0.1);
  &:hover { transform: scale(1.05); color: #1e2a6b; }
  img { height: 68px; margin-right: 8px; filter: drop-shadow(0 2px 4px rgba(43, 57, 147, 0.1)); }
  @media (max-width: 768px) { font-size: 24px; img { height: 48px; margin-right: 6px; } }
  @media (max-width: 480px) { font-size: 20px; img { height: 40px; margin-right: 4px; } }
`;

const Nav = styled.nav`
  display: flex; gap: 40px; font-size: 26px; font-weight: bold; color: black;
  div {
    cursor: pointer; transition: all 0.3s ease; position: relative; padding: 8px 0;
    &:hover { color: #2b3993; transform: translateY(-2px); }
    &:active { transform: translateY(1px); }
    &:hover::after { width: 100%; }
    &::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: linear-gradient(90deg, #2b3993, #667eea); transition: width 0.3s ease; }
  }
  @media (max-width: 900px) { gap: 20px; font-size: 20px; }
  @media (max-width: 768px) { gap: 16px; font-size: 16px; }
  @media (max-width: 480px) { display: none; }
`;

const AvatarImg = styled.img`
  width: 50px; height: 50px; border-radius: 50%; transition: all 0.3s ease;
  border: 2px solid rgba(43, 57, 147, 0.1); box-shadow: 0 4px 12px rgba(43, 57, 147, 0.1);
  &:hover { transform: scale(1.08); box-shadow: 0 8px 20px rgba(43, 57, 147, 0.2); border-color: rgba(43, 57, 147, 0.3); }
  @media (max-width: 768px) { width: 40px; height: 40px; }
  @media (max-width: 480px) { width: 36px; height: 36px; margin-right: +15px; }
`;

const RightSection = styled.div`
  display: flex; align-items: center; gap: 30px; margin-left: auto; margin-right: 40px;
  @media (max-width: 768px) { gap: 16px; margin-right: 0; }
  @media (max-width: 480px) { gap: 12px; }
`;

const HeroSection = styled.section`
  height: 100vh;
  background-image: url(${homeBackground});
  background-size: cover;
  background-position: center;
  display: flex; flex-direction: column; justify-content: flex-start;
  padding: 180px 0 0 95px; gap: 30px; position: relative;

  &::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(43,57,147,0.05) 0%, rgba(103,126,234,0.08) 30%, rgba(118,75,162,0.06) 70%, transparent 100%);
    pointer-events: none;
  }
  &::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 150px;
    background: linear-gradient(to bottom, transparent 0%, rgba(241,241,241,0.3) 40%, rgba(241,241,241,0.8) 80%, #f1f1f1 100%);
    pointer-events: none;
  }
  @media (max-width: 768px) { background-size: 120%; background-position: center 20%; padding: 120px 0 0 32px; gap: 20px; justify-content: center; text-align: center; }
  @media (max-width: 480px) { background-size: 140%; background-position: center 30%; padding: 100px 16px 0; gap: 16px; min-height: 90vh; }
`;

const Title = styled.h1`
  font-size: 100px; color: #3a4872; font-weight: 700; font-family: "GenSenRounded", sans-serif;
  position: relative; z-index: 1; text-shadow: 0 4px 20px rgba(58, 72, 114, 0.2); letter-spacing: -2px;
  @media (max-width: 768px) { font-size: 64px; letter-spacing: -1px; }
  @media (max-width: 480px) { font-size: 48px; letter-spacing: 0; }
  @media (max-width: 320px) { font-size: 40px; }
`;

const Subtitle = styled.p`
  font-size: 40px; color: #676767; white-space: pre-line; margin-top: -100px;
  font-family: "Noto Sans TC", "PingFang TC", sans-serif; font-weight: 300; line-height: 1.4;
  letter-spacing: 1px; position: relative; z-index: 1; text-shadow: 0 2px 10px rgba(90, 108, 125, 0.15);
  @media (max-width: 768px) { font-size: 28px; margin-top: -60px; letter-spacing: 0.5px; }
  @media (max-width: 480px) { font-size: 22px; margin-top: -40px; letter-spacing: 0; line-height: 1.3; }
  @media (max-width: 320px) { font-size: 18px; margin-top: -30px; }
`;

const StartButton = styled.button`
  font-size: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; border: none; padding: 20px 48px; border-radius: 60px; cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); width: fit-content; margin-top: 30px;
  font-weight: 600; letter-spacing: 1px; position: relative; z-index: 1;
  box-shadow: 0 8px 32px rgba(103,126,234,0.25), 0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2);
  backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); overflow: hidden;
  &::before {
    content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
    transition: left 0.6s ease;
  }
  &:hover { transform: translateY(-3px) scale(1.02);
    box-shadow: 0 16px 48px rgba(103,126,234,0.35), 0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3);
    background: linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%);
    &::before { left: 100%; }
  }
  &:active { transform: translateY(-1px) scale(1.01); transition: all .1s ease; }
  @media (max-width: 768px) { font-size: 22px; padding: 16px 36px; border-radius: 50px; margin-top: 24px; }
  @media (max-width: 480px) { font-size: 18px; padding: 14px 28px; border-radius: 40px; margin-top: 20px; width: 100%; max-width: 240px; }
`;

const HeroContent = styled.div`
  display: flex; flex-direction: column; gap: 20px; position: relative; z-index: 1; max-width: 800px;
  @media (max-width: 768px) { align-items: center; max-width: 100%; gap: 16px; }
  @media (max-width: 480px) { gap: 12px; }
`;

const ButtonGroup = styled.div`
  display: flex; gap: 20px; margin-top: 20px; align-items: center;
  @media (max-width: 768px) { justify-content: center; gap: 16px; margin-top: 16px; }
  @media (max-width: 480px) { flex-direction: column; gap: 12px; width: 100%; }
`;

/* ============== 角色卡片區塊 ============== */
const CardSection = styled.section`
  padding: 120px 80px 80px 80px;
  background: linear-gradient(135deg, #f8fbff 0%, #e8f4fd 50%, #f0f8ff 100%);
  text-align: center; position: relative;
  &::before{
    content:''; position:absolute; inset:0;
    background: radial-gradient(circle at 20% 30%, rgba(43,57,147,.05) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(155,181,227,.08) 0%, transparent 50%);
    pointer-events:none;
  }
  &::after{
    content:''; position:absolute; bottom:0; left:0; right:0; height:60px;
    background: linear-gradient(to bottom, rgba(240,248,255,0) 0%, rgba(248,248,248,.3) 30%, rgba(248,248,248,.7) 70%, #fff 100%);
    pointer-events:none;
  }
  @media (max-width: 768px) { padding: 80px 32px 60px; }
  @media (max-width: 480px) { padding: 60px 16px 40px; }
`;

const SectionTitle = styled.h2`
  font-size: 42px; font-weight: 600; margin-bottom: 24px; color: #2c3e50; position: relative; z-index: 1;
  @media (max-width: 768px) { font-size: 32px; margin-bottom: 20px; }
  @media (max-width: 480px) { font-size: 26px; margin-bottom: 16px; line-height: 1.3; }
`;

const SectionSubtitle = styled.p`
  font-size: 20px; color: #5a6c7d; margin-bottom: 60px; font-weight: 300; letter-spacing: .5px; z-index: 1; position: relative;
  @media (max-width: 768px) { font-size: 17px; margin-bottom: 40px; }
  @media (max-width: 480px) { font-size: 15px; margin-bottom: 32px; line-height: 1.5; }
`;

const ScrollWrapper = styled.div`
  overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; position: relative; z-index: 1;
  &::-webkit-scrollbar { display: none; }
  scroll-behavior: smooth;
`;

const ScrollContainer = styled.div`
  display: flex; gap: 40px; padding: 40px 20px; scroll-snap-type: x mandatory;
  @media (max-width: 768px) { gap: 24px; padding: 24px 12px; }
  @media (max-width: 480px) { gap: 16px; padding: 16px 8px; }
`;

/* ---- 動效層 ---- */
const ShimmerLayer = styled.div`
  pointer-events: none; position: absolute; inset: 0; opacity: .10; transition: opacity .3s ease;
  background: linear-gradient(120deg, ${(p) => p.$accentStart} 0%, rgba(255,255,255,0) 30%, ${(p) => p.$accentEnd} 60%, rgba(255,255,255,0) 90%);
  background-size: 200% 200%; animation: ${shimmer} 8s linear infinite; mix-blend-mode: screen;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const Aura = styled.div`
  pointer-events: none; position: absolute; top: 50%; left: 50%;
  width: 220px; height: 220px; border-radius: 50%; transform: translate(-50%, -50%);
  background: radial-gradient(circle, ${(p) => p.$accentStart} 0%, ${(p) => p.$accentEnd} 55%, rgba(255,255,255,0) 70%);
  filter: blur(26px); opacity: .18;
  @media (prefers-reduced-motion: no-preference) { animation: ${pulseGlow} 4.8s ease-in-out infinite; }
`;
const GlowBorderWrap = styled.div`
  pointer-events: none; position: absolute; inset: -1px; border-radius: 24px; overflow: hidden;
`;
const GlowBorder = styled.div`
  position: absolute; inset: 0; filter: blur(8px); opacity: 0;
  transition: opacity .35s ease, filter .35s ease;
  &::before{
    content:''; position:absolute; inset:-2px; border-radius: 26px;
    background: conic-gradient(from 0deg,
      ${(p) => p.$accentStart},
      ${(p) => p.$accentEnd},
      ${(p) => p.$accentStart});
    animation: ${borderShift} 8s linear infinite;
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    padding: 2px;
  }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

/* ---- 卡片本體 ---- */
const ScrollCard = styled.div`
  --tiltX: 0deg; --tiltY: 0deg; --lift: 0px; --scale: 1;
  flex: 0 0 340px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 32px 24px; border-radius: 24px;
  text-align: center; scroll-snap-align: center;
  position: relative; overflow: hidden; outline: none; cursor: pointer;

  transform: perspective(900px) rotateX(var(--tiltX)) rotateY(var(--tiltY)) translateY(var(--lift)) scale(var(--scale));
  transition: transform .35s cubic-bezier(0.4,0,0.2,1), box-shadow .35s ease;

  box-shadow:
    0 10px 40px rgba(43, 57, 147, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255,255,255,0.6);

  &::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(135deg, ${(p) => p.$accentStart} 0%, ${(p) => p.$accentEnd} 100%);
    transform: scaleX(0); transform-origin: left; transition: transform 0.35s ease;
  }

  &:hover {
    --lift: -8px; --scale: 1.02;
    box-shadow:
      0 28px 72px rgba(43, 57, 147, 0.18),
      0 12px 32px rgba(0,0,0,0.08),
      inset 0 1px 0 rgba(255,255,255,0.75);
  }

  &:hover::before { transform: scaleX(1); }
  &:hover ${ShimmerLayer} { opacity: .2; }
  &:hover ${GlowBorder} { opacity: .9; filter: blur(10px) brightness(1.1); }

  &:focus-visible {
    box-shadow:
      0 0 0 4px rgba(255,255,255,0.9),
      0 0 0 8px ${(p) => p.$accentStart}55,
      0 18px 40px rgba(43,57,147,0.15);
    --lift: -4px;
  }

  @media (max-width: 768px) { flex: 0 0 280px; padding: 24px 20px; border-radius: 20px; }
  @media (max-width: 480px) { flex: 0 0 240px; padding: 20px 16px; border-radius: 16px; }
`;

const CardImageContainer = styled.div`
  position: relative; margin-bottom: 24px; display: flex; justify-content: center; animation: ${floatY} 5s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
  @media (max-width: 768px) { margin-bottom: 16px; }
  @media (max-width: 480px) { margin-bottom: 12px; }
`;

const BotName = styled.div`
  display: inline-block; margin: -10px auto 12px; padding: 6px 12px; font-size: 14px; font-weight: 700; letter-spacing: .5px; color: #4455aa;
  background: rgba(102,126,234,0.10); border: 1px solid rgba(102,126,234,0.25); border-radius: 999px; backdrop-filter: blur(8px);
`;

const CardImg = styled.img`
  width: 140px; height: 160px; object-fit: cover; border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1);
  transition: transform .3s ease, box-shadow .3s ease; position: relative; z-index: 1;
  ${ScrollCard}:hover & { transform: scale(1.05); box-shadow: 0 12px 32px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15); }
  @media (max-width: 768px) { width: 120px; height: 140px; border-radius: 16px; }
  @media (max-width: 480px) { width: 100px; height: 120px; border-radius: 12px; }
`;

const CardTitle = styled.h3`
  font-size: 28px; font-weight: 700; color: #2c3e50; margin-bottom: 16px; letter-spacing: 1px; position: relative;
  &::after { content: ''; position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 40px; height: 2px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1px; }
  @media (max-width: 768px) { font-size: 22px; margin-bottom: 12px; }
  @media (max-width: 480px) { font-size: 18px; margin-bottom: 10px; }
`;

const CardFeature = styled.div` margin-bottom: 16px; `;
const FeatureLabel = styled.div` font-size: 14px; font-weight: 700; color: #667eea; margin-bottom: 6px; letter-spacing: .5px; `;
const FeatureText = styled.p` font-size: 14px; color: #4a5568; line-height: 1.6; font-weight: 400; white-space: pre-line; letter-spacing: .3px; `;
const CardDivider = styled.div` width: 60px; height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 16px auto; `;

/* 走馬燈控制 */
const CarouselControls = styled.div`
  display: flex; justify-content: center; margin-top: 48px; gap: 20px; position: relative; z-index: 1;
  @media (max-width: 768px) { margin-top: 32px; gap: 16px; }
  @media (max-width: 480px) { margin-top: 24px; gap: 12px; }
`;
const CarouselButton = styled.button`
  width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.95); backdrop-filter: blur(15px);
  border: 1px solid rgba(103,126,234,0.2); color: #667eea; font-size: 22px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .3s cubic-bezier(.4,0,.2,1); font-weight: bold; box-shadow: 0 4px 16px rgba(103,126,234,.1), 0 1px 4px rgba(0,0,0,.05);
  &:hover { background: #667eea; color: white; transform: scale(1.1) translateY(-2px); box-shadow: 0 8px 28px rgba(103,126,234,.25), 0 4px 12px rgba(0,0,0,.1); border-color: #667eea; }
  &:active { transform: scale(1.05) translateY(-1px); }
  @media (max-width: 768px) { width: 44px; height: 44px; font-size: 18px; }
  @media (max-width: 480px) { width: 40px; height: 40px; font-size: 16px; }
`;

/* ============== 後段區域(保留) ============== */
const ServiceIntroSection = styled.section`
  padding: 80px 80px 120px 80px;
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 50%, #f0f8ff 100%);
  text-align: center; color: #333; position: relative;
  @media (max-width: 768px) { padding: 60px 32px 80px; }
  @media (max-width: 480px) { padding: 40px 16px 60px; }
`;
const ServiceSectionTitle = styled.h2` font-size: 42px; font-weight: 600; margin-bottom: 22px; color: #2c3e50; `;
const ServiceSubtitle = styled.p` font-size: 18px; color: #5a6c7d; margin-bottom: 60px; font-weight: 300; letter-spacing: .5px; max-width: 600px; margin-left:auto; margin-right:auto; `;

const TimelineContainer = styled.div` position: relative; max-width: 1000px; margin: 60px auto; padding: 20px 0; `;
const TimelineCenterLine = styled.div`
  position: absolute; width: 4px; background: linear-gradient(to bottom, #667eea 0%, #764ba2 30%, #667eea 70%, #9bb5e3 100%);
  top: 80px; bottom: 80px; left: 50%; margin-left: -2px; border-radius: 2px; box-shadow: 0 0 20px rgba(103,126,234,.3);
  &::before, &::after { content: ''; position: absolute; width: 16px; height: 16px; background: #667eea; border-radius: 50%; box-shadow: 0 0 0 4px rgba(103,126,234,.2), 0 0 0 8px rgba(103,126,234,.1); }
  &::before { top: -20px; left: 50%; transform: translateX(-50%); }
  &::after { bottom: -20px; left: 50%; transform: translateX(-50%); background:#9bb5e3; box-shadow: 0 0 0 4px rgba(155,181,227,.2), 0 0 0 8px rgba(155,181,227,.1); }
  @media (max-width: 480px) { left: 20px; margin-left: 0; top: 40px; bottom: 40px; }
`;
const TimelineItem = styled.div`
  padding: 15px 40px; position: relative; width: 50%; box-sizing: border-box; margin-bottom: 60px;
  &:nth-child(odd){ left: 0; text-align: right; padding-right: 70px; }
  &:nth-child(even){ left: 50%; text-align: left; padding-left: 70px; }
  &:last-child{ margin-bottom: 0; }
  @media (max-width: 480px) { width: 100%; left:0 !important; text-align:left !important; padding:8px 16px 8px 50px !important; margin-bottom: 32px; }
`;
const TimelineNumber = styled.div`
  position: absolute; width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex; justify-content: center; align-items: center; color: white; font-weight: 700; font-size: 18px; z-index: 2;
  box-shadow: 0 0 0 6px #fff, 0 0 0 10px rgba(103,126,234,.15), 0 8px 25px rgba(103,126,234,.25);
  ${TimelineItem}:nth-child(odd) & { right: -25px; }
  ${TimelineItem}:nth-child(even) & { left: -25px; }
  @media (max-width: 480px) { width: 36px; height: 36px; font-size: 14px; left: 2px !important; right: auto !important; }
`;
const TimelineContent = styled.div`
  padding: 35px 30px;
  background: rgba(255,255,255,.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(43,57,147,.08), 0 2px 8px rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.6);
  transition: all .4s cubic-bezier(.4,0,.2,1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.4);
  text-align: center;

  &:hover { transform: translateY(-8px); }

  @media (max-width: 480px) {
    padding: 20px 16px;
    border-radius: 12px;
    text-align: center !important;
  }
`;
const TimelineTitle = styled.h3` font-size: 22px; font-weight: 700; color: #2c3e50; margin-bottom: 16px; display: flex; align-items: center; gap: 16px; justify-content: center; `;
const TimelineText = styled.p` font-size: 16px; line-height: 1.8; color: #4a5568; white-space: pre-line; `;

const AboutSection = styled.section`
  padding: 100px 120px; background: #f8f8f8; display: flex; align-items: center; gap: 80px;
  @media (max-width: 768px) { padding: 60px 40px; gap: 40px; flex-direction: column; text-align: center; }
  @media (max-width: 480px) { padding: 40px 20px; gap: 24px; }
`;
const AboutImage = styled.img` width: 550px; max-width: 100%; border-radius: 24px; box-shadow: 0 15px 30px rgba(0,0,0,.15); `;
const AboutContent = styled.div` flex: 1; `;
const AboutTitle = styled.h2` font-size: 50px; font-weight: 700; color: #000; margin-bottom: 24px; `;
const AboutText = styled.p` font-size: 22px; color: #333; line-height: 2; white-space: pre-line; `;

/* ====== 底部 ====== */
const Footer = styled.footer`
  background: #c2c2c2; color: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 18px;
  @media (max-width: 768px) { padding: 16px 20px; font-size: 16px; flex-direction: column; gap: 12px; text-align: center; }
  @media (max-width: 480px) { padding: 12px 16px; font-size: 14px; gap: 8px; }
`;
const FooterLinks = styled.div`
  display: flex; gap: 32px; align-items: center;
  div { cursor: pointer; transition: opacity .3s ease; &:hover{ opacity:.85; } display:flex; align-items:center; gap:6px; }
  @media (max-width: 768px){ gap: 20px; justify-content: center; }
  @media (max-width: 480px){ gap: 16px; }
`;
const VersionTag = styled.span`
  font-weight: 800; letter-spacing: .4px; background: rgba(0,0,0,.18); padding: 4px 10px; border-radius: 999px; font-size: 12px;
`;

/* ====== Modal 共用 ====== */
const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(20, 24, 40, 0.45);
  backdrop-filter: blur(6px);
  display: ${(p) => (p.open ? "flex" : "none")};
  align-items: center; justify-content: center;
`;
const ModalShell = styled.div`
  width: min(840px, 94vw);
  background: linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(247,250,255,0.98) 100%);
  border: 1px solid rgba(43, 57, 147, 0.12);
  border-radius: 14px;
  box-shadow: 0 24px 80px rgba(18, 28, 80, 0.28), 0 6px 20px rgba(0,0,0,0.08);
  overflow: hidden; animation: ${fadeIn} .26s ease both;
`;
const ModalTopBar = styled.div`
  height: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;
const ModalHead = styled.div`
  padding: 16px 22px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,.06);
`;
const ModalTitleGroup = styled.div`
  display:flex; align-items:center; gap:10px;
  h3 { margin:0; font-size: 20px; font-weight: 800; color: #1b2748; letter-spacing:.3px; }
  small { color:#6b7390; font-weight:800; background:#eef1ff; padding:2px 8px; border-radius:999px; }
`;
const CloseBtn = styled.button`
  border: none; background: transparent; cursor: pointer; padding: 8px; border-radius: 10px;
  color: #5d6a8a; transition: background .2s ease, transform .08s ease;
  &:hover { background: rgba(103,126,234,.12); }
  &:active { transform: scale(.96); }
`;
const ModalBody = styled.div`
  padding: 18px 22px 12px 22px; display:flex; flex-direction:column; gap:12px;
`;
const Row = styled.div`
  display: grid; grid-template-columns: 120px 1fr auto; align-items: center; gap: 12px;
  padding: 12px 12px; border-radius: 12px; border: 1px solid rgba(43, 57, 147, 0.1);
  background: rgba(255,255,255,.92);
  @media (max-width: 620px){ grid-template-columns: 120px 1fr; }
`;
const Label = styled.div`
  font-weight: 800; font-size: 13px; color: #2b3993; letter-spacing: .5px; display:flex; align-items:center; gap:8px;
`;
const Value = styled.div`
  font-size: 16px; color: #2a334d; display: flex; align-items: center; gap: 10px;
  a { color: #324ab2; text-decoration: none; border-bottom: 1px dashed #b7c2ff; }
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
`;
const RowActions = styled.div` display:flex; gap:8px; `;
const GhostBtn = styled.button`
  background: transparent; color: #2a3350; border: 1px solid rgba(50,74,178,0.25);
  padding: 8px 12px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 13px;
  display: inline-flex; align-items: center; gap: 6px;
  &:hover { background: rgba(50,74,178,0.08); }
`;
const ModalFoot = styled.div`
  padding: 12px 22px 16px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid rgba(0,0,0,0.06);
`;

/* ====== Privacy Modal ====== */
const DocBody = styled.div`
  padding: 18px 22px; max-height: min(56vh, 640px); overflow: auto;
  line-height: 1.85; color: #27324a; font-size: 15.5px;
  p { margin: 0 0 12px; }
  h4 { margin: 14px 0 8px; font-size: 16px; color:#1b2545; }
  ul { margin: 8px 0 12px 20px; }
  code, .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; background:#f4f6ff; padding: 2px 6px; border-radius: 6px; }
  strong { font-weight: 800; }
`;

/* ====== 影片播放 Modal (簡化版) ====== */
const VideoOverlay = styled.div`
  position: fixed; 
  inset: 0; 
  z-index: 2000;
  background: rgba(20, 24, 40, 0.75);
  backdrop-filter: blur(12px);
  display: ${(p) => (p.open ? "flex" : "none")};
  align-items: center; 
  justify-content: center;
  animation: ${fadeIn} .3s ease both;
`;

const VideoWrapper = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const VideoCloseButton = styled.button`
  position: absolute;
  top: -50px;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2b3993;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  &:hover {
    background: #fff;
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }
  
  &:active {
    transform: scale(1.05) rotate(90deg);
  }
  
  @media (max-width: 768px) {
    top: -45px;
    width: 36px;
    height: 36px;
  }
`;

const VideoPlayer = styled.video`
  max-width: 100%;
  max-height: 85vh;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  background: #000;
  
  @media (max-width: 768px) {
    border-radius: 8px;
  }
`;

/* =================== 主組件 =================== */
export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);
  const videoRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  const VERSION = "v1.0.0";

  // 影片檔名映射
  const videoMapping = {
    empathy: "lumi_video.mp4",
    insight: "solin_video.mp4",
    solution: "niko_video.mp4",
    cognitive: "clara_video.mp4"
  };

  const botCards = [
    { 
      type: "empathy", 
      title: "同理型 AI", 
      name: "Lumi", 
      image: bot1, 
      features: "擅長建立溫暖、接納的氛圍,陪伴使用者覺察情緒\n並與之共處", 
      suitable: "孤獨感、低自尊、情感失落、自我懷疑、\n親密關係議題", 
      accentStart: "#FFB6C1", 
      accentEnd: "#FF8FB1"
    },
    { 
      type: "insight", 
      title: "洞察型 AI", 
      name: "Solin", 
      image: bot2, 
      features: "探索潛意識與隱藏動機,引導使用者對過往經驗\n進行深層理解", 
      suitable: "反覆的人際模式、創傷經驗、自我價值疑問、\n夢境探索、內在空虛感", 
      accentStart: "#7AC2DD", 
      accentEnd: "#5A8CF2"
    },
    { 
      type: "solution", 
      title: "解決型 AI", 
      name: "Niko", 
      image: bot6, 
      features: "現實導向,強調目標設定與資源活用,\n能快速聚焦在問題解決上", 
      suitable: "職場壓力、衝突處理、時間管理、短期決策困難、\n日常壓力應對", 
      accentStart: "#3AA87A", 
      accentEnd: "#9AE6B4"
    },
    { 
      type: "cognitive", 
      title: "認知型 AI", 
      name: "Clara", 
      image: bot4, 
      features: "結構明確、邏輯清晰,分析非理性思考\n並提供認知重建步驟", 
      suitable: "負面自我對話、焦慮、完美主義、拖延、情緒管理", 
      accentStart: "#7A4DC8", 
      accentEnd: "#B794F4"
    },
  ];

  const cardWidth = 340;
  const cardGap = 40;
  const cardFullWidth = cardWidth + cardGap;

  const serviceSteps = [
    { title: "為你找到最懂你的AI夥伴", icon: <MdEmojiPeople size={24} />, content: "根據你的心理特質,媒合推薦一位\n陪你傾訴、懂你心情節奏的AI夥伴。" },
    { title: "展開屬於你的對話旅程", icon: <MdChat size={24} />, content: "隨時分享你的心情,探索自己的情緒地圖,\n沒有壓力、沒有評價,開啟對話的深度體驗。" },
    { title: "一起守護你的情緒訊號", icon: <MdFavorite size={24} />, content: "在陪伴聊天的過程中,AI夥伴也會細心留意\n您的情緒波動,當需要更多支持時,\n溫柔提醒你有其他資源可以依靠。" },
    { title: "連結更多專業的幫助", icon: <MdPsychology size={24} />, content: "如果需要,我們會在你的同意下,\n協助你快速找到校方的專業心理師,\n讓支持更及時到達你身邊。" },
  ];

  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);

  useEffect(() => {
    const toRobots = location.hash === "#robots" || location.state?.scrollTo === "robots";
    const toAbout = location.hash === "#about" || location.state?.scrollTo === "about";
    const targetId = toRobots ? "robot-section" : toAbout ? "about-section" : null;
    if (!targetId) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }, [location]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setContactOpen(false);
        setPrivacyOpen(false);
        setVideoOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!videoOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [videoOpen]);

  const scrollToCard = (direction) => {
    const ref = scrollRef.current;
    if (!ref) return;
    const scrollAmount = direction === "next" ? cardFullWidth : -cardFullWidth;
    ref.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const openPersona = (card) => { 
    setActive(card); 
    setOpen(true); 
  };

  const openVideoPreview = (card) => {
    setCurrentVideo(card);
    setVideoOpen(true);
    setOpen(false);
  };

  const handleTilt = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotX = (0.5 - py) * 8;
    const rotY = (px - 0.5) * 10;
    el.style.setProperty("--tiltX", `${rotX}deg`);
    el.style.setProperty("--tiltY", `${rotY}deg`);
  };
  
  const resetTilt = (e) => {
    const el = e.currentTarget;
    el.style.setProperty("--tiltX", `0deg`);
    el.style.setProperty("--tiltY", `0deg`);
  };

  return (
    <Container>
      <Header>
        <Logo onClick={() => navigate("/Home")}>
          <img src={logoIcon} alt="logo" />
          Emobot+
        </Logo>
        <RightSection>
          <Nav>
            <div onClick={() => navigate("/Home")}>主頁</div>
            <div onClick={() => document.getElementById("robot-section")?.scrollIntoView({ behavior: "smooth" })}>機器人介紹</div>
            <div onClick={() => navigate("/Home", { state: { scrollTo: "about" } })}>關於我們</div>
          </Nav>
          <AvatarImg src={userIcon} alt="user" />
        </RightSection>
      </Header>

      <HeroSection>
        <HeroContent>
          <Title data-aos="fade-up">Emobot+</Title>
          <Subtitle data-aos="fade-up" data-aos-delay="200">
            讓情緒被聽見,{"\n"}
            讓支持更靠近。
          </Subtitle>
          <ButtonGroup data-aos="fade-up" data-aos-delay="400">
            <StartButton onClick={() => navigate("/Login")}>開始對話</StartButton>
          </ButtonGroup>
        </HeroContent>
      </HeroSection>

      <CardSection id="robot-section">
        <SectionTitle data-aos="fade-up">為每一種情緒,找到最好的陪伴</SectionTitle>
        <SectionSubtitle data-aos="fade-up" data-aos-delay="100">
          每個AI夥伴都有獨特的陪伴風格,讓我們為你找到最適合的那一個
        </SectionSubtitle>

        <ScrollWrapper ref={scrollRef}>
          <ScrollContainer>
            {botCards.map((card, index) => (
              <ScrollCard
                key={card.type}
                $accentStart={card.accentStart}
                $accentEnd={card.accentEnd}
                data-aos="fade-up"
                data-aos-delay={100 + index * 100}
                tabIndex={0}
                aria-label={`${card.name || card.title} 卡片`}
                onClick={() => openPersona(card)}
                onKeyDown={(e) => e.key === "Enter" && openPersona(card)}
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
              >
                <ShimmerLayer aria-hidden="true" $accentStart={card.accentStart} $accentEnd={card.accentEnd} />
                <GlowBorderWrap aria-hidden="true">
                  <GlowBorder $accentStart={card.accentStart} $accentEnd={card.accentEnd} />
                </GlowBorderWrap>

                <CardImageContainer>
                  <Aura aria-hidden="true" $accentStart={card.accentStart} $accentEnd={card.accentEnd} />
                  <CardImg src={card.image} alt={card.title} />
                </CardImageContainer>

                {card.name && <BotName>{card.name}</BotName>}
                <CardTitle>{card.title}</CardTitle>

                <CardFeature>
                  <FeatureLabel>特色能力</FeatureLabel>
                  <FeatureText>{card.features}</FeatureText>
                </CardFeature>

                <CardDivider />

                <CardFeature>
                  <FeatureLabel>適合議題</FeatureLabel>
                  <FeatureText>{card.suitable}</FeatureText>
                </CardFeature>
              </ScrollCard>
            ))}
          </ScrollContainer>
        </ScrollWrapper>

        <CarouselControls>
          <CarouselButton onClick={() => scrollToCard("prev")}>‹</CarouselButton>
          <CarouselButton onClick={() => scrollToCard("next")}>›</CarouselButton>
        </CarouselControls>
      </CardSection>

      <ServiceIntroSection>
        <ServiceSectionTitle data-aos="fade-up">系統服務流程</ServiceSectionTitle>
        <ServiceSubtitle data-aos="fade-up" data-aos-delay="100">
          透過四個精心設計的步驟,為你提供最貼心的情感支持體驗
        </ServiceSubtitle>

        <TimelineContainer>
          <TimelineCenterLine />
          {serviceSteps.map((step, index) => (
            <TimelineItem
              key={index}
              data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
              data-aos-delay={200 + index * 150}
            >
              <TimelineNumber>{index + 1}</TimelineNumber>
              <TimelineContent>
                <TimelineTitle>{step.title}</TimelineTitle>
                <TimelineText>{step.content}</TimelineText>
              </TimelineContent>
            </TimelineItem>
          ))}
        </TimelineContainer>
      </ServiceIntroSection>

      <AboutSection id="about-section">
        <AboutImage src={homeP1} alt="關於我們" data-aos="fade-right" />
        <AboutContent data-aos="fade-left">
          <AboutTitle>關於我們</AboutTitle>
          <AboutText>
            Emobot+ 致力於打造一個溫柔陪伴、即時理解的情感支持系統。

            我們相信,
            每一種情緒,都需要被傾聽與溫柔對待。

            透過 AI 媒合推薦,
            我們為你找到最適合的 AI 夥伴,
            在每個需要理解的時刻,與您同行。
          </AboutText>
        </AboutContent>
      </AboutSection>

      <Footer>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <span>Copyright © 2025 Emobot+</span>
          <VersionTag>v1.0.0</VersionTag>
        </div>
        <FooterLinks>
          <div onClick={() => setPrivacyOpen(true)}><FiShield /> 隱私政策</div>
          <div onClick={() => setContactOpen(true)}><FiMail /> 聯絡我們</div>
        </FooterLinks>
      </Footer>

      {/* Persona Modal - 修改按鈕文字 */}
      <PersonaModal
        open={open}
        onClose={() => setOpen(false)}
        onStart={() => openVideoPreview(active)}
        persona={active ? personas[active.type] : null}
        imageSrc={active?.image}
        accentStart={active?.accentStart || "#667eea"}
        accentEnd={active?.accentEnd || "#764ba2"}
        buttonText={active ? `${active.name} 詳細介紹` : "詳細介紹"}
      />

      {/* 影片播放 Modal (簡化版) */}
      <VideoOverlay
        open={videoOpen}
        onClick={(e) => e.target === e.currentTarget && setVideoOpen(false)}
        aria-hidden={!videoOpen}
      >
        <VideoWrapper>
          <VideoCloseButton 
            aria-label="關閉影片"
            onClick={() => setVideoOpen(false)}
          >
            <FiX size={20} />
          </VideoCloseButton>
          <VideoPlayer
            ref={videoRef}
            controls
            autoPlay
            src={currentVideo ? `/videos/${videoMapping[currentVideo.type]}` : ""}
            onError={(e) => console.error("影片載入錯誤:", e)}
          >
            您的瀏覽器不支援影片播放
          </VideoPlayer>
        </VideoWrapper>
      </VideoOverlay>

      {/* 聯絡我們 Modal */}
      <Overlay
        open={contactOpen}
        onClick={(e) => e.target === e.currentTarget && setContactOpen(false)}
        aria-hidden={!contactOpen}
      >
        <ModalShell role="dialog" aria-modal="true" aria-label="聯絡我們">
          <ModalTopBar />
          <ModalHead>
            <ModalTitleGroup>
              <h3>聯絡我們</h3>
              <small>v1.0.0</small>
            </ModalTitleGroup>
            <CloseBtn aria-label="關閉" onClick={() => setContactOpen(false)}>
              <FiX size={20} />
            </CloseBtn>
          </ModalHead>

          <ModalBody>
            <Row>
              <Label><FiFileText /> Team</Label>
              <Value>Emobot+</Value>
              <RowActions />
            </Row>

            <Row>
              <Label><FiMail /> Email</Label>
              <Value>
                <a href="mailto:emobotplus@gmail.com">emobotplus@gmail.com</a>
              </Value>
              <RowActions />
            </Row>
          </ModalBody>

          <ModalFoot>
            <GhostBtn onClick={() => setContactOpen(false)}>關閉</GhostBtn>
          </ModalFoot>
        </ModalShell>
      </Overlay>

      {/* 隱私政策 Modal */}
      <Overlay
        open={privacyOpen}
        onClick={(e) => e.target === e.currentTarget && setPrivacyOpen(false)}
        aria-hidden={!privacyOpen}
      >
        <ModalShell role="dialog" aria-modal="true" aria-label="隱私政策">
          <ModalTopBar />
          <ModalHead>
            <ModalTitleGroup>
              <h3>隱私政策</h3>
              <small>v1.0.0</small>
            </ModalTitleGroup>
            <CloseBtn aria-label="關閉" onClick={() => setPrivacyOpen(false)}>
              <FiX size={20} />
            </CloseBtn>
          </ModalHead>

          <DocBody>
            <h4>使用目的與測試性質</h4>
            <p>
              本程式專案目前處於<strong>測試階段</strong>,目的在於驗證介面設計、互動流程與系統穩定性。請勿將平台提供之任何內容視為醫療或心理治療之專業建議。
            </p>
            
            <h4>非醫療建議聲明</h4>
            <p>
              若您出現焦慮、憂鬱、恐慌、自傷或其他急迫心理症狀,請<strong>立即</strong>尋求專業協助(校園諮商中心、醫療院所或當地緊急聯絡資源)。
            </p>

            <h4>資料處理與去識別化</h4>
            <p>
              平台上的測驗作答、對話內容、互動紀錄<strong>皆採去識別化與匿名處理</strong>,僅用於模型與功能之研究與改良;不蒐集可直接識別您身分之敏感資訊。
            </p>

            <h4>資料保存與安全</h4>
            <p>(1)研究資料以最小化原則保存,並採取合理之技術與管理措施降低未授權存取風險。</p>
            <p>(2)除法律要求或安全性稽核外,不會對外揭露個別使用者內容。</p>

            <h4>第三方服務</h4>
            <p>
              於測試階段,可能使用第三方雲端與分析工具以改善系統體驗;其處理遵循各工具之隱私條款並以<strong>研究測試</strong>為限。
            </p>

            <h4>使用者權益</h4>
            <p>(1)您可隨時停止使用本平台。</p>
            <p>(2)如欲瞭解或刪除測試階段所留資料,請隨時來信與我們聯繫。</p>

            <h4>聯絡方式</h4>
            <p>
              Team:<strong>Emobot+</strong>
            </p>
            <p>
              Email:<a href="mailto:emobotplus@gmail.com">emobotplus@gmail.com</a>
            </p>
          </DocBody>

          <ModalFoot>
            <GhostBtn onClick={() => setPrivacyOpen(false)}>關閉</GhostBtn>
          </ModalFoot>
          </ModalShell>
      </Overlay>
    </Container>
  );
}