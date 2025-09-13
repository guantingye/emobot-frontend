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

/* ================ 基礎樣式（保留） ================ */
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
    padding: 2px; /* 邊框厚度 */
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

/* ============== 後段區域（保留） ============== */
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
  padding: 35px 30px; background: rgba(255,255,255,.95); backdrop-filter: blur(15px); border-radius: 20px;
  box-shadow: 0 8px 32px rgba(43,57,147,.08), 0 2px 8px rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.6);
  transition: all .4s cubic-bezier(.4,0,.2,1); position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,.4);
  &:hover { transform: translateY(-8px); }
  @media (max-width: 480px) { padding: 20px 16px; border-radius: 12px; text-align: left !important; }
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

const Footer = styled.footer`
  background: #c2c2c2; color: white; padding: 20px 40px; display: flex; justify-content: space-between; font-size: 18px;
  @media (max-width: 768px) { padding: 16px 20px; font-size: 16px; flex-direction: column; gap: 12px; text-align: center; }
  @media (max-width: 480px) { padding: 12px 16px; font-size: 14px; gap: 8px; }
`;
const FooterLinks = styled.div`
  display: flex; gap: 32px;
  div { cursor: pointer; transition: opacity .3s ease; &:hover{ opacity:.8; } }
  @media (max-width: 768px){ gap: 20px; justify-content: center; }
  @media (max-width: 480px){ gap: 16px; flex-direction: column; }
`;

/* =================== 主組件 =================== */
export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  const botCards = [
    {
      type: "empathy",
      title: "同理型 AI",
      name: "Lumi",
      image: bot1,
      features: "擅長建立溫暖、接納的氛圍，引導使用者覺察情緒並與之共處",
      suitable: "孤獨感、低自尊、情感失落、自我懷疑、親密關係議題",
      accentStart: "#FFB6C1",
      accentEnd: "#FF8FB1",
    },
    {
      type: "insight",
      title: "洞察型 AI",
      name: "Solin",
      image: bot2,
      features: "長於探索潛意識與潛藏動機，引導使用者對過往經驗進行深層理解",
      suitable: "反覆的人際模式、創傷經驗、自我價值疑問、夢境探索、內在空虛感",
      accentStart: "#7AC2DD",
      accentEnd: "#5A8CF2",
    },
    {
      type: "solution",
      title: "解決型 AI",
      name: "Niko",
      image: bot6,
      features: "現實導向，強調目標設定與資源活用，能快速聚焦在問題解決上",
      suitable: "職場壓力、衝突處理、時間管理、短期決策困難、日常壓力應對",
      accentStart: "#3AA87A",
      accentEnd: "#9AE6B4",
    },
    {
      type: "cognitive",
      title: "認知型 AI",
      name: "Clara",
      image: bot4,
      features: "結構明確、邏輯清晰，擅長分析非理性思考並提供認知重建步驟",
      suitable: "負面自我對話、焦慮、完美主義、拖延、情緒管理",
      accentStart: "#7A4DC8",
      accentEnd: "#B794F4",
    },
  ];

  const cardWidth = 340;
  const cardGap = 40;
  const cardFullWidth = cardWidth + cardGap;

  const serviceSteps = [
    { title: "為你找到最懂你的AI夥伴", icon: <MdEmojiPeople size={24} />, content: "根據你的心理特質，\n媒合一位陪你傾聽、\n懂你心情節奏的AI朋友。" },
    { title: "展開屬於你的對話旅程", icon: <MdChat size={24} />, content: "隨時分享你的心情，\n探索自己的情緒地圖，\n沒有壓力、沒有評價。" },
    { title: "一起守護你的情緒訊號", icon: <MdFavorite size={24} />, content: "在陪伴中，AI夥伴也會細心留意情緒波動，\n當需要更多支持時，溫柔提醒你有其他資源可以依靠。" },
    { title: "連結更多專業的幫助", icon: <MdPsychology size={24} />, content: "如果需要，我們會在你的同意下，\n協助你快速找到校方的專業心理師，\n讓支持更及時到達你身邊。" },
  ];

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // 保留原有 hash/狀態滾動
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

  const scrollToCard = (direction) => {
    const ref = scrollRef.current;
    if (!ref) return;
    const scrollAmount = direction === "next" ? cardFullWidth : -cardFullWidth;
    ref.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const openPersona = (card) => { setActive(card); setOpen(true); };
  const startWithPersona = (personaObj) => { navigate("/Login", { state: { preferredBot: personaObj?.key } }); };

  // 3D tilt：依滑鼠位置設定 CSS 變數
  const handleTilt = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;   // 0 ~ 1
    const py = (e.clientY - rect.top) / rect.height;   // 0 ~ 1
    const rotX = (0.5 - py) * 8; // 上下傾斜
    const rotY = (px - 0.5) * 10; // 左右傾斜
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
            讓情緒被聽見，{"\n"}
            讓支持更靠近。
          </Subtitle>
          <ButtonGroup data-aos="fade-up" data-aos-delay="400">
            <StartButton onClick={() => navigate("/Login")}>開始對話</StartButton>
          </ButtonGroup>
        </HeroContent>
      </HeroSection>

      <CardSection id="robot-section">
        <SectionTitle data-aos="fade-up">為每一種情緒，找到最好的陪伴</SectionTitle>
        <SectionSubtitle data-aos="fade-up" data-aos-delay="100">
          每個AI夥伴都有獨特的陪伴風格，讓我們為你找到最適合的那一個
        </SectionSubtitle>

        <ScrollWrapper ref={scrollRef}>
          <ScrollContainer>
            {botCards.map((card, index) => {
              return (
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
                  {/* 動效層 */}
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
              );
            })}
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
          透過四個精心設計的步驟，為你提供最貼心的情感支持體驗
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

            我們相信，
            每一種情緒，都需要被傾聽與溫柔對待。

            透過 AI 精準媒合，
            我們為你找到最適合的 AI 夥伴，
            在每個需要理解的時刻，與你同行。
          </AboutText>
        </AboutContent>
      </AboutSection>

      <Footer>
        <div>Copyright © 2025 Emobot+</div>
        <FooterLinks>
          <div>隱私政策</div>
          <div>聯絡我們</div>
          <div>國家</div>
        </FooterLinks>
      </Footer>

      {/* Persona Modal */}
      <PersonaModal
        open={open}
        onClose={() => setOpen(false)}
        onStart={(p) => startWithPersona(p)}
        persona={active ? personas[active.type] : null}
        imageSrc={active?.image}
        accentStart={active?.accentStart || "#667eea"}
        accentEnd={active?.accentEnd || "#764ba2"}
      />
    </Container>
  );
}
