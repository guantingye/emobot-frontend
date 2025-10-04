// src/components/MoodInput.jsx
import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import botTemp from "../assets/bot_temp.png";
import { IoSend } from "react-icons/io5";
import { FiChevronLeft, FiMic, FiInfo, FiVolume2, FiVolumeX } from "react-icons/fi";
import { sendChatMessage, checkFirstTimeChat } from "../api/client";
import AvatarAnimation from "./AvatarAnimation";

const VIDEO_MAP = {
  solution: "/videos/niko_video.mp4",
  empathy: "/videos/lumi_video.mp4",
  insight: "/videos/solin_video.mp4",
  cognitive: "/videos/clara_video.mp4"
};

function getApiBase() {
  if (typeof window !== "undefined" && typeof window.API_BASE === "string" && window.API_BASE) {
    return window.API_BASE.replace(/\/+$/, "");
  }
  try {
    const v = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || "";
    if (v) return v.replace(/\/+$/, "");
  } catch (_) {}
  if (typeof process !== "undefined" && process.env && typeof process.env.REACT_APP_API_BASE === "string" && process.env.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE.replace(/\/+$/, "");
  }
  if (typeof process !== "undefined" && process.env && typeof process.env.API_BASE === "string" && process.env.API_BASE) {
    return process.env.API_BASE.replace(/\/+$/, "");
  }
  return "https://emobot-backend.onrender.com";
}
const API_BASE = getApiBase();

const float = keyframes`0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)}`;
const fadeIn = keyframes`from{opacity:0}to{opacity:1}`;
const fadeInDown = keyframes`from{opacity:0;transform:translateY(-30px)}to{opacity:1;transform:translateY(0)}`;
const slideInLTR = keyframes`from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}`;
const fadeInBubble = keyframes`from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}`;
const pulse = keyframes`0%{box-shadow:0 0 0 0 rgba(122,194,221,.4)}70%{box-shadow:0 0 0 10px rgba(122,194,221,0)}100%{box-shadow:0 0 0 0 rgba(122,194,221,0)}`;
const recording = keyframes`0%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:.8)}100%{transform:scale(1);opacity:1}`;
const fadeInStagger = keyframes`from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}`;
const shimmer = keyframes`0%{transform:translateX(-100%)}100%{transform:translateX(100%)}`;
const auraPulse = keyframes`0%,100%{transform:scale(.96);opacity:.22}50%{transform:scale(1.04);opacity:.32}`;

const videoZoomOut = keyframes`
  0% { 
    transform: scale(1) translateY(0); 
    opacity: 1;
    filter: blur(0px) brightness(1);
  }
  40% { 
    transform: scale(0.92) translateY(-20px); 
    opacity: 1;
    filter: blur(0px) brightness(1.1);
  }
  70% { 
    transform: scale(0.5) translateY(-60px); 
    opacity: 0.6;
    filter: blur(2px) brightness(1.2);
  }
  100% { 
    transform: scale(0.1) translateY(-100px); 
    opacity: 0;
    filter: blur(8px) brightness(1.5);
  }
`;

const avatarZoomIn = keyframes`
  0% { 
    transform: scale(0) rotate(-10deg); 
    opacity: 0; 
  }
  60% { 
    transform: scale(1.1) rotate(2deg); 
    opacity: 0.8; 
  }
  80% { 
    transform: scale(0.95) rotate(-1deg); 
    opacity: 1; 
  }
  100% { 
    transform: scale(1) rotate(0deg); 
    opacity: 1; 
  }
`;

const videoFadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: scale(0.95);
  }
  to { 
    opacity: 1; 
    transform: scale(1);
  }
`;

const Container = styled.div`
  display:flex;
  flex-direction:column;
  width:100vw;
  height:100vh;
  background:linear-gradient(135deg,#f5f7fa 0%,#eef1f5 100%);
  font-family:'Noto Sans TC',-apple-system,BlinkMacSystemFont,sans-serif;
  position:relative;
  overflow:hidden;
  
  @media (max-width:768px){
    overflow-y:auto;
    position:fixed;
    top:0;
    left:0;
    right:0;
    bottom:0;
  }
`;

const VideoIntroOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.96), rgba(20, 20, 40, 0.98));
  display: ${p => p.$visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 0.5s ease-out;
  backdrop-filter: blur(20px);
`;

const VideoContainer = styled.div`
  position: relative;
  width: 450px;
  height: 800px;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 
    0 30px 90px rgba(0, 0, 0, 0.6),
    0 10px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: ${p => p.$zoomOut ? videoZoomOut : videoFadeIn} ${p => p.$zoomOut ? '1s' : '0.6s'} cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  transform-origin: center center;
  
  @media (max-width: 1024px) {
    width: 393px;
    height: 700px;
    border-radius: 28px;
  }
  
  @media (max-width: 768px) {
    width: 360px;
    height: 640px;
    border-radius: 24px;
  }
  
  @media (max-width: 480px) {
    width: 320px;
    height: 568px;
    border-radius: 20px;
  }
  
  @media (max-width: 380px) {
    width: 280px;
    height: 497px;
    border-radius: 18px;
  }
`;

const IntroVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
`;

const SkipButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  color: white;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  padding: 12px 24px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    top: 16px;
    right: 16px;
    padding: 8px 16px;
    font-size: 13px;
  }
`;

const Header = styled.header`
  position:fixed;
  top:0;
  left:0;
  right:0;
  height:70px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 30px;
  background:linear-gradient(135deg,rgba(255,255,255,.96) 0%,rgba(248,250,252,.96) 100%);
  backdrop-filter:blur(20px) saturate(1.3);
  border-bottom:1px solid rgba(43,57,147,.08);
  box-shadow:0 2px 16px rgba(43,57,147,.06),0 1px 4px rgba(0,0,0,.02);
  z-index:100;
  animation:${fadeInDown} .8s ease-out both;
  animation-delay:.3s;
  
  @media (max-width:768px){
    height:60px;
    padding:0 16px;
  }
`;

const BackButton = styled.button`
  background:transparent;
  color:#2e2f5e;
  display:flex;
  align-items:center;
  gap:8px;
  padding:11px 20px;
  border-radius:12px;
  font-weight:600;
  font-size:15px;
  border:1px solid rgba(46,47,94,.15);
  cursor:pointer;
  transition:all .3s cubic-bezier(.4,0,.2,1);
  position:relative;
  overflow:hidden;
  
  &:before{
    content:'';
    position:absolute;
    top:0;
    left:-100%;
    width:100%;
    height:100%;
    background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.3) 50%,transparent 100%);
    transition:left .6s ease;
  }
  
  &:hover{
    background:rgba(46,47,94,.04);
    transform:translateX(-2px);
    box-shadow:0 4px 12px rgba(46,47,94,.12);
    
    &:before{
      left:100%;
    }
  }
  
  &:active{
    transform:translateX(-1px) scale(.98);
  }
  
  @media (max-width:768px){
    font-size:13px;
    padding:8px 14px;
    gap:6px;
  }
`;

const HeaderCenter = styled.div`
  display:flex;
  align-items:center;
  gap:16px;
  
  @media (max-width:768px){
    gap:12px;
  }
`;

const TTSToggle = styled.button`
  background:${p => p.$active ? 'linear-gradient(135deg,#7AC2DD,#5A8CF2)' : 'linear-gradient(135deg,rgba(255,255,255,.95),rgba(248,250,252,.95))'};
  color:${p => p.$active ? '#fff' : '#666'};
  border:1.5px solid ${p => p.$active ? 'rgba(122,194,221,.4)' : 'rgba(0,0,0,.12)'};
  padding:9px 18px;
  border-radius:14px;
  cursor:pointer;
  font-weight:600;
  font-size:14px;
  display:flex;
  align-items:center;
  gap:7px;
  transition:all .3s cubic-bezier(.4,0,.2,1);
  box-shadow:${p => p.$active 
    ? '0 3px 12px rgba(122,194,221,.3),0 1px 4px rgba(122,194,221,.15)' 
    : '0 2px 8px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.04)'};
  backdrop-filter:blur(10px);
  position:relative;
  overflow:hidden;
  
  &:before{
    content:'';
    position:absolute;
    inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,.3),transparent);
    opacity:0;
    transition:opacity .3s ease;
  }
  
  &:hover{
    transform:translateY(-2px);
    box-shadow:${p => p.$active 
      ? '0 5px 18px rgba(122,194,221,.4),0 2px 8px rgba(122,194,221,.2)' 
      : '0 4px 12px rgba(0,0,0,.1),0 2px 6px rgba(0,0,0,.06)'};
    
    &:before{
      opacity:1;
    }
  }
  
  &:active{
    transform:translateY(0);
  }
  
  @media (max-width:768px){
    padding:8px 14px;
    font-size:13px;
    gap:5px;
    border-radius:12px;
  }
`;

const AvatarContainer = styled.div`
  display:flex;
  align-items:center;
  gap:12px;
  animation: ${p => p.$appear ? css`${avatarZoomIn} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)` : 'none'};
`;

const BotAvatar = styled.div`
  width:48px;
  height:48px;
  border-radius:50%;
  background:${p=>p.$bg||'linear-gradient(45deg,#7AC2DD,#5A8CF2)'};
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff;
  font-weight:bold;
  font-size:19px;
  box-shadow:0 4px 12px rgba(90,140,242,.28);
  transition:all .3s ease;
  cursor:pointer;
  position:relative;
  
  &:hover{
    transform:scale(1.05);
  }
  
  @media (max-width:768px){
    width:42px;
    height:42px;
    font-size:17px;
  }
`;

const InfoButton = styled.button`
  position:absolute;
  top:-4px;
  right:-4px;
  width:20px;
  height:20px;
  border-radius:50%;
  background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(248,250,252,.95));
  border:1.5px solid rgba(46,47,94,.2);
  color:#2e2f5e;
  font-size:11px;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  transition:all .25s ease;
  box-shadow:0 2px 6px rgba(0,0,0,.15);
  
  &:hover{
    transform:scale(1.1);
    background:linear-gradient(135deg,#fff,#f8fafc);
    box-shadow:0 3px 10px rgba(0,0,0,.2);
  }
  
  @media (max-width:768px){
    width:18px;
    height:18px;
    font-size:10px;
  }
`;

const BotInfo = styled.div`
  display:flex;
  flex-direction:column;
  
  @media (max-width:480px){
    display:none;
  }
`;

const BotName = styled.span`
  font-weight:700;
  font-size:16px;
  color:#2e2f5e;
  letter-spacing:0.3px;
  
  @media (max-width:768px){
    font-size:15px;
  }
`;

const BotStatus = styled.span`
  font-size:12px;
  color:#65B741;
  font-weight:500;
  
  @media (max-width:768px){
    font-size:11px;
  }
`;

const Layout = styled.div`
  flex:1;
  display:flex;
  justify-content:center;
  padding:100px 60px 145px;
  box-sizing:border-box;
  overflow:hidden;
  
  @media (max-width:1200px){
    padding:100px 40px 145px;
  }
  
  @media (max-width:768px){
    padding:60px 0 200px;
    flex-direction:column;
    overflow-y:auto;
    height:100vh;
    background:linear-gradient(135deg,#f5f7fa 0%,#eef1f5 100%);
  }
`;

const ChatColumn = styled.div`
  flex:1;
  max-width:1400px;
  display:flex;
  flex-direction:column;
  overflow-y:auto;
  position:relative;
  scroll-behavior:smooth;
  
  @media (max-width:768px){
    max-width:100%;
    flex:1;
    padding:0 12px;
    overflow-y:visible;
  }
`;

const FadeWrapper = styled.div`
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  flex:1;
  animation:${fadeIn} 1s ease-out forwards;
  padding:20px;
  text-align:center;
`;

const Description = styled.div`
  margin:auto;
  text-align:center;
  max-width:620px;
  animation:${fadeIn} 1s ease-out forwards;
`;

const Title = styled.h1`
  font-size:44px;
  font-weight:800;
  margin-bottom:18px;
  background:linear-gradient(45deg,#2e2f5e 30%,#5A8CF2 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  line-height:1.2;
  letter-spacing:-0.5px;
  
  @media (max-width:768px){
    font-size:28px;
  }
`;

const Subtitle = styled.p`
  font-size:20px;
  color:#666;
  line-height:1.75;
  opacity:0;
  animation:${fadeIn} 1s ease-out .5s forwards;
  font-weight:400;
  
  @media (max-width:768px){
    font-size:16px;
  }
`;

const IntroBar = styled.div`
  margin:0 auto 28px;
  padding:18px 28px;
  background:linear-gradient(135deg,rgba(122,194,221,.08) 0%,rgba(90,140,242,.06) 100%);
  border:1px solid rgba(122,194,221,.16);
  border-radius:16px;
  box-shadow:0 4px 18px rgba(122,194,221,.08),0 2px 6px rgba(0,0,0,.02),inset 0 1px 0 rgba(255,255,255,.6);
  font-size:15px;
  font-weight:600;
  line-height:1.6;
  animation:${fadeInDown} .6s ease-out, ${float} 4.5s ease-in-out 1s infinite;
  max-width:780px;
  text-align:center;
  color:#2e2f5e;
  letter-spacing:0.25px;
  position:relative;
  overflow:hidden;
  
  &:before{
    content:'';
    position:absolute;
    inset:0;
    border-radius:inherit;
    background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.4) 50%,transparent 70%);
    opacity:0;
    transition:opacity .4s ease;
  }
  
  &:hover:before{
    animation:${shimmer} 2s ease-in-out;
    opacity:1;
  }
  
  @media (max-width:768px){
    font-size:12px;
    padding:12px 16px;
    margin:0 auto 16px;
    max-width:90%;
  }
`;

const DateDivider = styled.div`
  text-align:center;
  margin:24px 0;
  position:relative;
  
  &:before{
    content:"";
    position:absolute;
    top:50%;
    left:0;
    right:0;
    height:1px;
    background:rgba(0,0,0,.08);
    z-index:-1;
  }
`;

const DateLabel = styled.span`
  background:linear-gradient(135deg,#f8f9fb,#f0f3f7);
  padding:6px 16px;
  border-radius:22px;
  font-size:13px;
  color:#666;
  box-shadow:0 2px 6px rgba(0,0,0,.04);
  font-weight:500;
  letter-spacing:0.2px;
  
  @media (max-width:768px){
    font-size:11px;
    padding:5px 12px;
  }
`;

const ChatBox = styled.div`
  display:flex;
  flex-direction:column;
  gap:22px;
  padding:28px 10px 24px;
  overflow-y:auto;
  animation:${slideInLTR} .4s ease-out both;
  
  @media (max-width:768px){
    gap:16px;
    padding:16px 4px 16px;
  }
`;

const BubbleWrapper = styled.div`
  display:flex;
  flex-direction:column;
  align-items:${p=>p.$sender==='user'?'flex-end':'flex-start'};
  max-width:72%;
  align-self:${p=>p.$sender==='user'?'flex-end':'flex-start'};
  
  @media (max-width:768px){
    max-width:82%;
  }
`;

const BubbleHeader = styled.div`
  font-size:12px;
  color:#888;
  margin-bottom:7px;
  padding:0 12px;
  display:flex;
  align-items:center;
  gap:7px;
  font-weight:500;
  
  @media (max-width:768px){
    font-size:11px;
    padding:0 8px;
    margin-bottom:5px;
  }
`;

const SenderAvatar = styled.div`
  width:24px;
  height:24px;
  border-radius:50%;
  background:${p=>p.$sender==='user'?'#5A8CF2':'linear-gradient(135deg,#7AC2DD,#5A8CF2)'};
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff;
  font-weight:bold;
  font-size:10px;
  box-shadow:0 2px 6px rgba(0,0,0,.12);
  
  @media (max-width:768px){
    width:20px;
    height:20px;
    font-size:9px;
  }
`;

const ChatBubble = styled.div`
  background:${p=>p.$sender==='user'?'linear-gradient(135deg,#5A8CF2,#7A72E0)':'linear-gradient(135deg,#fff,#fafbfc)'};
  color:${p=>p.$sender==='user'?'#fff':'#2d3748'};
  padding:17px 24px;
  border-radius:${p=>p.$sender==='user'?'22px 22px 6px 22px':'22px 22px 22px 6px'};
  box-shadow:${p=>p.$sender==='user'
    ?'0 4px 14px rgba(90,140,242,.22),0 2px 6px rgba(90,140,242,.1)'
    :'0 3px 12px rgba(0,0,0,.07),0 1px 4px rgba(0,0,0,.04)'
  };
  white-space:pre-wrap;
  animation:${fadeInBubble} .35s cubic-bezier(.4,0,.2,1);
  line-height:1.65;
  font-size:15px;
  letter-spacing:0.2px;
  position:relative;
  
  ${p=>p.$sender==='ai'&&`
    &:before{
      content:'';
      position:absolute;
      inset:0;
      border-radius:inherit;
      background:linear-gradient(135deg,rgba(255,255,255,.6),transparent);
      opacity:.5;
      pointer-events:none;
    }
  `}
  
  @media (max-width:768px){
    padding:13px 18px;
    font-size:14px;
    line-height:1.6;
    border-radius:${p=>p.$sender==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px'};
  }
`;

const MessageTime = styled.span`
  font-size:11px;
  color:#999;
  font-weight:400;
  
  @media (max-width:768px){
    font-size:10px;
  }
`;

const TypingBubble = styled(ChatBubble)`
  width:62px;
  height:34px;
  padding:0;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:5px;
  
  @media (max-width:768px){
    width:56px;
    height:30px;
  }
`;

const TypingDot = styled.div`
  width:7px;
  height:7px;
  background:#888;
  border-radius:50%;
  opacity:.75;
  animation:${p=>keyframes`0%,100%{transform:translateY(0);opacity:.75;}50%{transform:translateY(-4px);opacity:1;}`} ${p=>p.$delay}s infinite ease-in-out;
  
  @media (max-width:768px){
    width:6px;
    height:6px;
  }
`;

const InputArea = styled.div`
  position:fixed;
  bottom:38px;
  left:50%;
  transform:translateX(-50%);
  width:90%;
  max-width:1400px;
  background:${p=>p.$disabled?'rgba(240,242,245,.97)':'rgba(255,255,255,.98)'};
  border-radius:16px;
  display:flex;
  align-items:center;
  padding:7px 12px;
  backdrop-filter:blur(20px) saturate(1.4);
  box-shadow:0 8px 32px rgba(0,0,0,.07),0 3px 12px rgba(0,0,0,.04),inset 0 1px 0 rgba(255,255,255,.9);
  border:1px solid rgba(0,0,0,.04);
  z-index:100;
  transition:all .35s cubic-bezier(.4,0,.2,1);
  
  &:focus-within{
    box-shadow:0 10px 40px rgba(90,140,242,.15),0 4px 16px rgba(90,140,242,.08),inset 0 1px 0 rgba(255,255,255,.95);
    border-color:rgba(90,140,242,.2);
  }
  
  @media (max-width:768px){
    width:calc(100% - 24px);
    bottom:16px;
    padding:6px 10px;
    border-radius:20px;
    max-width:none;
  }
`;

const InputField = styled.input`
  flex:1;
  font-size:16px;
  background:transparent;
  border:none;
  outline:none;
  padding:15px 22px;
  color:${p=>p.$disabled?'#999':'#2d3748'};
  font-weight:400;
  letter-spacing:0.2px;
  resize:none;
  
  &::placeholder{
    color:${p=>p.$disabled?'#aaa':'#999'};
    font-style:italic;
    font-weight:400;
  }
  
  @media (max-width:768px){
    font-size:15px;
    padding:12px 14px;
    max-height:80px;
    overflow-y:auto;
    line-height:1.5;
  }
`;

const InputButtons = styled.div`
  display:flex;
  align-items:center;
  gap:10px;
  padding-right:6px;
  
  @media (max-width:768px){
    gap:6px;
    padding-right:2px;
  }
`;

const ActionButton = styled.button`
  width:46px;
  height:46px;
  background:${p=>p.$isRecording?'rgba(234,84,85,.12)':'transparent'};
  border-radius:50%;
  border:none;
  color:${p=>p.$isRecording?'#EA5455':'#888'};
  font-size:20px;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:${p=>p.$disabled?'not-allowed':'pointer'};
  transition:all .3s cubic-bezier(.4,0,.2,1);
  animation:${p=>p.$isRecording?recording:'none'} 1.5s infinite;
  opacity:${p=>p.$disabled?.5:1};
  
  &:hover:not(:disabled){
    background:${p=>p.$isRecording?'rgba(234,84,85,.18)':'rgba(0,0,0,.04)'};
  }
  
  @media (max-width:768px){
    width:38px;
    height:38px;
    font-size:18px;
  }
`;

const SendButton = styled.button`
  width:52px;
  height:52px;
  background:${p=>p.$disabled?'linear-gradient(135deg,#ccc,#bbb)':'linear-gradient(135deg,#7AC2DD,#5A8CF2)'};
  border-radius:50%;
  border:none;
  color:#fff;
  font-size:22px;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:${p=>p.$disabled?'not-allowed':'pointer'};
  transition:all .3s cubic-bezier(.4,0,.2,1);
  animation:${p=>p.$active&&!p.$disabled?pulse:'none'} 1.5s infinite;
  opacity:${p=>p.$disabled?.65:1};
  box-shadow:${p=>p.$disabled
    ?'0 3px 10px rgba(0,0,0,.1)'
    :'0 4px 14px rgba(122,194,221,.32),0 2px 6px rgba(122,194,221,.18)'
  };
  position:relative;
  overflow:hidden;
  
  &:before{
    content:'';
    position:absolute;
    inset:0;
    border-radius:inherit;
    background:linear-gradient(135deg,rgba(255,255,255,.3),transparent);
    opacity:0;
    transition:opacity .3s ease;
  }
  
  &:hover:not(:disabled){
    transform:scale(1.04);
    box-shadow:0 6px 18px rgba(122,194,221,.38),0 3px 8px rgba(122,194,221,.22);
    
    &:before{
      opacity:1;
    }
  }
  
  &:active:not(:disabled){
    transform:scale(0.96);
  }
  
  @media (max-width:768px){
    width:44px;
    height:44px;
    font-size:19px;
  }
`;

const StatusMessage = styled.div`
  position:fixed;
  bottom:110px;
  left:50%;
  transform:translateX(-50%);
  background:rgba(0,0,0,.85);
  color:#fff;
  padding:13px 22px;
  border-radius:26px;
  font-size:14px;
  z-index:101;
  animation:${fadeInDown} .3s ease-out;
  backdrop-filter:blur(12px);
  box-shadow:0 4px 18px rgba(0,0,0,.24);
  max-width:90%;
  text-align:center;
  font-weight:500;
  letter-spacing:0.3px;
  
  @media (max-width:768px){
    bottom:100px;
    font-size:13px;
    padding:11px 18px;
  }
`;

const WelcomeAnimation = styled.div`
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background:linear-gradient(135deg,rgba(255,255,255,.96) 0%,rgba(248,250,252,.96) 100%);
  display:flex;
  justify-content:center;
  align-items:center;
  font-size:84px;
  font-weight:800;
  color:#2b3993;
  z-index:200;
  opacity:${p=>p.$visible?1:0};
  visibility:${p=>p.$visible?'visible':'hidden'};
  transition:all .5s cubic-bezier(.4,0,.2,1);
  text-shadow:0 4px 12px rgba(43,57,147,.18);
  letter-spacing:-1px;
  
  @media (max-width:768px){
    font-size:42px;
  }
`;

const IntroTextOverlay = styled.div`
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(248,250,252,.96));
  display:flex;
  flex-direction:column;
  justify-content:flex-start;
  align-items:center;
  padding:180px 40px 40px;
  text-align:center;
  z-index:200;
  opacity:${p=>p.$visible?1:0};
  visibility:${p=>p.$visible?'visible':'hidden'};
  transition:opacity .6s cubic-bezier(.4,0,.2,1),visibility .6s;
  
  @media (max-width:768px){
    padding:40px 20px;
    justify-content:center;
  }
`;

const TipHeader = styled.h2`
  font-size:38px;
  font-weight:700;
  background:linear-gradient(45deg,#2e2f5e 30%,#5A8CF2 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  margin-bottom:16px;
  animation:${fadeInStagger} .8s ease-out;
  letter-spacing:-0.5px;
  
  @media (max-width:768px){
    font-size:24px;
  }
`;

const IntroContent = styled.div`
  max-width:680px;
  width:100%;
  padding:32px;
  background:rgba(255,255,255,.92);
  border-radius:20px;
  border:1px solid rgba(255,255,255,.4);
  box-shadow:0 8px 32px rgba(0,0,0,.1),0 4px 16px rgba(0,0,0,.04),inset 0 1px 0 rgba(255,255,255,.6);
  animation:${fadeInStagger} .8s ease-out .4s both;
  backdrop-filter:blur(10px);
  
  @media (max-width:768px){
    padding:20px 18px;
    max-width:90%;
    margin:0 auto;
  }
`;

const IntroText = styled.p`
  font-size:19px;
  color:#4a5568;
  line-height:1.8;
  margin:0;
  font-weight:400;
  letter-spacing:0.3px;
  
  @media (max-width:768px){
    font-size:14px;
    line-height:1.7;
  }
`;

const Disclaimer = styled.div`
  position:fixed;
  bottom:6px;
  left:50%;
  transform:translateX(-50%);
  width:90%;
  max-width:1440px;
  font-size:12px;
  color:#888;
  text-align:center;
  padding:5px 8px;
  z-index:100;
  font-weight:400;
  letter-spacing:0.2px;
  
  @media (max-width:768px){
    display:none;
  }
`;

const AIBubbleWithAvatar = styled.div`
  display:flex;
  gap:15px;
  align-items:flex-start;
  max-width:72%;
  
  @media (max-width:768px){
    max-width:82%;
    gap:12px;
  }
`;

const Overlay = styled.div`
  position:fixed;
  inset:0;
  background:rgba(20,24,40,.45);
  backdrop-filter:blur(6px);
  display:${p=>p.$open?'flex':'none'};
  align-items:center;
  justify-content:center;
  z-index:1000;
  padding:20px;
`;

const Modal = styled.div`
  width:min(740px,92vw);
  background:linear-gradient(145deg,rgba(255,255,255,.98) 0%,rgba(247,250,255,.98) 100%);
  border:1px solid rgba(43,57,147,.12);
  border-radius:20px;
  box-shadow:0 24px 80px rgba(18,28,80,.28),0 6px 20px rgba(0,0,0,.08);
  overflow:hidden;
  position:relative;
  max-height:90vh;
  overflow-y:auto;
`;

const TopBar = styled.div`
  height:6px;
  background:linear-gradient(135deg,${p=>p.$start} 0%,${p=>p.$end} 100%);
`;

const ModalContent = styled.div`
  display:grid;
  grid-template-columns:180px 1fr;
  gap:24px;
  padding:24px;
  
  @media (max-width:640px){
    grid-template-columns:1fr;
    gap:16px;
    padding:20px;
  }
`;

const ModalAvatarWrap = styled.div`
  position:relative;
  display:grid;
  place-items:center;
  
  @media (max-width:640px){
    margin:0 auto;
  }
`;

const ModalAvatar = styled.img`
  width:160px;
  height:180px;
  object-fit:cover;
  border-radius:16px;
  box-shadow:0 14px 38px rgba(0,0,0,.18);
  
  @media (max-width:640px){
    width:120px;
    height:140px;
  }
`;

const ModalAura = styled.div`
  position:absolute;
  width:240px;
  height:240px;
  border-radius:50%;
  background:radial-gradient(circle,${p=>p.$start} 0%,${p=>p.$end} 60%,transparent 70%);
  filter:blur(24px);
  opacity:.25;
  z-index:-1;
  animation:${auraPulse} 5s ease-in-out infinite;
  
  @media (max-width:640px){
    width:180px;
    height:180px;
  }
`;

const ModalTitle = styled.h3`
  margin:0 0 6px 0;
  font-size:24px;
  color:#1b2748;
  
  @media (max-width:640px){
    font-size:20px;
    text-align:center;
  }
`;

const ModalSub = styled.div`
  font-size:14px;
  color:#6b7aa0;
  margin-bottom:10px;
  
  @media (max-width:640px){
    font-size:13px;
    text-align:center;
  }
`;

const ModalQuote = styled.div`
  margin:12px 0 18px 0;
  padding:10px 14px;
  border-radius:12px;
  background:rgba(103,126,234,.07);
  border:1px solid rgba(103,126,234,.18);
  color:#445;
  font-weight:600;
  
  @media (max-width:640px){
    font-size:14px;
    padding:8px 12px;
  }
`;

const ModalPara = styled.p`
  font-size:15px;
  line-height:1.8;
  color:#2a334d;
  margin:8px 0 0 0;
  white-space:pre-line;
  
  @media (max-width:640px){
    font-size:14px;
  }
`;

const ModalRow = styled.div`
  display:grid;
  gap:10px;
  margin-top:12px;
`;

const ModalActions = styled.div`
  display:flex;
  justify-content:flex-end;
  gap:12px;
  padding:16px 20px;
  border-top:1px solid rgba(0,0,0,.06);
  
  @media (max-width:640px){
    justify-content:center;
    padding:14px 16px;
  }
`;

const GhostBtn = styled.button`
  background:transparent;
  color:#445;
  border:1px solid rgba(68,85,170,.25);
  padding:10px 16px;
  border-radius:12px;
  cursor:pointer;
  font-weight:700;
  
  &:hover{
    background:rgba(68,85,170,.08);
  }
  
  @media (max-width:640px){
    padding:9px 14px;
    font-size:14px;
  }
`;

const BOT_MAP = {
  empathy: {
    name:"Lumi",letter:"L",avatarBg:"linear-gradient(45deg,#FFB6C1,#FF8FB1)",
    tagline:"Lumi — 用溫柔與共感陪你說說話。",
    subtitle:"溫暖陪伴、情緒承接與安撫,讓你被好好地聆聽與理解。",
    title:"同理型 AI",tone:"溫柔傾聽、深度理解",
    quote:"在你的感受裡,我看見了你的勇氣。",
    story:"Lumi 是一位溫暖的陪伴者,擅長建立安全、接納的氛圍,引導使用者覺察情緒並與之共處。",
    suitable:"孤獨感、低自尊、情感失落、自我懷疑、親密關係議題",
    accentStart:"#FFB6C1",accentEnd:"#FF8FB1"
  },
  insight:{
    name:"Solin",letter:"S",avatarBg:"linear-gradient(45deg,#7AC2DD,#5A8CF2)",
    tagline:"Solin — 一起澄清、看見新的可能。",
    subtitle:"以溫柔的提問與澄清,幫助梳理線索、找出關鍵與洞見。",
    title:"洞察型 AI",tone:"溫和探索、啟發思考",
    quote:"也許,我們可以從另一個角度看看這件事。",
    story:"Solin 擅長以溫柔的提問引導深層探索,幫助使用者看見潛意識的模式與內在動機。",
    suitable:"反覆的人際模式、創傷經驗、自我價值疑問、夢境探索、內在空虛感",
    accentStart:"#7AC2DD",accentEnd:"#5A8CF2"
  },
  solution:{
    name:"Niko",letter:"N",avatarBg:"linear-gradient(45deg,#3AA87A,#9AE6B4)",
    tagline:"Niko — 一起做點能改變的事。",
    subtitle:"聚焦可行步驟與微目標,幫助把感受轉成行動與支持。",
    title:"解決型 AI",tone:"務實行動、目標導向",
    quote:"我們一起找到下一步可以做的事。",
    story:"Niko 擅長將情緒轉化為具體行動,幫助使用者設定目標、活用資源,快速聚焦在問題解決上。",
    suitable:"職場壓力、衝突處理、時間管理、短期決策困難、日常壓力應對",
    accentStart:"#3AA87A",accentEnd:"#9AE6B4"
  },
  cognitive:{
    name:"Clara",letter:"C",avatarBg:"linear-gradient(45deg,#7A4DC8,#B794F4)",
    tagline:"Clara — 一起練習看見思緒的樣子。",
    subtitle:"以認知重建、想法檢核、替代想法等,幫你和腦內小劇場溫柔共桌。",
    title:"認知型 AI",tone:"理性清晰、邏輯引導",
    quote:"讓我們一起檢視這個想法,看看它是否站得住腳。",
    story:"Clara 擅長分析非理性思考並提供認知重建步驟,幫助使用者建立更健康的思維模式。",
    suitable:"負面自我對話、焦慮、完美主義、拖延、情緒管理",
    accentStart:"#7A4DC8",accentEnd:"#B794F4"
  },
};

const renderEmphasis = (text="")=>{
  const parts = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|『[^』]+』|「[^」]+」|《[^》]+》|〈[^〉]+〉)/g);
  return parts.map((seg,i)=>{
    if(!seg) return null;
    if(/^\*\*\*[^*]+\*\*\*$/.test(seg)){return <strong key={i} style={{color:'#2e2f5e',fontWeight:700,textShadow:'0 1px 2px rgba(46,47,94,.1)',letterSpacing:'0.5px'}}>{seg.slice(3,-3)}</strong>;}
    if(/^\*\*[^*]+\*\*$/.test(seg)){return <strong key={i} style={{fontWeight:600}}>{seg.slice(2,-2)}</strong>;}
    if(/^『.*』$/.test(seg)||/^「.*」$/.test(seg)||/^《.*》$/.test(seg)||/^〈.*〉$/.test(seg)){return <strong key={i} style={{fontWeight:600}}>{seg.slice(1,-1).trim()}</strong>;}
    return <React.Fragment key={i}>{seg}</React.Fragment>;
  });
};

export default function MoodInput() {
  const navigate = useNavigate();

  const mode = "video";
  const [inputValue, setInputValue] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showIntroText, setShowIntroText] = useState(false);
  const [showBotModal, setShowBotModal] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [inputHeight, setInputHeight] = useState('auto');

  const [showVideoIntro, setShowVideoIntro] = useState(false);
  const [videoZoomOut, setVideoZoomOut] = useState(false);
  const [avatarAppear, setAvatarAppear] = useState(false);
  const [isFirstTimeChat, setIsFirstTimeChat] = useState(false);

  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);

  const [avatarText, setAvatarText] = useState("");
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState(-1);

  const selectedBotType = (localStorage.getItem("selectedBotType") || "solution");
  const bot = BOT_MAP[selectedBotType] || BOT_MAP.solution;
  const selectedBotImage = localStorage.getItem("selectedBotImage") || botTemp;
  const nickname = (JSON.parse(localStorage.getItem("user") || "{}").nickname) || "你";

  const showStatus = (message, duration = 3000) => {
    setStatusMessage(message);
    if (duration > 0) setTimeout(() => setStatusMessage(null), duration);
  };

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const result = await checkFirstTimeChat(selectedBotType);
        if (result?.ok) {
          setIsFirstTimeChat(result.is_first_time);
          console.log(`首次對話檢測: ${result.is_first_time ? '是' : '否'}`);
        }
      } catch (error) {
        console.error("檢查首次對話失敗:", error);
        setIsFirstTimeChat(false);
      }
    };
    checkFirstTime();
  }, [selectedBotType]);

  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
      setShowIntroText(true);
      const introTimer = setTimeout(() => setShowIntroText(false), 3000);
      return () => clearTimeout(introTimer);
    }, 1000);
    return () => clearTimeout(welcomeTimer);
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setShowBotModal(false); };
    if (showBotModal) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showBotModal]);

  const playIntroVideo = () => {
    return new Promise((resolve) => {
      setShowVideoIntro(true);
      setVideoZoomOut(false);
      
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.play().catch(err => {
          console.error("影片播放失敗:", err);
          resolve();
        });

        videoElement.onended = () => {
          handleVideoEnd();
          resolve();
        };

        videoElement.onerror = () => {
          console.error("影片載入錯誤");
          handleVideoEnd();
          resolve();
        };
      } else {
        resolve();
      }
    });
  };

  const handleVideoEnd = async () => {
    setVideoZoomOut(true);
    
    setTimeout(async () => {
      setShowVideoIntro(false);
      setAvatarAppear(true);
      setTimeout(() => setAvatarAppear(false), 600);
      
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const firstText = `嗨 ${nickname},我是 ${bot.name}。今天想從哪裡開始呢?`;
      const first = { sender: "ai", content: firstText, timestamp: now };
      setMessages([first]);
      setChatStarted(true);
      setAvatarText(firstText);
      setCurrentSpeakingIndex(0);
      
      await sendChatMessage(firstText, selectedBotType, mode, [{ role: "assistant", content: firstText }], true);
    }, 1000);
  };

  const skipVideo = async () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    
    setShowVideoIntro(false);
    setVideoZoomOut(false);
    
    setTimeout(async () => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const firstText = `嗨 ${nickname},我是 ${bot.name}。今天想從哪裡開始呢?`;
      const first = { sender: "ai", content: firstText, timestamp: now };
      
      setMessages([first]);
      setChatStarted(true);
      setAvatarText(firstText);
      setCurrentSpeakingIndex(0);
      setAvatarAppear(true);
      
      setTimeout(() => setAvatarAppear(false), 600);
      
      await sendChatMessage(firstText, selectedBotType, mode, [{ role: "assistant", content: firstText }], true);
    }, 100);
  };

  const startConversation = async () => {
    if (isFirstTimeChat && !chatStarted) {
      await playIntroVideo();
      return;
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const firstText = `嗨 ${nickname},我是 ${bot.name}。今天想從哪裡開始呢?`;
    const first = { sender: "ai", content: firstText, timestamp: now };
    setMessages([first]);
    setChatStarted(true);
    setAvatarText(firstText);
    setCurrentSpeakingIndex(0);
    await sendChatMessage(firstText, selectedBotType, mode, [{ role: "assistant", content: firstText }], true);
  };

  useEffect(() => {
    const handleSpace = e => { 
      if (e.code === 'Space' && !chatStarted && document.activeElement !== inputRef.current) { 
        e.preventDefault(); 
        startConversation(); 
      } 
    };
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [chatStarted, isFirstTimeChat]);

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput && !isRecording) return;
    if (!chatStarted) { 
      await startConversation(); 
      return; 
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgText = isRecording ? "[語音訊息]" : trimmedInput;

    setInputValue("");
    setInputHeight('auto');
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = 'auto';
      inputRef.current.blur();
    }
    
    setInputDisabled(true);
    setIsTyping(true);
    if (isRecording) setIsRecording(false);
    
    setAvatarText("");
    setCurrentSpeakingIndex(-1);
    
    const newUserMsg = { sender: "user", content: userMsgText, timestamp: now };
    setMessages(prev => [...prev, newUserMsg]);

    const history = [...messages, newUserMsg]
      .map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.content }));

    try {
      const result = await sendChatMessage(userMsgText, selectedBotType, mode, history);
      
      if (result?.ok && result.reply) {
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const aiMsg = { sender: "ai", content: result.reply, timestamp: replyTime };
        
        setMessages(prev => [...prev, aiMsg]);
        
        const newAiIndex = messages.filter(m => m.sender === "ai").length;
        
        setTimeout(() => {
          setCurrentSpeakingIndex(newAiIndex);
          setAvatarText(result.reply);
        }, 50);
        
      } else {
        throw new Error(result?.error || "API 回傳格式錯誤");
      }
    } catch (error) {
      console.error("Chat API failed:", error);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fallbackReply = "我在這裡,先一起做個小小的深呼吸。想和我說說剛剛最在意的一件事嗎?";
      
      setMessages(prev => [...prev, { sender: "ai", content: fallbackReply, timestamp: replyTime }]);
      
      const newAiIndex = messages.filter(m => m.sender === "ai").length;
      setTimeout(() => {
        setCurrentSpeakingIndex(newAiIndex);
        setAvatarText(fallbackReply);
      }, 50);
    } finally {
      setIsTyping(false);
      setInputDisabled(false);
      
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.value = "";
          inputRef.current.style.height = 'auto';
          inputRef.current.focus();
        }
        setInputValue("");
        setInputHeight('auto');
      });
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
        .catch(err => { console.error("無法取得麥克風權限:", err); setIsRecording(false); showStatus("無法取得麥克風權限"); });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !inputDisabled && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const toggleTTS = () => {
    setTtsEnabled(prev => !prev);
    showStatus(ttsEnabled ? "語音已關閉" : "語音已開啟", 2000);
  };

  const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const aiMessages = messages.filter(m => m.sender === "ai");

  return (
    <Container>
      <WelcomeAnimation $visible={showWelcome}>Welcome Emobot+</WelcomeAnimation>
      
      <IntroTextOverlay $visible={showIntroText}>
        <TipHeader>溫馨提醒</TipHeader>
        <IntroContent>
          <IntroText>
            當你結束這段對話時,<br/>
            系統會詢問你是否願意分享今天的聊天內容。<br/>
            只有在你同意的情況下,這些記錄才會提供給心理專業人員,<br/>
            幫助你獲得更適切的支持與關懷。<br/>
            我們會溫柔守護你的每一份選擇。
          </IntroText>
        </IntroContent>
      </IntroTextOverlay>

      <VideoIntroOverlay $visible={showVideoIntro}>
        <VideoContainer $zoomOut={videoZoomOut}>
          <IntroVideo 
            ref={videoRef}
            src={VIDEO_MAP[selectedBotType]}
            playsInline
            preload="auto"
          />
          <SkipButton onClick={skipVideo}>跳過</SkipButton>
        </VideoContainer>
      </VideoIntroOverlay>

      <Header>
        <BackButton onClick={() => navigate("/dashboard")}>
          <FiChevronLeft size={18} />
          {chatStarted ? '離開對話' : '返回'}
        </BackButton>

        {chatStarted && (
          <HeaderCenter>
            <TTSToggle 
              $active={ttsEnabled} 
              onClick={toggleTTS}
              title={ttsEnabled ? "關閉語音" : "開啟語音"}
            >
              {ttsEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
              <span>{ttsEnabled ? '語音' : '靜音'}</span>
            </TTSToggle>
            
            <AvatarContainer $appear={avatarAppear}>
              <BotInfo>
                <BotName>{bot.name}</BotName>
                <BotStatus>線上</BotStatus>
              </BotInfo>
              <BotAvatar $bg={bot.avatarBg}>
                {bot.letter}
                <InfoButton onClick={() => setShowBotModal(true)} title={`關於 ${bot.name}`}>
                  <FiInfo />
                </InfoButton>
              </BotAvatar>
            </AvatarContainer>
          </HeaderCenter>
        )}
      </Header>

      <Layout>
        <ChatColumn>
          {!chatStarted ? (
            <FadeWrapper>
              <Description>
                <Title>分享一下今天的心情吧!</Title>
                <Subtitle>{bot.name} — {bot.subtitle}</Subtitle>
              </Description>
            </FadeWrapper>
          ) : (
            <>
              <IntroBar>{bot.tagline}</IntroBar>
              <DateDivider><DateLabel>{today}</DateLabel></DateDivider>
              <ChatBox ref={chatBoxRef}>
                {messages.map((m, i) => (
                  m.sender === "user" ? (
                    <BubbleWrapper key={i} $sender="user">
                      <BubbleHeader>
                        <SenderAvatar $sender="user">
                          {nickname?.[0] || "你"}
                        </SenderAvatar>
                        {nickname} <MessageTime>{m.timestamp}</MessageTime>
                      </BubbleHeader>
                      <ChatBubble $sender="user">{renderEmphasis(m.content)}</ChatBubble>
                    </BubbleWrapper>
                  ) : (
                    <AIBubbleWithAvatar key={i}>
                      <AvatarAnimation
                        apiBase={API_BASE}
                        text={aiMessages.indexOf(m) === currentSpeakingIndex ? avatarText : ""}
                        botType={selectedBotType}
                        avatarSrc={selectedBotImage}
                        onError={(msg) => showStatus(msg, 2000)}
                        size={window.innerWidth <= 768 ? 50 : 40}
                      />
                      <BubbleWrapper $sender="ai" style={{maxWidth:'calc(100% - 90px)'}}>
                        <BubbleHeader>
                          {bot.name} AI <MessageTime>{m.timestamp}</MessageTime>
                        </BubbleHeader>
                        <ChatBubble $sender="ai">{renderEmphasis(m.content)}</ChatBubble>
                      </BubbleWrapper>
                    </AIBubbleWithAvatar>
                  )
                ))}
                {isTyping && (
                  <AIBubbleWithAvatar>
                    <AvatarAnimation
                      apiBase={API_BASE}
                      text=""
                      botType={selectedBotType}
                      avatarSrc={selectedBotImage}
                      onError={(msg) => showStatus(msg, 2000)}
                    />
                    <BubbleWrapper $sender="ai" style={{maxWidth:'calc(100% - 90px)'}}>
                      <BubbleHeader>
                        {bot.name} 正在輸入...
                      </BubbleHeader>
                      <TypingBubble $sender="ai">
                        <TypingDot $delay={0.4} /><TypingDot $delay={0.6} /><TypingDot $delay={0.8} />
                      </TypingBubble>
                    </BubbleWrapper>
                  </AIBubbleWithAvatar>
                )}
              </ChatBox>
            </>
          )}
        </ChatColumn>
      </Layout>

      {statusMessage && <StatusMessage>{statusMessage}</StatusMessage>}

      <InputArea $disabled={inputDisabled}>
        <InputField
          ref={inputRef}
          placeholder={inputDisabled ? "請等待回覆..." : isRecording ? "正在錄製語音..." : "將你的心情寫在這裡吧!"}
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            if (window.innerWidth <= 768 && inputRef.current) {
              inputRef.current.style.height = 'auto';
              const newHeight = Math.min(inputRef.current.scrollHeight, 80);
              inputRef.current.style.height = newHeight + 'px';
              setInputHeight(newHeight + 'px');
            }
          }}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          $disabled={inputDisabled || isRecording}
          autoComplete="off"
          style={{ height: window.innerWidth <= 768 ? inputHeight : 'auto' }}
        />
        <InputButtons>
          <ActionButton
            onClick={handleVoiceButton}
            $disabled={inputDisabled}
            $isRecording={isRecording}
            aria-label="錄製語音"
            title="錄製語音"
          >
            <FiMic />
          </ActionButton>
          <SendButton
            onClick={handleSend}
            $active={inputValue.trim().length > 0 || isRecording}
            $disabled={inputDisabled && !isRecording}
            aria-label="送出訊息"
            title="送出訊息"
          >
            <IoSend />
          </SendButton>
        </InputButtons>
      </InputArea>

      <Disclaimer>
        AI夥伴無法取代心理診斷與治療,如需進一步幫助,請尋求專業資源。
      </Disclaimer>

      <Overlay $open={showBotModal} onClick={(e) => e.target === e.currentTarget && setShowBotModal(false)}>
        <Modal role="dialog" aria-modal="true" aria-label={`${bot.name} 介紹`}>
          <TopBar $start={bot.accentStart} $end={bot.accentEnd} />
          <ModalContent>
            <ModalAvatarWrap>
              <ModalAura $start={bot.accentStart} $end={bot.accentEnd} />
              <ModalAvatar src={selectedBotImage} alt={bot.title} />
            </ModalAvatarWrap>
            <div>
              <ModalTitle>{bot.name} · {bot.title}</ModalTitle>
              <ModalSub>{bot.tone}</ModalSub>
              <ModalQuote>"{bot.quote}"</ModalQuote>

              <ModalRow>
                <strong>角色故事</strong>
                <ModalPara>{bot.story}</ModalPara>
              </ModalRow>
              <ModalRow>
                <strong>特別適合</strong>
                <ModalPara>{bot.suitable}</ModalPara>
              </ModalRow>
            </div>
          </ModalContent>
          <ModalActions>
            <GhostBtn onClick={() => setShowBotModal(false)}>關閉</GhostBtn>
          </ModalActions>
        </Modal>
      </Overlay>
    </Container>
  );
}