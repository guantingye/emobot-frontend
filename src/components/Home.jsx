import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
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

// ===== 基本樣式 =====
const Container = styled.div`
  width: 100vw;
  font-family: "Noto Sans TC", sans-serif;
  overflow-x: hidden;
`;

const Header = styled.header`
  width: 100%;
  height: 70px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  position: fixed;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 35px;
  font-weight: bold;
  color: #2b3993;
  display: flex;
  align-items: center;
`;

const Nav = styled.nav`
  display: flex;
  gap: 40px;
  font-size: 26px;
  font-weight: bold;
  color: black;
  div {
    cursor: pointer;
    transition: color 0.3s ease;
    &:hover {
      color: #2b3993;
    }
  }
`;

const AvatarImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.1);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  margin-right: 40px;
`;

const HeroSection = styled.section`
  height: 100vh;
  background-image: url(${homeBackground});
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 180px 0 0 95px;
  gap: 30px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(43, 57, 147, 0.05) 0%,
      rgba(103, 126, 234, 0.08) 30%,
      rgba(118, 75, 162, 0.06) 70%,
      transparent 100%
    );
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 150px;
    background: linear-gradient(
      to bottom, 
      transparent 0%,
      rgba(241, 241, 241, 0.3) 40%,
      rgba(241, 241, 241, 0.8) 80%,
      #f1f1f1 100%
    );
    pointer-events: none;
  }
`;

const Title = styled.h1`
  font-size: 100px;
  color: #3a4872;
  font-weight: 700;
  font-family: "GenSenRounded", sans-serif;
  position: relative;
  z-index: 1;
  text-shadow: 0 4px 20px rgba(58, 72, 114, 0.2);
  letter-spacing: -2px;
`;

const Subtitle = styled.p`
  font-size: 40px;
  color: #676767;
  white-space: pre-line;
  margin-top: -100px;
  font-family: "Noto Sans TC", "PingFang TC", sans-serif;
  font-weight: 300;
  line-height: 1.4;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 10px rgba(90, 108, 125, 0.15);
`;

const StartButton = styled.button`
  font-size: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 20px 48px;
  border-radius: 60px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  width: fit-content;
  margin-top: 30px;
  font-weight: 600;
  font-family: "Noto Sans TC", sans-serif;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
  box-shadow: 
    0 8px 32px rgba(103, 126, 234, 0.25),
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    transition: left 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 16px 48px rgba(103, 126, 234, 0.35),
      0 8px 24px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    background: linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(1.01);
    transition: all 0.1s ease;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 1;
  max-width: 800px;
`;

const HeroHighlight = styled.span`
  color: #667eea;
  font-weight: 700;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
    opacity: 0.6;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  align-items: center;
`;

const SecondaryButton = styled.button`
  font-size: 24px;
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border: 2px solid rgba(103, 126, 234, 0.3);
  padding: 16px 32px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  font-family: "Noto Sans TC", sans-serif;
  letter-spacing: 0.5px;
  backdrop-filter: blur(15px);
  box-shadow: 
    0 4px 16px rgba(103, 126, 234, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 
      0 8px 24px rgba(103, 126, 234, 0.25),
      0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 16px;
  color: #4a5568;
  font-weight: 500;
  font-family: "Noto Sans TC", sans-serif;
  border: 1px solid rgba(103, 126, 234, 0.2);
  box-shadow: 
    0 4px 16px rgba(103, 126, 234, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
  width: fit-content;
  
  &::before {
    content: '✨';
    font-size: 18px;
  }
`;

// ===== 優化後的機器人卡片區塊樣式 =====
const CardSection = styled.section`
  padding: 120px 80px 80px 80px;
  background: linear-gradient(135deg, #f8fbff 0%, #e8f4fd 50%, #f0f8ff 100%);
  text-align: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(43, 57, 147, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(155, 181, 227, 0.08) 0%, transparent 50%);
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to bottom, 
      rgba(240, 248, 255, 0) 0%,
      rgba(248, 248, 248, 0.3) 30%,
      rgba(248, 248, 248, 0.7) 70%,
      #ffffff 100%
    );
    pointer-events: none;
  }
`;

const SectionTitle = styled.h2`
  font-size: 42px;
  font-weight: 600;
  font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif;
  margin-bottom: 24px;
  color: #2c3e50;
  position: relative;
  z-index: 1;
`;

const SectionSubtitle = styled.p`
  font-size: 20px;
  color: #5a6c7d;
  margin-bottom: 60px;
  font-family: "Noto Sans TC", sans-serif;
  font-weight: 300;
  letter-spacing: 0.5px;
  z-index: 1;
  position: relative;
`;

const ScrollWrapper = styled.div`
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  position: relative;
  z-index: 1;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  scroll-behavior: smooth;
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 40px;
  padding: 40px 20px;
  scroll-snap-type: x mandatory;
`;

const ScrollCard = styled.div`
  flex: 0 0 340px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 32px 24px;
  border-radius: 24px;
  box-shadow: 
    0 10px 40px rgba(43, 57, 147, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  text-align: center;
  scroll-snap-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transform: scaleX(0);
    transition: transform 0.4s ease;
  }

  &:hover {
    transform: translateY(-16px) scale(1.03);
    box-shadow: 
      0 25px 60px rgba(43, 57, 147, 0.15),
      0 10px 30px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    
    &::before {
      transform: scaleX(1);
    }
  }

  &:nth-child(1) {
    background: linear-gradient(135deg, rgba(255, 182, 193, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%);
    
    &:hover {
      background: linear-gradient(135deg, rgba(255, 182, 193, 0.12) 0%, rgba(255, 255, 255, 0.98) 100%);
    }
  }
  
  &:nth-child(2) {
    background: linear-gradient(135deg, rgba(147, 197, 253, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%);
    
    &:hover {
      background: linear-gradient(135deg, rgba(147, 197, 253, 0.12) 0%, rgba(255, 255, 255, 0.98) 100%);
    }
  }
  
  &:nth-child(3) {
    background: linear-gradient(135deg, rgba(196, 181, 253, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%);
    
    &:hover {
      background: linear-gradient(135deg, rgba(196, 181, 253, 0.12) 0%, rgba(255, 255, 255, 0.98) 100%);
    }
  }
  
  &:nth-child(4) {
    background: linear-gradient(135deg, rgba(167, 243, 208, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%);
    
    &:hover {
      background: linear-gradient(135deg, rgba(167, 243, 208, 0.12) 0%, rgba(255, 255, 255, 0.98) 100%);
    }
  }
`;

const CardImageContainer = styled.div`
  position: relative;
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
`;

const CardImg = styled.img`
  width: 120px;
  height: 140px;
  object-fit: cover;
  border-radius: 20px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  ${ScrollCard}:hover & {
    transform: scale(1.05);
    box-shadow: 
      0 12px 32px rgba(0, 0, 0, 0.2),
      0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.h3`
  font-size: 28px;
  font-weight: 700;
  font-family: "Noto Sans TC", "PingFang TC", sans-serif;
  color: #2c3e50;
  margin-bottom: 16px;
  letter-spacing: 1px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 1px;
  }
`;

const CardFeature = styled.div`
  margin-bottom: 20px;
`;

const FeatureLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 8px;
  font-family: "Noto Sans TC", sans-serif;
  letter-spacing: 0.5px;
`;

const FeatureText = styled.p`
  font-size: 15px;
  color: #4a5568;
  line-height: 1.6;
  font-family: "Noto Sans TC", sans-serif;
  font-weight: 400;
  white-space: pre-line;
  letter-spacing: 0.3px;
`;

const CardDivider = styled.div`
  width: 60px;
  height: 1px;
  background: linear-gradient(to right, transparent, #e2e8f0, transparent);
  margin: 20px auto;
`;

const CarouselControls = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 48px;
  gap: 20px;
  position: relative;
  z-index: 1;
`;

const CarouselButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(103, 126, 234, 0.2);
  color: #667eea;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: bold;
  box-shadow: 
    0 4px 16px rgba(103, 126, 234, 0.1),
    0 1px 4px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background: #667eea;
    color: white;
    transform: scale(1.1) translateY(-2px);
    box-shadow: 
      0 8px 28px rgba(103, 126, 234, 0.25),
      0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
  
  &:active {
    transform: scale(1.05) translateY(-1px);
  }
`;

// ===== 現代化垂直時間軸樣式 =====
const ServiceIntroSection = styled.section`
  padding: 80px 80px 120px 80px;
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 50%, #f0f8ff 100%);
  text-align: center;
  color: #333;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to bottom, 
      #ffffff 0%,
      rgba(248, 248, 248, 0.7) 30%,
      rgba(248, 248, 248, 0.3) 70%,
      rgba(248, 248, 248, 0) 100%
    );
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 15% 20%, rgba(103, 126, 234, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 85% 80%, rgba(118, 75, 162, 0.04) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const ServiceSectionTitle = styled.h2`
  font-size: 42px;
  font-weight: 600;
  font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif;
  margin-bottom: 22px;
  color: #2c3e50;
  position: relative;
  z-index: 1;
`;

const ServiceSubtitle = styled.p`
  font-size: 18px;
  color: #5a6c7d;
  margin-bottom: 60px;
  font-family: "Noto Sans TC", sans-serif;
  font-weight: 300;
  letter-spacing: 0.5px;
  z-index: 1;
  position: relative;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const TimelineContainer = styled.div`
  position: relative;
  max-width: 1000px;
  margin: 60px auto;
  padding: 20px 0;
`;

const TimelineCenterLine = styled.div`
  position: absolute;
  width: 4px;
  background: linear-gradient(to bottom, 
    #667eea 0%, 
    #764ba2 30%,
    #667eea 70%,
    #9bb5e3 100%
  );
  top: 80px;
  bottom: 80px;
  left: 50%;
  margin-left: -2px;
  border-radius: 2px;
  box-shadow: 0 0 20px rgba(103, 126, 234, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 16px;
    background: #667eea;
    border-radius: 50%;
    box-shadow: 
      0 0 0 4px rgba(103, 126, 234, 0.2),
      0 0 0 8px rgba(103, 126, 234, 0.1);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 16px;
    background: #9bb5e3;
    border-radius: 50%;
    box-shadow: 
      0 0 0 4px rgba(155, 181, 227, 0.2),
      0 0 0 8px rgba(155, 181, 227, 0.1);
  }
`;

const TimelineItem = styled.div`
  padding: 15px 40px;
  position: relative;
  width: 50%;
  box-sizing: border-box;
  margin-bottom: 60px;
  
  &:nth-child(odd) {
    left: 0;
    text-align: right;
    padding-right: 70px;
  }
  
  &:nth-child(even) {
    left: 50%;
    text-align: left;
    padding-left: 70px;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TimelineNumber = styled.div`
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
  z-index: 2;
  box-shadow: 
    0 0 0 6px rgba(255, 255, 255, 1),
    0 0 0 10px rgba(103, 126, 234, 0.15),
    0 8px 25px rgba(103, 126, 234, 0.25);
  transition: all 0.3s ease;
  
  ${TimelineItem}:nth-child(odd) & {
    right: -25px;
  }
  
  ${TimelineItem}:nth-child(even) & {
    left: -25px;
  }
  
  ${TimelineItem}:hover & {
    transform: scale(1.1);
    box-shadow: 
      0 0 0 6px rgba(255, 255, 255, 1),
      0 0 0 12px rgba(103, 126, 234, 0.2),
      0 12px 35px rgba(103, 126, 234, 0.35);
  }
`;

const TimelineContent = styled.div`
  padding: 35px 30px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(43, 57, 147, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.4);
  
  // 新增：讓內容都置中對齊
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transform: scaleX(0);
    transition: transform 0.4s ease;
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 
      0 20px 60px rgba(43, 57, 147, 0.15),
      0 8px 25px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    
    &::before {
      transform: scaleX(1);
    }
  }
  
  /* 不同步驟的背景色 */
  ${TimelineItem}:nth-child(1) & {
    background: linear-gradient(135deg, rgba(255, 182, 193, 0.06) 0%, rgba(255, 255, 255, 0.95) 100%);
  }
  
  ${TimelineItem}:nth-child(2) & {
    background: linear-gradient(135deg, rgba(147, 197, 253, 0.06) 0%, rgba(255, 255, 255, 0.95) 100%);
  }
  
  ${TimelineItem}:nth-child(3) & {
    background: linear-gradient(135deg, rgba(196, 181, 253, 0.06) 0%, rgba(255, 255, 255, 0.95) 100%);
  }
  
  ${TimelineItem}:nth-child(4) & {
    background: linear-gradient(135deg, rgba(167, 243, 208, 0.06) 0%, rgba(255, 255, 255, 0.95) 100%);
  }
`;

const TimelineTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  font-family: "Noto Sans TC", "PingFang TC", sans-serif;
  letter-spacing: 0.5px;
  gap: 16px;
  
  // 移除原本的左右對齊，改為全部置中
  justify-content: center;
  text-align: center;
`;

const TimelineText = styled.p`
  font-size: 16px;
  line-height: 1.8;
  color: #4a5568;
  white-space: pre-line;
  font-family: "Noto Sans TC", sans-serif;
  font-weight: 400;
  letter-spacing: 0.3px;
  
  // 移除原本的左右對齊，改為置中
  text-align: center;
`;

const TimelineIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  // 移除左右邊距，因為現在都置中了
  margin: 0;
  box-shadow: 0 4px 12px rgba(103, 126, 234, 0.3);
  transition: all 0.3s ease;
  
  /* 確保圖標完全置中 */
  svg {
    display: block;
    width: 24px;
    height: 24px;
  }
  
  ${TimelineContent}:hover & {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(103, 126, 234, 0.4);
  }
`;

const AboutSection = styled.section`
  padding: 100px 120px;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  gap: 80px;
`;

const AboutImage = styled.img`
  width: 550px;
  border-radius: 24px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
`;

const AboutContent = styled.div`
  flex: 1;
`;

const AboutTitle = styled.h2`
  font-size: 50px;
  font-weight: 700;
  color: #000;
  margin-bottom: 24px;
  
`;

const AboutText = styled.p`
  font-size: 22px;
  color: #333;
  line-height: 2;
  white-space: pre-line;
  
`;

const ActionRow = styled.div`
  margin-top: 32px;
  display: flex;
  gap: 24px;
`;

const ActionButton = styled.button`
  padding: 14px 28px;
  font-size: 20px;
  font-weight: 500;
  border-radius: 12px;
  background: linear-gradient(to right, #2b3993, #9bb5e3);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(43, 57, 147, 0.3);
    background: linear-gradient(to right, #233077, #8aa6d4);
  }
`;

const Footer = styled.footer`
  background: #c2c2c2;
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  font-size: 18px;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 32px;
  div {
    cursor: pointer;
    transition: opacity 0.3s ease;
    &:hover {
      opacity: 0.8;
    }
  }
`;

// ===== 主組件 =====
export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);
  
  const botCards = [
    {
      title: "同理型 AI",
      image: bot1,
      features: "擅長建立溫暖、接納的氛圍，引導使用者覺察情緒並與之共處",
      suitable: "孤獨感、低自尊、情感失落、自我懷疑、親密關係議題"
    },
    {
      title: "洞察型 AI", 
      image: bot2,
      features: "長於探索潛意識與潛藏動機，引導使用者對過往經驗進行深層理解",
      suitable: "反覆的人際模式、創傷經驗、自我價值疑問、夢境探索、內在空虛感"
    },
    {
      title: "解決型 AI",
      image: bot6,
      features: "現實導向，強調目標設定與資源活用，能快速聚焦在問題解決上",
      suitable: "職場壓力、衝突處理、時間管理、短期決策困難、日常壓力應對"
    },
    {
      title: "認知型 AI",
      image: bot4,
      features: "結構明確、邏輯清晰，擅長分析非理性思考並提供認知重建步驟",
      suitable: "負面自我對話、焦慮、完美主義、拖延、情緒管理"
    }
  ];
  
  // 單個卡片的寬度（包含外邊距）
  const cardWidth = 340;
  const cardGap = 40;
  const cardFullWidth = cardWidth + cardGap;
  
  // 服務流程步驟資料
  const serviceSteps = [
    {
      title: "為你找到最懂你的AI夥伴",
      icon: <MdEmojiPeople size={24} />,
      content: "根據你的心理特質，\n媒合一位陪你傾聽、\n懂你心情節奏的AI朋友。"
    },
    {
      title: "展開屬於你的對話旅程",
      icon: <MdChat size={24} />,
      content: "隨時分享你的心情，\n探索自己的情緒地圖，\n沒有壓力、沒有評價。"
    },
    {
      title: "一起守護你的情緒訊號",
      icon: <MdFavorite size={24} />,
      content: "在陪伴中，AI夥伴也會細心留意情緒波動，\n當需要更多支持時，溫柔提醒你有其他資源可以依靠。"
    },
    {
      title: "連結更多專業的幫助",
      icon: <MdPsychology size={24} />,
      content: "如果需要，我們會在你的同意下，\n協助你快速找到校方的專業心理師，\n讓支持更及時到達你身邊。"
    }
  ];
  
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    const shouldScroll =
      location.hash === "#robots" || location.state?.scrollTo === "robots";
    if (shouldScroll) {
      // 等畫面渲染完成再捲
      setTimeout(() => {
        document
          .getElementById("robot-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [location]);

  // 滾動到下一個或上一個卡片
  const scrollToCard = (direction) => {
    const ref = scrollRef.current;
    if (!ref) return;
    
    const scrollAmount = direction === 'next' ? cardFullWidth : -cardFullWidth;
    
    ref.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <Container>
      <Header>
        <Logo>
          <img src={logoIcon} alt="logo" style={{ height: "68px", marginRight: "8px" }} />
          Emobot+
        </Logo>
        <RightSection>
          <Nav>
            <div onClick={() => navigate("/Home")}>主頁</div>
            <div onClick={() => {
              const section = document.getElementById("robot-section");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              }
            }}>
              機器人介紹
            </div>
            <div onClick={() => navigate("/mood")}>聊天</div>
            <div onClick={() => navigate("/about-us")}>關於我們</div>
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
            <StartButton onClick={() => navigate("/Login")}>
              開始對話
            </StartButton>
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
            {botCards.map((card, index) => (
              <ScrollCard key={index} data-aos="fade-up" data-aos-delay={100 + index * 100}>
                <CardImageContainer>
                  <CardImg src={card.image} alt={card.title} />
                </CardImageContainer>
                
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
          <CarouselButton onClick={() => scrollToCard('prev')}>
            ‹
          </CarouselButton>
          <CarouselButton onClick={() => scrollToCard('next')}>
            ›
          </CarouselButton>
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
                <TimelineTitle>
                  <TimelineIcon $isOdd={index % 2 === 0}>
                    {step.icon}
                  </TimelineIcon>
                  {step.title}
                </TimelineTitle>
                <TimelineText>{step.content}</TimelineText>
              </TimelineContent>
            </TimelineItem>
          ))}
        </TimelineContainer>
      </ServiceIntroSection>

      <AboutSection>
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
          <ActionRow>
            <ActionButton onClick={() => navigate("/test")}>立即開始配對</ActionButton>
            <ActionButton>FAQ</ActionButton>
          </ActionRow>
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
    </Container>
  );
}