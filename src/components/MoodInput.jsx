// src/components/MoodInput.jsx
import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import botTemp from "../assets/bot_temp.png";
import { IoSend } from "react-icons/io5";
import { FiChevronLeft, FiMic } from "react-icons/fi";
import introVideo from "../assets/demo_video_2.mov";
import secondVideo from "../assets/demo_video_3.mov";
import { sendChatMessage } from "../api/client";

/* ================= 動畫定義（保持原有）================ */
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeInDown = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(-30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const slideInLTR = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-40px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
`;

const fadeInBubble = keyframes`
  from { 
    opacity: 0; 
    transform: scale(0.95) translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: scale(1) translateY(0); 
  }
`;

const pulse = keyframes`
  0% { 
    box-shadow: 0 0 0 0 rgba(122, 194, 221, 0.4); 
  }
  70% { 
    box-shadow: 0 0 0 10px rgba(122, 194, 221, 0); 
  }
  100% { 
    box-shadow: 0 0 0 0 rgba(122, 194, 221, 0); 
  }
`;

const recording = keyframes`
  0% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.1); 
    opacity: 0.8; 
  }
  100% { 
    transform: scale(1); 
    opacity: 1; 
  }
`;

const shimmer = keyframes`
  0% { 
    background-position: -100% 0; 
  }
  100% { 
    background-position: 100% 0; 
  }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

/* ================= 所有原有的樣式保持不變 ================ */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef1f5 100%);
  font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  overflow: hidden;

  @media (min-width: 1025px) {
    background-size: cover;
    background-position: center;
  }

  @media (max-width: 1024px) and (min-width: 769px) {
    background-size: 120%;
    background-position: center 20%;
  }

  @media (max-width: 768px) {
    overflow-y: auto;
    background-size: 140%;
    background-position: center 30%;
  }

  @media (max-width: 480px) {
    background-size: 150%;
    background-position: center 35%;
  }

  @media (max-width: 320px) {
    background-size: 160%;
    background-position: center 40%;
  }
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(43, 57, 147, 0.1);
  box-shadow: 
    0 4px 20px rgba(43, 57, 147, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  z-index: 100;
  animation: ${fadeInDown} 0.8s ease-out both;
  animation-delay: 0.3s;

  @media (max-width: 1024px) and (min-width: 769px) {
    height: 60px;
    padding: 0 16px;
  }

  @media (max-width: 768px) {
    height: 55px;
    padding: 0 12px;
  }

  @media (max-width: 480px) {
    height: 50px;
    padding: 0 10px;
  }

  @media (max-width: 320px) {
    height: 48px;
    padding: 0 8px;
  }
`;

const BackButton = styled.button`
  background: transparent;
  color: #2e2f5e;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  border: 1px solid rgba(46, 47, 94, 0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
    transition: left 0.6s ease;
  }

  &:hover {
    background: rgba(46, 47, 94, 0.05);
    transform: translateX(-2px) scale(1.02);
    box-shadow: 0 4px 12px rgba(46, 47, 94, 0.15);
    
    &:before {
      left: 100%;
    }
  }

  &:active {
    transform: translateX(-1px) scale(0.98);
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px 14px;
    gap: 6px;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 6px 10px;
    gap: 4px;
    border-radius: 8px;
  }

  @media (max-width: 320px) {
    font-size: 11px;
    padding: 4px 8px;
  }
`;

const ModeSelect = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 6px;
  border-radius: 14px;
  display: flex;
  gap: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 4px;
    gap: 2px;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    padding: 3px;
    border-radius: 10px;
  }

  @media (max-width: 320px) {
    display: none;
  }
`;

const ModeButton = styled.button`
  padding: 10px 22px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  background: ${p => p.active ? 'linear-gradient(45deg, #2e2f5e, #5a5b9f)' : 'transparent'};
  color: ${p => p.active ? '#fff' : '#555'};
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${p => p.active ? 'linear-gradient(45deg, #2e2f5e, #5a5b9f)' : 'rgba(0, 0, 0, 0.05)'};
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 13px;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 6px;
  }
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    gap: 8px;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const BotAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${p => p.bg || 'linear-gradient(45deg, #7AC2DD, #5A8CF2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(90, 140, 242, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(90, 140, 242, 0.4);
  }

  @media (max-width: 1024px) and (min-width: 769px) {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  @media (max-width: 768px) {
    width: 34px;
    height: 34px;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  @media (max-width: 320px) {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }
`;

const BotInfo = styled.div`
  display: flex;
  flex-direction: column;
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const BotName = styled.span`
  font-weight: 700;
  font-size: 16px;
  color: #2e2f5e;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const BotStatus = styled.span`
  font-size: 13px;
  color: #65B741;

  @media (max-width: 768px) {
    font-size: 11px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const Layout = styled.div`
  flex: 1;
  display: flex;
  padding: 100px 40px 140px;
  box-sizing: border-box;
  overflow: hidden;
  gap: 30px;

  @media (max-width: 1024px) and (min-width: 769px) {
    padding: 80px 24px 120px;
    gap: 20px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 70px 16px 150px;
    overflow-y: auto;
    gap: 16px;
  }

  @media (max-width: 480px) {
    padding: 60px 12px 160px;
    gap: 12px;
  }

  @media (max-width: 320px) {
    padding: 56px 8px 180px;
    gap: 8px;
  }
`;

const VideoColumn = styled.div`
  position: relative;
  top: 60px;
  width: 45%;
  max-width: 520px;
  display: ${p => p.show ? 'block' : 'none'};
  padding-right: 30px;

  @media (max-width: 1024px) and (min-width: 769px) {
    width: 40%;
    top: 40px;
    padding-right: 20px;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    top: 0;
    padding-right: 0;
    margin-bottom: 20px;
    order: 1;
  }

  @media (max-width: 480px) {
    margin-bottom: 16px;
  }

  @media (max-width: 320px) {
    margin-bottom: 12px;
  }
`;

const DemoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 85vh;
  max-height: 700px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);

  @media (max-width: 1024px) and (min-width: 769px) {
    height: 70vh;
    max-height: 500px;
    border-radius: 16px;
  }

  @media (max-width: 768px) {
    height: 220px;
    max-height: 250px;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    height: 180px;
    max-height: 200px;
    border-radius: 10px;
  }

  @media (max-width: 320px) {
    height: 150px;
    max-height: 170px;
    border-radius: 8px;
  }
`;

const DemoVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 1.2s ease-in-out;
  opacity: ${p => p.visible ? 1 : 0};
`;

const FallbackImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 1.2s ease-in-out;
  opacity: ${p => p.visible ? 1 : 0};
`;

const ChatColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  scroll-behavior: smooth;

  @media (max-width: 768px) {
    flex: none;
    height: auto;
    min-height: 350px;
    order: 2;
  }

  @media (max-width: 480px) {
    min-height: 300px;
  }

  @media (max-width: 320px) {
    min-height: 250px;
  }
`;

const FadeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  animation: ${fadeIn} 1s ease-out forwards;
  padding: 20px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }

  @media (max-width: 320px) {
    padding: 8px;
  }
`;

const Description = styled.div`
  margin: auto;
  text-align: center;
  max-width: 600px;
  animation: ${fadeIn} 1s ease-out forwards;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const Title = styled.h1`
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(45deg, #2e2f5e 30%, #5A8CF2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 1024px) and (min-width: 769px) {
    font-size: 36px;
    margin-bottom: 14px;
  }

  @media (max-width: 768px) {
    font-size: 30px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
    margin-bottom: 10px;
  }

  @media (max-width: 320px) {
    font-size: 20px;
    margin-bottom: 8px;
  }
`;

const Subtitle = styled.p`
  font-size: 22px;
  color: #666;
  line-height: 1.7;
  opacity: 0;
  animation: ${fadeIn} 1s ease-out 0.5s forwards;

  @media (max-width: 1024px) and (min-width: 769px) {
    font-size: 20px;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    font-size: 17px;
    line-height: 1.6;
  }

  @media (max-width: 480px) {
    font-size: 15px;
    line-height: 1.5;
  }

  @media (max-width: 320px) {
    font-size: 13px;
    line-height: 1.4;
  }
`;

const IntroBar = styled.div`
  margin: 0 auto 24px;
  padding: 20px 28px;
  background: linear-gradient(135deg, rgba(122, 194, 221, 0.1) 0%, rgba(90, 140, 242, 0.08) 100%);
  border: 1px solid rgba(122, 194, 221, 0.2);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(122, 194, 221, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.6;
  animation: ${fadeInDown} 0.6s ease-out, ${float} 4s ease-in-out 1s infinite;
  max-width: 600px;
  white-space: pre-wrap;
  text-align: center;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  color: #2e2f5e;

  @media (max-width: 768px) {
    margin: 0 auto 18px;
    padding: 16px 20px;
    font-size: 14px;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    margin: 0 auto 14px;
    padding: 12px 16px;
    font-size: 13px;
    border-radius: 10px;
  }

  @media (max-width: 320px) {
    margin: 0 auto 10px;
    padding: 10px 12px;
    font-size: 12px;
    border-radius: 8px;
  }
`;

const DateDivider = styled.div`
  text-align: center;
  margin: 20px 0;
  position: relative;

  &:before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(0, 0, 0, 0.1);
    z-index: -1;
  }

  @media (max-width: 768px) {
    margin: 16px 0;
  }

  @media (max-width: 480px) {
    margin: 12px 0;
  }

  @media (max-width: 320px) {
    margin: 10px 0;
  }
`;

const DateLabel = styled.span`
  background: #f0f4f8;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 14px;
  }

  @media (max-width: 320px) {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 12px;
  }
`;

const ChatBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 10px;
  padding-bottom: 20px;
  overflow-y: auto;
  animation: ${slideInLTR} 0.4s ease-out both;

  @media (max-width: 768px) {
    gap: 12px;
    padding-right: 5px;
    padding-bottom: 16px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    padding-right: 3px;
    padding-bottom: 12px;
  }

  @media (max-width: 320px) {
    gap: 8px;
    padding-right: 2px;
    padding-bottom: 10px;
  }
`;

const renderEmphasis = (text = "") => {
  if (!text) return null;
  
  const parts = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|『[^』]+』|「[^」]+」|《[^》]+》|〈[^〉]+〉)/g);
  
  return parts.map((seg, i) => {
    if (!seg) return null;

    if (/^\*\*\*[^*]+\*\*\*$/.test(seg)) {
      return (
        <strong key={i} style={{ 
          color: '#2e2f5e', 
          fontWeight: '700',
          textShadow: '0 1px 2px rgba(46, 47, 94, 0.1)',
          letterSpacing: '0.5px'
        }}>
          {seg.slice(3, -3)}
        </strong>
      );
    }

    if (/^\*\*[^*]+\*\*$/.test(seg)) {
      return <strong key={i} style={{ fontWeight: '600' }}>{seg.slice(2, -2)}</strong>;
    }

    if (/^『.*』$/.test(seg) || /^「.*」$/.test(seg) || /^《.*》$/.test(seg) || /^〈.*〉$/.test(seg)) {
      return <strong key={i} style={{ fontWeight: '600' }}>{seg.slice(1, -1).trim()}</strong>;
    }

    return <React.Fragment key={i}>{seg}</React.Fragment>;
  });
};

const BubbleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${p => p.sender === 'user' ? 'flex-end' : 'flex-start'};
  max-width: 85%;
  align-self: ${p => p.sender === 'user' ? 'flex-end' : 'flex-start'};

  @media (max-width: 768px) {
    max-width: 90%;
  }

  @media (max-width: 480px) {
    max-width: 95%;
  }
`;

const BubbleHeader = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 0 8px;
    gap: 4px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 0 6px;
    gap: 3px;
  }

  @media (max-width: 320px) {
    font-size: 9px;
    padding: 0 4px;
    gap: 2px;
  }
`;

const SenderAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${p => p.sender === 'user' ? '#5A8CF2' : 'linear-gradient(135deg, #7AC2DD, #5A8CF2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  font-size: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    font-size: 8px;
  }

  @media (max-width: 480px) {
    width: 16px;
    height: 16px;
    font-size: 7px;
  }

  @media (max-width: 320px) {
    width: 14px;
    height: 14px;
    font-size: 6px;
  }
`;

const ChatBubble = styled.div`
  background: ${p => p.sender === 'user' 
    ? 'linear-gradient(135deg, #5A8CF2, #7A72E0)' 
    : 'white'};
  color: ${p => p.sender === 'user' ? 'white' : '#333'};
  padding: 14px 20px;
  border-radius: ${p => p.sender === 'user' 
    ? '18px 18px 4px 18px' 
    : '18px 18px 18px 4px'};
  max-width: 100%;
  box-shadow: ${p => p.sender === 'user' 
    ? '0 4px 12px rgba(90, 140, 242, 0.2)' 
    : '0 4px 12px rgba(0, 0, 0, 0.08)'};
  white-space: pre-wrap;
  animation: ${fadeInBubble} 0.3s ease-out;
  line-height: 1.5;
  font-size: 15px;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 13px;
    border-radius: ${p => p.sender === 'user' 
      ? '14px 14px 4px 14px' 
      : '14px 14px 14px 4px'};
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
    border-radius: ${p => p.sender === 'user' 
      ? '12px 12px 3px 12px' 
      : '12px 12px 12px 3px'};
  }

  @media (max-width: 320px) {
    padding: 6px 10px;
    font-size: 11px;
    border-radius: ${p => p.sender === 'user' 
      ? '10px 10px 3px 10px' 
      : '10px 10px 10px 3px'};
  }
`;

const MessageTime = styled.span`
  font-size: 11px;
  color: #999;

  @media (max-width: 768px) {
    font-size: 10px;
  }

  @media (max-width: 480px) {
    font-size: 9px;
  }

  @media (max-width: 320px) {
    font-size: 8px;
  }
`;

const TypingBubble = styled(ChatBubble)`
  width: 60px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  @media (max-width: 768px) {
    width: 50px;
    height: 28px;
    gap: 3px;
  }

  @media (max-width: 480px) {
    width: 44px;
    height: 24px;
    gap: 2px;
  }

  @media (max-width: 320px) {
    width: 38px;
    height: 22px;
    gap: 2px;
  }
`;

const TypingDot = styled.div`
  width: 8px;
  height: 8px;
  background: #888;
  border-radius: 50%;
  opacity: 0.8;
  animation: ${p => keyframes`
    0%, 100% { 
      transform: translateY(0); 
      opacity: 0.8; 
    }
    50% { 
      transform: translateY(-4px); 
      opacity: 1; 
    }
  `} ${p => p.delay}s infinite ease-in-out;

  @media (max-width: 768px) {
    width: 6px;
    height: 6px;
  }

  @media (max-width: 480px) {
    width: 5px;
    height: 5px;
  }

  @media (max-width: 320px) {
    width: 4px;
    height: 4px;
  }
`;

const InputArea = styled.div`
  position: fixed;
  bottom: 35px;
  left: ${p => p.isVideoMode ? '70%' : '50%'};
  transform: translateX(-50%);
  width: ${p => p.isVideoMode ? '50%' : '90%'};
  max-width: ${p => p.isVideoMode ? 'none' : '1440px'};
  min-width: 320px;
  background: ${p => p.disabled 
    ? 'rgba(240, 240, 240, 0.95)' 
    : 'rgba(255, 255, 255, 0.98)'};
  border-radius: 14px;
  display: flex;
  align-items: center;
  padding: 6px 10px;
  backdrop-filter: blur(15px);
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: 94%;
    max-width: none;
    min-width: auto;
    padding: 4px 8px;
    border-radius: 14px;
  }

  @media (max-width: 480px) {
    bottom: 12px;
    width: 96%;
    padding: 3px 6px;
    border-radius: 12px;
  }

  @media (max-width: 320px) {
    bottom: 10px;
    width: 98%;
    padding: 2px 4px;
    border-radius: 10px;
  }
`;

const InputField = styled.input`
  flex: 1;
  font-size: 16px;
  background: transparent;
  border: none;
  outline: none;
  padding: 14px 20px;
  color: ${p => p.disabled ? '#999' : '#333'};
  cursor: ${p => p.disabled ? 'not-allowed' : 'text'};
  font-family: inherit;
  line-height: 1.5;
  
  &::placeholder {
    color: ${p => p.disabled ? '#aaa' : '#999'};
    font-style: italic;
    transition: color 0.3s ease;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 16px;
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 16px;
  }

  @media (max-width: 320px) {
    padding: 4px 8px;
    font-size: 16px;
  }
`;

const InputButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 8px;

  @media (max-width: 768px) {
    gap: 6px;
    padding-right: 4px;
  }

  @media (max-width: 480px) {
    gap: 4px;
    padding-right: 2px;
  }

  @media (max-width: 320px) {
    gap: 14px;
    padding-right: 1px;
  }
`;

const ActionButton = styled.button`
  width: 44px;
  height: 44px;
  background: ${p => p.isRecording 
    ? 'rgba(234, 84, 85, 0.1)' 
    : 'transparent'};
  border-radius: 50%;
  border: none;
  color: ${p => p.isRecording ? '#EA5455' : '#888'};
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${p => p.isRecording ? recording : 'none'} 1.5s infinite;
  opacity: ${p => p.disabled ? 0.5 : 1};

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  @media (max-width: 320px) {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
`;

const SendButton = styled.button`
  width: 50px;
  height: 50px;
  background: ${p => p.disabled 
    ? '#ccc' 
    : 'linear-gradient(135deg, #7AC2DD, #5A8CF2)'};
  border-radius: 50%;
  border: none;
  color: white;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${p => p.active && !p.disabled ? pulse : 'none'} 1.5s infinite;
  opacity: ${p => p.disabled ? 0.7 : 1};
  box-shadow: 0 4px 12px rgba(122, 194, 221, 0.3);

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  @media (max-width: 320px) {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
`;

const StatusMessage = styled.div`
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 12px 20px;
  border-radius: 24px;
  font-size: 14px;
  z-index: 101;
  animation: ${fadeInDown} 0.3s ease-out;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  max-width: 90%;
  text-align: center;

  @media (max-width: 768px) {
    bottom: 80px;
    font-size: 13px;
    padding: 10px 16px;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    bottom: 70px;
    font-size: 12px;
    padding: 8px 12px;
    border-radius: 16px;
  }

  @media (max-width: 320px) {
    bottom: 60px;
    font-size: 11px;
    padding: 6px 10px;
    border-radius: 14px;
  }
`;

const WelcomeAnimation = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 80px;
  font-weight: bold;
  color: #2b3993;
  z-index: 200;
  opacity: ${p => p.visible ? 1 : 0};
  visibility: ${p => p.visible ? 'visible' : 'hidden'};
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 4px 8px rgba(43, 57, 147, 0.2);

  @media (max-width: 1024px) and (min-width: 769px) {
    font-size: 64px;
  }

  @media (max-width: 768px) {
    font-size: 48px;
  }

  @media (max-width: 480px) {
    font-size: 36px;
  }

  @media (max-width: 320px) {
    font-size: 28px;
  }
`;

const fadeInStagger = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const IntroTextOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 200px 40px 40px;
  text-align: center;
  z-index: 200;
  opacity: ${p => p.visible ? 1 : 0};
  visibility: ${p => p.visible ? 'visible' : 'hidden'};
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s;

  @media (max-width: 1024px) and (min-width: 769px) {
    padding: 160px 32px 32px;
  }

  @media (max-width: 768px) {
    padding: 120px 20px 20px;
    justify-content: center;
  }

  @media (max-width: 480px) {
    padding: 100px 16px 16px;
  }

  @media (max-width: 320px) {
    padding: 80px 12px 12px;
  }
`;

const TipHeader = styled.h2`
  font-size: 38px;
  font-weight: 700;
  background: linear-gradient(45deg, #2e2f5e 30%, #5A8CF2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
  animation: ${fadeInStagger} 0.8s ease-out;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 1024px) and (min-width: 769px) {
    font-size: 32px;
    margin-bottom: 14px;
  }

  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
    margin-bottom: 10px;
  }

  @media (max-width: 320px) {
    font-size: 20px;
    margin-bottom: 8px;
  }
`;

const IntroContent = styled.div`
  max-width: 680px;
  width: 100%;
  padding: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  animation: ${fadeInStagger} 0.8s ease-out 0.4s both;
  backdrop-filter: blur(8px);

  @media (max-width: 1024px) and (min-width: 769px) {
    padding: 28px;
    border-radius: 18px;
  }

  @media (max-width: 768px) {
    padding: 24px 20px;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 20px 16px;
    border-radius: 14px;
  }

  @media (max-width: 320px) {
    padding: 16px 12px;
    border-radius: 12px;
  }
`;

const IntroText = styled.p`
  font-size: 23px;
  color: #4a5568;
  line-height: 1.8;
  margin: 0;
  font-weight: 400;

  @media (max-width: 1024px) and (min-width: 769px) {
    font-size: 20px;
    line-height: 1.7;
  }

  @media (max-width: 768px) {
    font-size: 18px;
    line-height: 1.6;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    line-height: 1.5;
  }

  @media (max-width: 320px) {
    font-size: 14px;
    line-height: 1.4;
  }
`;

const Disclaimer = styled.div`
  position: fixed;
  bottom: 4px;
  left: ${p => p.isVideoMode ? '70%' : '50%'};
  transform: translateX(-50%);
  width: 90%;
  max-width: 1440px;
  font-size: 12px;
  color: #666;
  text-align: center;
  padding: 4px 8px;
  z-index: 100;
  transition: left 0.3s ease;

  @media (max-width: 768px) {
    position: fixed;
    bottom: 1px;
    left: 50%;
    transform: translateX(-50%);
    width: 95%;
    font-size: 10px;
    padding: 2px 4px;
  }

  @media (max-width: 480px) {
    font-size: 9px;
    padding: 1px 2px;
  }

  @media (max-width: 320px) {
    font-size: 8px;
    padding: 1px;
  }
`;

/* ================== Bot 定義（保持你的既有設定） ================== */
const BOT_MAP = {
  empathy: {
    name: "Lumi",
    letter: "L",
    avatarBg: "linear-gradient(45deg, #FFB6C1, #FF8FB1)",
    tagline: "Lumi — 用溫柔與共感陪你說說話。",
    subtitle: "溫暖陪伴、情緒承接與安撫，讓你被好好地聆聽與理解。",
    system: "你是Lumi，同理型AI。以溫柔、非評判、短句的反映傾聽與情緒標記來回應。優先肯認、共感與陪伴。",
  },
  insight: {
    name: "Solin",
    letter: "S",
    avatarBg: "linear-gradient(45deg, #7AC2DD, #5A8CF2)",
    tagline: "Solin — 一起澄清、看見新的可能。",
    subtitle: "以溫柔的提問與澄清，幫助梳理線索、找出關鍵與洞見。",
    system: "你是Solin，洞察型AI。以蘇格拉底式提問、澄清與澄清，幫助使用者澄清想法，維持中性、尊重、結構化。",
  },
  solution: {
    name: "Niko",
    letter: "N",
    avatarBg: "linear-gradient(45deg, #7AC2DD, #5A8CF2)",
    tagline: "Niko — 一起做點能改變的事。",
    subtitle: "聚焦可行步驟與微目標，幫助把感受轉成行動與支持。",
    system: "你是Niko，解決型AI。以務實、具體的建議與分步行動為主，給出小目標、工具與下一步，語氣鼓勵但不強迫。",
  },
  cognitive: {
    name: "Clara",
    letter: "C",
    avatarBg: "linear-gradient(45deg, #8D8DF2, #5A5B9F)",
    tagline: "Clara — 一起練習看見思緒的樣子。",
    subtitle: "以認知重建、想法檢核、替代想法等，幫你和腦內小劇場溫柔同桌。",
    system: "你是Clara，認知型AI。以CBT語氣幫助辨識自動想法、認知偏誤與替代想法，提供簡短表格式步驟與練習。",
  },
};

export default function MoodInput() {
  const navigate = useNavigate();

  /* ============ 基本聊天狀態 ============ */
  const [mode, setMode] = useState("video");
  const [inputValue, setInputValue] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showIntroText, setShowIntroText] = useState(false);

  const chatBoxRef = useRef(null);
  const [isSecondVideo, setIsSecondVideo] = useState(false);
  const [playIntroVideo, setPlayIntroVideo] = useState(false);
  const videoRef = useRef(null);

  /* ============ D-ID 狀態 ============ */
  const DID_ENABLED =
    String(import.meta?.env?.VITE_DID_ENABLED ?? process.env.REACT_APP_DID_ENABLED ?? "true")
      .toLowerCase() === "true";
  const DID_VOICE_ID = import.meta?.env?.VITE_DID_VOICE_ID || process.env.REACT_APP_DID_VOICE_ID || "zh-TW-HsiaoChenNeural";
  const DID_SOURCE_URL = import.meta?.env?.VITE_DID_SOURCE_URL || process.env.REACT_APP_DID_SOURCE_URL || ""; // 可省略，後端會用環境變數
  const [didReady, setDidReady] = useState(false);
  const [didVideoUrl, setDidVideoUrl] = useState(null);
  const [didTalkId, setDidTalkId] = useState(null);

  /* ============ 其餘參考資料 ============ */
  const selectedBotType = (localStorage.getItem("selectedBotType") || "solution");
  const bot = BOT_MAP[selectedBotType] || BOT_MAP.solution;
  const selectedBotImage = localStorage.getItem("selectedBotImage") || botTemp;
  const nickname = (JSON.parse(localStorage.getItem("user") || "{}").nickname) || "你";
  const API_BASE =
    (import.meta?.env?.VITE_API_BASE) ||
    (process.env.REACT_APP_API_BASE) ||
    "";

  /* ============ 輔助：狀態提示 ============ */
  const showStatus = (message, duration = 3000) => {
    setStatusMessage(message);
    if (duration > 0) {
      setTimeout(() => setStatusMessage(null), duration);
    }
  };

  /* ============ 進場動畫 ============ */
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
      setShowIntroText(true);
      const introTimer = setTimeout(() => setShowIntroText(false), 3000);
      return () => clearTimeout(introTimer);
    }, 1000);
    return () => clearTimeout(welcomeTimer);
  }, []);

  /* ============ 自動滾到底部 ============ */
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  /* ============ D-ID 健康檢查 ============ */
  useEffect(() => {
    if (!DID_ENABLED) return;
    const url = `${API_BASE}/api/chat/did/health`.replace(/\/{2,}/g, "/").replace(":/", "://");
    fetch(url)
      .then((r) => r.json())
      .then((d) => setDidReady(Boolean(d?.ok)))
      .catch(() => setDidReady(false));
  }, [API_BASE, DID_ENABLED]);

  /* ============ Demo 影片播放控制 ============ */
  useEffect(() => {
    if (playIntroVideo && videoRef.current) {
      try {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      } catch {}
    }
  }, [playIntroVideo]);

  /* ============ D-ID：建立影片並輪詢取結果 ============ */
  async function createDidVideoFromText(text) {
    if (!DID_ENABLED || !didReady) return null;
    try {
      setDidVideoUrl(null);
      showStatus("正在生成影片…這通常需要 3–10 秒", 0);

      const createUrl = `${API_BASE}/api/chat/did/create_talk`.replace(/\/{2,}/g, "/").replace(":/", "://");
      const res = await fetch(createUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          text,
          voice_id: DID_VOICE_ID,
          source_url: DID_SOURCE_URL || undefined,
          config: { fluent: true, pad_audio: 0.5 },
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`HTTP ${res.status}: ${msg}`);
      }
      const data = await res.json();
      const talkId = data?.talk_id;
      if (!talkId) throw new Error("D-ID 建立任務失敗：talk_id 缺失");
      setDidTalkId(talkId);

      // 輪詢結果
      const infoUrlBase = `${API_BASE}/api/chat/did/get_talk/`.replace(/\/{2,}/g, "/").replace(":/", "://");
      const started = Date.now();
      const timeoutMs = 60_000;
      const intervalMs = 1500;

      while (Date.now() - started < timeoutMs) {
        await new Promise(r => setTimeout(r, intervalMs));
        const infoRes = await fetch(infoUrlBase + encodeURIComponent(talkId), {
          headers: {
            "Accept": "application/json",
            ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}),
          },
          credentials: "include",
        });
        const info = await infoRes.json();
        if (info?.status === "done" && info?.result_url) {
          setDidVideoUrl(info.result_url);
          setStatusMessage(null);
          return info.result_url;
        }
        if (info?.status === "error") {
          throw new Error(info?.raw?.error || "D-ID 生成發生錯誤");
        }
      }

      throw new Error("等待 D-ID 影片逾時");
    } catch (err) {
      console.warn("D-ID 影片生成失敗：", err);
      showStatus("影片生成失敗，將以文字模式繼續", 3000);
      return null;
    }
  }

  /* ============ 開始對話（支援 video / text） ============ */
  const startConversation = async () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const first = { 
      sender: "ai", 
      content: `嗨 ${nickname}，我是 ${bot.name}。今天想從哪裡開始呢？`, 
      timestamp: now 
    };
    setMessages([first]);
    setChatStarted(true);

    // 先回送 demo 動畫（若 video 模式）
    if (mode === "video") {
      // 若 D-ID 可用，立即生成；否則 fallback demo
      if (DID_ENABLED && didReady) {
        const url = await createDidVideoFromText(first.content);
        if (url && videoRef.current) {
          videoRef.current.src = url;
          try { await videoRef.current.play(); } catch {}
        }
      } else {
        setPlayIntroVideo(true);
      }
    }

    // 回報後端（保持原邏輯）
    await sendChatMessage(first.content, selectedBotType, mode, [{ role: "assistant", content: first.content }], true);
  };

  /* ============ 快捷鍵：空白鍵開始對話 ============ */
  useEffect(() => {
    const handleSpace = e => {
      if (e.code === 'Space' && !chatStarted) {
        e.preventDefault();
        startConversation();
      }
    };
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [chatStarted]);

  /* ============ 傳送訊息 ============ */
  const handleSend = async () => {
    if (!inputValue.trim() && !isRecording) return;

    if (!chatStarted) { 
      await startConversation(); 
      return; 
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgText = isRecording ? "[語音訊息]" : inputValue;

    setMessages(prev => [...prev, { sender: "user", content: userMsgText, timestamp: now }]);
    setInputValue("");
    setInputDisabled(true);
    setIsTyping(true);
    if (isRecording) setIsRecording(false);

    const history = [...messages, { sender: "user", content: userMsgText, timestamp: now }]
      .map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.content }));

    try {
      const result = await sendChatMessage(userMsgText, selectedBotType, mode, history);
      
      if (result?.ok && result.reply) {
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const aiMsg = { sender: "ai", content: result.reply, timestamp: replyTime };
        setMessages(prev => [...prev, aiMsg]);

        // 視訊模式：用 D-ID 生成嘴型同步影片；若不可用，維持 demo 影片
        if (mode === "video") {
          if (DID_ENABLED && didReady) {
            const url = await createDidVideoFromText(result.reply);
            if (url && videoRef.current) {
              videoRef.current.src = url;
              try { await videoRef.current.play(); } catch {}
            }
          } else {
            setIsSecondVideo(true);
            setPlayIntroVideo(true);
          }
        }
      } else {
        throw new Error(result?.error || "API 回傳格式錯誤");
      }
    } catch (error) {
      console.error("Chat API failed:", error);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fallbackReply = mode === "video"
        ? "我在這裡，先一起做個小小的深呼吸。想和我說說剛剛最在意的一件事嗎？"
        : "收到，讓我們一步一步來。想先從今天最困擾你的情境開始聊聊嗎？";
      setMessages(prev => [...prev, { sender: "ai", content: fallbackReply, timestamp: replyTime }]);

      // 視訊模式下也嘗試生成 D-ID 影片（若可用）
      if (mode === "video" && DID_ENABLED && didReady) {
        const url = await createDidVideoFromText(fallbackReply);
        if (url && videoRef.current) {
          videoRef.current.src = url;
          try { await videoRef.current.play(); } catch {}
        }
      }
    }

    setIsTyping(false);
    setInputDisabled(false);
  };

  /* ============ 語音按鈕（保留原有行為） ============ */
  const handleVoiceButton = () => {
    if (inputDisabled) return;
    if (isRecording) {
      setIsRecording(false);
      showStatus("語音錄製已停止");
      handleSend();
    } else {
      setIsRecording(true);
      showStatus("正在錄製語音... 再次點擊結束錄製");
      navigator.mediaDevices?.getUserMedia?.({ audio: true })
        .then(() => {})
        .catch(err => {
          console.error("無法取得麥克風權限:", err);
          setIsRecording(false);
          showStatus("無法取得麥克風權限");
        });
    }
  };

  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <Container>
      <WelcomeAnimation visible={showWelcome}>
        Welcome Emobot+
      </WelcomeAnimation>
      
      <IntroTextOverlay visible={showIntroText}>
        <TipHeader>溫馨提醒</TipHeader>
        <IntroContent>
          <IntroText>
            當你結束這段對話時，<br/>
            系統會詢問你是否願意分享今天的聊天內容。<br/>
            只有在你同意的情況下，這些紀錄才會提供給心理專業人員，<br/>
            幫助你獲得更適切的支持與關懷。<br/>
            我們會溫柔守護你的每一份選擇。
          </IntroText>
        </IntroContent>
      </IntroTextOverlay>

      <Header>
        <BackButton onClick={() => navigate("/dashboard")}>
          <FiChevronLeft size={18} />
          {chatStarted ? '離開對話' : '離開'}
        </BackButton>

        {!chatStarted && (
          <ModeSelect>
            <ModeButton 
              active={mode === "text"} 
              onClick={() => setMode("text")}
            >
              文字模式
            </ModeButton>
            <ModeButton 
              active={mode === "video"} 
              onClick={() => setMode("video")}
            >
              影像模式
            </ModeButton>
          </ModeSelect>
        )}

        {chatStarted && (
          <AvatarContainer>
            <BotInfo>
              <BotName>{bot.name}</BotName>
              <BotStatus>在線上</BotStatus>
            </BotInfo>
            <BotAvatar bg={bot.avatarBg}>{bot.letter}</BotAvatar>
          </AvatarContainer>
        )}
      </Header>

      <Layout>
        {mode === "video" && (
          <VideoColumn show={true}>
            <DemoContainer>
              {/* 優先播放 D-ID 生成的影片；若暫無，保留原本 demo 視訊退場用 */}
              <FallbackImage 
                src={selectedBotImage} 
                visible={!didVideoUrl && !playIntroVideo} 
              />
              <DemoVideo 
                ref={videoRef} 
                src={didVideoUrl || (isSecondVideo ? secondVideo : introVideo)} 
                visible={Boolean(didVideoUrl) || playIntroVideo}
                onEnded={() => { 
                  setPlayIntroVideo(false); 
                  try { videoRef.current.pause(); } catch {} 
                }} 
                controls
                playsInline
              />
            </DemoContainer>
          </VideoColumn>
        )}

        <ChatColumn>
          {!chatStarted ? (
            <FadeWrapper key={mode}>
              <Description>
                <Title>分享一下今天的心情吧！</Title>
                <Subtitle>{bot.name} — {bot.subtitle}</Subtitle>
              </Description>
            </FadeWrapper>
          ) : (
            <>
              <IntroBar>{bot.tagline}</IntroBar>
              <DateDivider>
                <DateLabel>{today}</DateLabel>
              </DateDivider>
              <ChatBox ref={chatBoxRef}>
                {messages.map((m, i) => (
                  <BubbleWrapper key={i} sender={m.sender}>
                    <BubbleHeader>
                      <SenderAvatar sender={m.sender}>
                        {m.sender === "user" ? (nickname?.[0] || "你") : bot.letter}
                      </SenderAvatar>
                      {m.sender === "user" ? nickname : `${bot.name} AI`} 
                      <MessageTime>{m.timestamp}</MessageTime>
                    </BubbleHeader>
                    <ChatBubble sender={m.sender}>
                      {renderEmphasis(m.content)}
                    </ChatBubble>
                  </BubbleWrapper>
                ))}
                {isTyping && (
                  <BubbleWrapper sender="ai">
                    <BubbleHeader>
                      <SenderAvatar sender="ai">{bot.letter}</SenderAvatar>
                      {bot.name} 正在輸入...
                    </BubbleHeader>
                    <TypingBubble>
                      <TypingDot delay={0.4} />
                      <TypingDot delay={0.6} />
                      <TypingDot delay={0.8} />
                    </TypingBubble>
                  </BubbleWrapper>
                )}
              </ChatBox>
            </>
          )}
        </ChatColumn>
      </Layout>

      {statusMessage && <StatusMessage>{statusMessage}</StatusMessage>}

      <InputArea disabled={inputDisabled} isVideoMode={mode === "video"}>
        <InputField
          placeholder={
            inputDisabled 
              ? "請等待回覆..." 
              : isRecording 
                ? "正在錄製語音..." 
                : "將你的心情寫在這裡吧！"
          }
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !inputDisabled && handleSend()}
          disabled={inputDisabled || isRecording}
        />
        <InputButtons>
          <ActionButton 
            onClick={handleVoiceButton} 
            disabled={inputDisabled} 
            isRecording={isRecording}
            aria-label="錄製語音"
            title="錄製語音"
          >
            <FiMic />
          </ActionButton>
          <SendButton 
            onClick={handleSend} 
            active={inputValue.trim().length > 0 || isRecording} 
            disabled={inputDisabled && !isRecording}
            aria-label="送出訊息"
            title="送出訊息"
          >
            <IoSend />
          </SendButton>
        </InputButtons>
      </InputArea>

      <Disclaimer isVideoMode={mode === "video"}>
        AI夥伴無法取代心理診斷與治療，如需進一步幫助，請尋求專業資源。
      </Disclaimer>
    </Container>
  );
}
