// src/components/MoodInput.jsx
import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import botTemp from "../assets/bot_temp.png";
import { IoSend } from "react-icons/io5";
import { FiChevronLeft, FiMic } from "react-icons/fi";
import { sendChatMessage } from "../api/client"; 
import heygenService from "../services/heygenService";

// 動畫定義
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

// 主要容器
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef1f5 100%);
  font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    overflow-y: auto;
  }
`;

// 標題列
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

  @media (max-width: 768px) {
    height: 55px;
    padding: 0 12px;
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

  &:hover {
    background: rgba(46, 47, 94, 0.05);
    transform: translateX(-2px) scale(1.02);
    box-shadow: 0 4px 12px rgba(46, 47, 94, 0.15);
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px 14px;
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

  &:hover {
    background: ${p => p.active ? 'linear-gradient(45deg, #2e2f5e, #5a5b9f)' : 'rgba(0, 0, 0, 0.05)'};
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 13px;
  }
`;

// 頭像區域
const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    gap: 8px;
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

  @media (max-width: 768px) {
    width: 34px;
    height: 34px;
    font-size: 14px;
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
`;

const BotStatus = styled.span`
  font-size: 13px;
  color: #65B741;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

// 主要布局
const Layout = styled.div`
  flex: 1;
  display: flex;
  padding: 100px 40px 140px;
  box-sizing: border-box;
  overflow: hidden;
  gap: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 70px 16px 150px;
    overflow-y: auto;
    gap: 16px;
  }
`;

// 影片區域
const VideoColumn = styled.div`
  position: relative;
  top: 60px;
  width: 45%;
  max-width: 520px;
  display: ${p => p.show ? 'block' : 'none'};
  padding-right: 30px;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    top: 0;
    padding-right: 0;
    margin-bottom: 20px;
    order: 1;
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
  background: #000;

  @media (max-width: 768px) {
    height: 220px;
    max-height: 250px;
    border-radius: 12px;
  }
`;

const StreamVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: ${p => p.visible ? 'block' : 'none'};
  opacity: ${p => p.visible ? 1 : 0};
  transition: opacity 0.6s ease;
`;

const FallbackImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: ${p => p.visible ? 'block' : 'none'};
  opacity: ${p => p.visible ? 1 : 0};
  transition: opacity 0.6s ease;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: ${p => p.visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  backdrop-filter: blur(10px);
`;

// 對話區域
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
`;

const Description = styled.div`
  margin: auto;
  text-align: center;
  max-width: 600px;
  animation: ${fadeIn} 1s ease-out forwards;
`;

const Title = styled.h1`
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(45deg, #2e2f5e 30%, #5A8CF2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 30px;
  }
`;

const Subtitle = styled.p`
  font-size: 22px;
  color: #666;
  line-height: 1.7;
  opacity: 0;
  animation: ${fadeIn} 1s ease-out 0.5s forwards;

  @media (max-width: 768px) {
    font-size: 17px;
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
    0 4px 16px rgba(0, 0, 0, 0.04);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.6;
  animation: ${fadeInDown} 0.6s ease-out;
  max-width: 600px;
  text-align: center;
  color: #2e2f5e;

  @media (max-width: 768px) {
    margin: 0 auto 18px;
    padding: 16px 20px;
    font-size: 14px;
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
`;

const DateLabel = styled.span`
  background: #f0f4f8;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  }
`;

// 訊息泡泡
const BubbleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${p => p.sender === 'user' ? 'flex-end' : 'flex-start'};
  max-width: 85%;
  align-self: ${p => p.sender === 'user' ? 'flex-end' : 'flex-start'};
`;

const BubbleHeader = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 6px;
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

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 13px;
  }
`;

const MessageTime = styled.span`
  font-size: 11px;
  color: #999;
`;

// 輸入中動畫
const TypingBubble = styled(ChatBubble)`
  width: 60px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const TypingDot = styled.div`
  width: 8px;
  height: 8px;
  background: #888;
  border-radius: 50%;
  opacity: 0.8;
  animation: ${float} 1.4s ease-in-out infinite;
  animation-delay: ${p => p.delay}s;
`;

// 輸入區域
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
    0 4px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 
      0 12px 48px rgba(0, 0, 0, 0.12),
      0 6px 20px rgba(0, 0, 0, 0.06);
    transform: translateX(-50%) translateY(-2px);
  }

  @media (max-width: 768px) {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: 94%;
    max-width: none;
    padding: 4px 8px;
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
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 15px;
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

  &:hover {
    background: ${p => p.disabled 
      ? 'transparent' 
      : p.isRecording 
        ? 'rgba(234, 84, 85, 0.2)' 
        : 'rgba(0, 0, 0, 0.05)'};
    transform: ${p => p.disabled ? 'none' : 'scale(1.05)'};
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 14px;
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

  &:hover {
    transform: ${p => p.disabled ? 'none' : 'scale(1.05) translateY(-1px)'};
    box-shadow: ${p => p.disabled 
      ? 'none' 
      : '0 6px 20px rgba(122, 194, 221, 0.4)'};
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
`;

// 狀態提示
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
`;

// 歡迎動畫
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

  @media (max-width: 768px) {
    font-size: 48px;
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

  @media (max-width: 768px) {
    padding: 120px 20px 20px;
    justify-content: center;
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

  @media (max-width: 768px) {
    font-size: 28px;
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
    0 4px 16px rgba(0, 0, 0, 0.04);
  animation: ${fadeInStagger} 0.8s ease-out 0.4s both;
  backdrop-filter: blur(8px);

  @media (max-width: 768px) {
    padding: 24px 20px;
    border-radius: 16px;
  }
`;

const IntroText = styled.p`
  font-size: 23px;
  color: #4a5568;
  line-height: 1.8;
  margin: 0;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 18px;
    line-height: 1.6;
  }
`;

const HighlightText = styled.span`
  color: #2e2f5e;
  font-weight: 600;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #7AC2DD, #5A8CF2);
    opacity: 0.3;
    border-radius: 1px;
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
`;

// Bot 配置
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
    subtitle: "以溫柔的提問與澄清，協助梳理線索、找出關鍵與洞見。",
    system: "你是Solin，洞察型AI。以蘇格拉底式提問、澄清與澄清，幫助使用者澄清想法，維持中性、尊重、結構化。",
  },
  solution: {
    name: "Niko",
    letter: "N",
    avatarBg: "linear-gradient(45deg, #7AC2DD, #5A8CF2)",
    tagline: "Niko — 一起做點能改變的事。",
    subtitle: "聚焦可行步驟與微目標，協助把感受轉成行動與支持。",
    system: "你是Niko，解決型AI。以務實、具體的建議與分步行動為主，給出小目標、工具與下一步，語氣鼓勵但不強迫。",
  },
  cognitive: {
    name: "Clara",
    letter: "C",
    avatarBg: "linear-gradient(45deg, #8D8DF2, #5A5B9F)",
    tagline: "Clara — 一起練習看見思緒的樣子。",
    subtitle: "以認知重建、想法檢核、替代想法等，幫你和腦內小劇場溫柔同桌。",
    system: "你是Clara，認知型AI。以CBT語氣協助辨識自動想法、認知偏誤與替代想法，提供簡短表格式步驟與練習。",
  },
};

// 文字強調處理
const renderEmphasis = (text = "") => {
  if (!text) return null;
  
  const parts = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|『[^『]+』|「[^「]+」|《[^《]+》|〈[^〈]+〉)/g);
  
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

export default function MoodInput() {
  const navigate = useNavigate();
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
  const streamVideoRef = useRef(null);
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [hasActiveStream, setHasActiveStream] = useState(false);

  const selectedBotType = (localStorage.getItem("selectedBotType") || "solution");
  const bot = BOT_MAP[selectedBotType] || BOT_MAP.solution;
  const selectedBotImage = localStorage.getItem("selectedBotImage") || botTemp;
  const nickname = (JSON.parse(localStorage.getItem("user") || "{}").nickname) || "你";

  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  // 進場動畫
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
      setShowIntroText(true);
      const introTimer = setTimeout(() => setShowIntroText(false), 3000);
      return () => clearTimeout(introTimer);
    }, 1000);
    return () => clearTimeout(welcomeTimer);
  }, []);

  // 自動滾到最底
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // 清理 HeyGen 資源
  useEffect(() => {
    return () => {
      if (hasActiveStream) {
        heygenService.endSession();
      }
    };
  }, [hasActiveStream]);

  // 狀態提示
  const showStatus = (message, duration = 3000) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(null), duration);
  };

  // 初始化 HeyGen 串流
  const initializeHeyGenStream = async () => {
    try {
      setIsStreamLoading(true);
      await heygenService.createStreamingSession();
      setHasActiveStream(true);
      
      // 設定影片元素
      const stream = heygenService.getMediaStream();
      if (stream && streamVideoRef.current) {
        streamVideoRef.current.srcObject = stream;
        streamVideoRef.current.play();
      }
      
      setIsStreamLoading(false);
      return true;
    } catch (error) {
      console.error('Failed to initialize HeyGen stream:', error);
      setIsStreamLoading(false);
      showStatus('影像模式初始化失敗，請稍後再試');
      return false;
    }
  };

  const startConversation = async () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const first = { 
      sender: "ai", 
      content: `嗨 ${nickname}，我是 ${bot.name}。今天想從哪裡開始呢？`, 
      timestamp: now 
    };
    setMessages([first]);
    setChatStarted(true);
    
    // 如果是影片模式，初始化 HeyGen
    if (mode === "video") {
      const streamReady = await initializeHeyGenStream();
      if (streamReady) {
        await heygenService.sendTextToSpeak(first.content);
      }
    }
  };

  useEffect(() => {
    const handleSpace = e => {
      if (e.code === 'Space' && !chatStarted) {
        e.preventDefault();
        startConversation();
      }
    };
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [chatStarted, mode]);

  const handleSend = async () => {
    if (!inputValue.trim() && !isRecording) return;

    if (!chatStarted) { 
      await startConversation(); 
      return; 
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let userMsgText = inputValue;
    if (isRecording) userMsgText = "[語音訊息]";
    
    setMessages(prev => [...prev, { 
      sender: "user", 
      content: userMsgText, 
      timestamp: now 
    }]);
    setInputValue("");
    setInputDisabled(true);
    setIsTyping(true);
    if (isRecording) setIsRecording(false);

    const history = [...messages, { 
      sender: "user", 
      content: userMsgText, 
      timestamp: now 
    }].map(m => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.content
    }));

    try {
      const result = await sendChatMessage(userMsgText, selectedBotType, mode, history);
      
      if (result?.ok && result.reply) {
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, { 
          sender: "ai", 
          content: result.reply, 
          timestamp: replyTime 
        }]);
        
        // 如果是影片模式，讓 Avatar 說話
        if (mode === "video" && hasActiveStream) {
          await heygenService.sendTextToSpeak(result.reply);
        }
      } else {
        throw new Error(result?.error || "API 回傳格式錯誤");
      }
    } catch (error) {
      console.error("Chat API failed:", error);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fallbackReply = mode === "video"
        ? "我在這裡陪著你。影像模式暫時有些問題，要不要試試文字模式呢？"
        : "我在這裡陪著你。想聊聊今天最讓你在意的事情嗎？";
      
      setMessages(prev => [...prev, { 
        sender: "ai", 
        content: fallbackReply, 
        timestamp: replyTime 
      }]);
    } finally {
      setIsTyping(false);
      setInputDisabled(false);
    }
  };

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

  const handleModeChange = async (newMode) => {
    if (newMode === mode) return;
    
    // 如果從影片模式切換出去，清理 HeyGen 資源
    if (mode === "video" && hasActiveStream) {
      await heygenService.endSession();
      setHasActiveStream(false);
    }
    
    setMode(newMode);
    
    // 如果切換到影片模式且已經開始對話，初始化 HeyGen
    if (newMode === "video" && chatStarted) {
      await initializeHeyGenStream();
    }
  };

  return (
    <Container>
      <WelcomeAnimation visible={showWelcome}>
        Welcome Emobot+
      </WelcomeAnimation>
      
      <IntroTextOverlay visible={showIntroText}>
        <TipHeader>溫馨提示</TipHeader>
        <IntroContent>
          <IntroText>
            當你結束這段對話時，<br/>
            系統會詢問你是否願意分享今天的聊天內容。<br/>
            只有在你同意的情況下，這些紀錄才會提供給心理專業人員，<br/>
            協助你獲得更適切的支持與關懷。<br/>
            我們會溫柔守護你的每一份選擇。
          </IntroText>
        </IntroContent>
      </IntroTextOverlay>

      <Header>
        <BackButton onClick={() => navigate("/member-dashboard")}>
          <FiChevronLeft size={18} />
          {chatStarted ? '離開對話' : '離開'}
        </BackButton>

        {!chatStarted && (
          <ModeSelect>
            <ModeButton 
              active={mode === "text"} 
              onClick={() => handleModeChange("text")}
            >
              文字模式
            </ModeButton>
            <ModeButton 
              active={mode === "video"} 
              onClick={() => handleModeChange("video")}
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
              <FallbackImage 
                src={selectedBotImage} 
                visible={!hasActiveStream && !isStreamLoading} 
              />
              <StreamVideo 
                ref={streamVideoRef} 
                visible={hasActiveStream && !isStreamLoading}
                autoPlay
                playsInline
              />
              <LoadingOverlay visible={isStreamLoading}>
                正在連接影像...
              </LoadingOverlay>
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
          >
            <FiMic />
          </ActionButton>
          <SendButton 
            onClick={handleSend} 
            active={inputValue.trim().length > 0 || isRecording} 
            disabled={inputDisabled && !isRecording}
          >
            <IoSend />
          </SendButton>
        </InputButtons>
      </InputArea>

      <Disclaimer isVideoMode={mode === "video"}>
        AI夥伴無法取代心理診斷與治療，如需進一步協助，請尋求專業資源。
      </Disclaimer>
    </Container>
  );
}