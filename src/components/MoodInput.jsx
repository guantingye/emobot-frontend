// src/components/MoodInput.jsx
import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import botTemp from "../assets/bot_temp.png";
import { IoSend } from "react-icons/io5";
import { FiChevronLeft, FiMic, FiInfo } from "react-icons/fi";
import introVideo from "../assets/demo_video_2.mov";
import secondVideo from "../assets/demo_video_3.mov";

/* ================= Enhanced Styles (原樣式保留) ================ */
const float = keyframes`0%{transform:translateY(0)}50%{transform:translateY(-4px)}100%{transform:translateY(0)}`;
const fadeIn = keyframes`from{opacity:0}to{opacity:1}`;
const fadeInDown = keyframes`from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}`;
const slideInLTR = keyframes`from{opacity:0;transform:translateX(-50px)}to{opacity:1;transform:translateX(0)}`;
const fadeInBubble = keyframes`from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}`;
const FadeWrapper = styled.div`display:flex;flex-direction:column;justify-content:center;align-items:center;flex:1;animation:${fadeIn} 1s ease-out forwards;`;
const pulse = keyframes`0%{box-shadow:0 0 0 0 rgba(122,194,221,.4)}70%{box-shadow:0 0 0 10px rgba(122,194,221,0)}100%{box-shadow:0 0 0 0 rgba(122,194,221,0)}`;
const recording = keyframes`0%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:.8}100%{transform:scale(1);opacity:1}`;

const Container = styled.div`
  display:flex;flex-direction:column;width:100vw;height:100vh;
  background:linear-gradient(135deg,#f5f7fa 0%,#eef1f5 100%);font-family:'Noto Sans TC',sans-serif;
  position:relative;overflow:hidden;
`;
const Header = styled.header`
  position:fixed;top:0;left:0;right:0;height:80px;display:flex;align-items:center;justify-content:space-between;
  padding:0 24px;background:rgba(255,255,255,.8);backdrop-filter:blur(10px);
  border-bottom:1px solid rgba(0,0,0,.05);z-index:100;box-shadow:0 2px 12px rgba(0,0,0,.04);
  animation:${fadeInDown} .8s ease-out both;animation-delay:.3s;
`;
const BackButton = styled.button`
  background:transparent;color:#2e2f5e;display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;
  font-weight:600;font-size:16px;border:1px solid rgba(46,47,94,.2);cursor:pointer;transition:.2s;
  &:hover{background:rgba(46,47,94,.05);transform:translateX(-2px)} &:active{transform:scale(.98)}
`;
const ModeSelect = styled.div`background:rgba(255,255,255,.9);padding:6px;border-radius:14px;display:flex;gap:4px;box-shadow:0 4px 20px rgba(0,0,0,.06);`;
const ModeButton = styled.button`
  padding:8px 20px;border-radius:10px;font-weight:600;font-size:15px;
  background:${p=>p.active?'linear-gradient(45deg,#2e2f5e,#5a5b9f)':'transparent'};
  color:${p=>p.active?'#fff':'#555'};border:none;transition:.2s;
  &:hover{background:${p=>p.active?'linear-gradient(45deg,#2e2f5e,#5a5b9f)':'rgba(0,0,0,.05)'};}
`;

// 新增：AI狀態顯示組件
const AvatarContainer = styled.div`display:flex;align-items:center;gap:12px;position:relative;`;
const BotAvatar = styled.div`
  width:42px;height:42px;border-radius:50%;
  background:${p=>p.bg || 'linear-gradient(45deg,#7AC2DD,#5A8CF2)'};display:flex;align-items:center;justify-content:center;
  color:#fff;font-weight:bold;font-size:18px;box-shadow:0 4px 10px rgba(90,140,242,.3);
  position:relative;
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
    background: ${p => p.thinking ? '#ffa500' : '#65B741'};
    border: 2px solid white;
    border-radius: 50%;
    animation: ${p => p.thinking ? pulse : 'none'} 1.5s infinite;
  }
`;
const BotInfo = styled.div`display:flex;flex-direction:column;`;
const BotName = styled.span`font-weight:700;font-size:16px;color:#2e2f5e;`;
const BotStatus = styled.span`font-size:13px;color:#65B741;display:flex;align-items:center;gap:4px;`;
const BotRole = styled.span`font-size:12px;color:#666;font-style:italic;`;

// 新增：情緒狀態指示器
const EmotionIndicator = styled.div`
  position:absolute;top:100%;left:0;background:rgba(255,255,255,.95);
  border-radius:8px;padding:8px 12px;box-shadow:0 4px 12px rgba(0,0,0,.1);
  font-size:12px;color:#666;white-space:nowrap;z-index:200;
  opacity:${p=>p.show?1:0};visibility:${p=>p.show?'visible':'hidden'};
  transition:all .3s ease;margin-top:8px;
  &::before {
    content:'';position:absolute;top:-4px;left:20px;
    border:4px solid transparent;border-bottom-color:rgba(255,255,255,.95);
  }
`;

const Layout = styled.div`flex:1;display:flex;padding:100px 40px 120px;box-sizing:border-box;overflow:hidden;margin-top:0;`;
const VideoColumn = styled.div`position:relative;top:60px;width:45%;max-width:520px;display:${p=>p.show?'block':'none'};padding-right:30px;`;
const DemoVideo = styled.video`
  position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;border-radius:20px;
  transition:opacity 1.2s ease-in-out;opacity:${p=>p.visible?1:0};
`;
const ChatColumn = styled.div`flex:1;display:flex;flex-direction:column;overflow-y:auto;position:relative;scroll-behavior:smooth;`;
const Description = styled.div`margin:auto;text-align:center;max-width:600px;animation:${fadeIn} 1s ease-out forwards;`;
const Title = styled.h1`
  font-size:46px;font-weight:800;margin-bottom:16px;
  background:linear-gradient(45deg,#2e2f5e 30%,#5A8CF2 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.2;
`;
const Subtitle = styled.p`font-size:22px;color:#666;line-height:1.7;opacity:0;animation:${fadeIn} 1s ease-out .5s forwards;`;

// 增強：AI介紹卡片
const IntroBar = styled.div`
  margin:0 auto 24px;padding:16px 24px;background:rgba(255,255,255,.95);border-left:4px solid #7AC2DD;border-radius:12px;
  box-shadow:0 8px 20px rgba(0,0,0,.06);font-size:15px;line-height:1.5;animation:${fadeInDown} .4s ease-out, ${float} 4s ease-in-out 1s infinite;
  max-width:600px;white-space:pre-wrap;text-align:center;position:relative;
`;

const BotIntroCard = styled.div`
  background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(248,250,252,.9));
  border:1px solid rgba(126,142,177,.2);border-radius:16px;padding:20px;margin-bottom:20px;
  box-shadow:0 8px 24px rgba(0,0,0,.08);position:relative;overflow:hidden;
  &::before {
    content:'';position:absolute;top:0;left:0;right:0;height:3px;
    background:${p=>p.botType==='empathy'?'linear-gradient(90deg,#FFB6C1,#FF8FB1)':
                 p.botType==='insight'?'linear-gradient(90deg,#7AC2DD,#5A8CF2)':
                 p.botType==='solution'?'linear-gradient(90deg,#9BB5E3,#6B73FF)':
                 'linear-gradient(90deg,#8D8DF2,#5A5B9F)'};
  }
`;

const BotIntroHeader = styled.div`display:flex;align-items:center;gap:12px;margin-bottom:12px;`;
const BotIntroName = styled.h3`font-size:20px;font-weight:700;color:#2e2f5e;margin:0;`;
const BotIntroRole = styled.span`font-size:14px;color:#666;font-style:italic;`;
const BotIntroText = styled.p`font-size:16px;color:#555;line-height:1.6;margin:0;`;

const DateDivider = styled.div`text-align:center;margin:20px 0;position:relative;&:before{content:"";position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(0,0,0,.1);z-index:-1}`;
const DateLabel = styled.span`background:#f0f4f8;padding:4px 12px;border-radius:20px;font-size:13px;color:#666;box-shadow:0 2px 4px rgba(0,0,0,.05);`;
const ChatBox = styled.div`display:flex;flex-direction:column;gap:16px;padding-right:10px;padding-bottom:20px;overflow-y:auto;animation:${slideInLTR} .4s ease-out both;`;

// 增強：聊天氣泡樣式
const BubbleWrapper = styled.div`display:flex;flex-direction:column;align-items:${p=>p.sender==='user'?'flex-end':'flex-start'};max-width:85%;align-self:${p=>p.sender==='user'?'flex-end':'flex-start'};`;
const BubbleHeader = styled.div`font-size:12px;color:#888;margin-bottom:4px;padding:0 12px;display:flex;align-items:center;gap:6px;`;
const SenderAvatar = styled.div`
  width:24px;height:24px;border-radius:50%;
  background:${p=>p.sender==='user'?'#5A8CF2':'linear-gradient(135deg,#7AC2DD,#5A8CF2)'};
  display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:10px;
`;
const ChatBubble = styled.div`
  background:${p=>p.sender==='user'?'linear-gradient(135deg,#5A8CF2,#7A72E0)':'white'};
  color:${p=>p.sender==='user'?'white':'#333'};padding:14px 20px;border-radius:${p=>p.sender==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px'};
  max-width:100%;box-shadow:${p=>p.sender==='user'?'0 4px 12px rgba(90,140,242,.2)':'0 4px 12px rgba(0,0,0,.08)'};
  white-space:pre-wrap;animation:${fadeInBubble} .3s ease-out;line-height:1.5;font-size:15px;
  position:relative;
`;

// 新增：建議回應按鈕
const SuggestedResponses = styled.div`
  display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;
  opacity:${p=>p.show?1:0};visibility:${p=>p.show?'visible':'hidden'};
  transition:all .3s ease;max-height:${p=>p.show?'200px':'0'};overflow:hidden;
`;
const SuggestionButton = styled.button`
  background:rgba(94,139,242,.1);color:#5A8CF2;border:1px solid rgba(94,139,242,.2);
  padding:6px 12px;border-radius:16px;font-size:13px;cursor:pointer;
  transition:all .2s ease;
  &:hover{background:rgba(94,139,242,.15);transform:translateY(-1px);}
  &:active{transform:translateY(0);}
`;

const MessageTime = styled.span`font-size:11px;color:#999;`;
const TypingBubble = styled(ChatBubble)`width:60px;height:32px;padding:0;display:flex;align-items:center;justify-content:center;gap:4px;`;
const TypingDot = styled.div`width:8px;height:8px;background:#888;border-radius:50%;opacity:.8;animation:${p=>keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}`} ${p=>p.delay}s infinite ease-in-out;`;

const InputArea = styled.div`
  position:fixed;bottom:35px;left:${p=>p.isVideoMode?'70%':'50%'};transform:translateX(-50%);
  width:${p=>p.isVideoMode?'50%':'90%'};max-width:${p=>p.isVideoMode?'none':'1440px'};
  background:${p=>p.disabled?'rgba(240,240,240,.9)':'rgba(255,255,255,.95)'};border-radius:16px;display:flex;align-items:center;padding:6px 8px;
  backdrop-filter:blur(10px);box-shadow:0 10px 25px rgba(0,0,0,.08);border:1px solid rgba(0,0,0,.05);z-index:100;transition:.3s;
`;
const InputField = styled.input`
  flex:1;font-size:16px;background:transparent;border:none;outline:none;padding:14px 20px;
  color:${p=>p.disabled?'#999':'#333'};cursor:${p=>p.disabled?'not-allowed':'text'};
  &::placeholder{color:${p=>p.disabled?'#aaa':'#999'}}
`;
const InputButtons = styled.div`display:flex;align-items:center;gap:12px;padding-right:8px;`;
const ActionButton = styled.button`
  width:40px;height:40px;background:${p=>p.isRecording?'rgba(234,84,85,.1)':'transparent'};border-radius:50%;border:none;
  color:${p=>p.isRecording?'#EA5455':'#888'};font-size:20px;display:flex;align-items:center;justify-content:center;
  cursor:${p=>p.disabled?'not-allowed':'pointer'};transition:.2s;animation:${p=>p.isRecording?recording:'none'} 1.5s infinite;opacity:${p=>p.disabled?.5:1};
  &:hover{background:${p=>p.disabled?'transparent':'rgba(0,0,0,.05)'};color:${p=>p.isRecording?'#EA5455':'#555'}}
`;
const SendButton = styled.button`
  width:48px;height:48px;background:${p=>p.disabled?'#ccc':'linear-gradient(135deg,#7AC2DD,#5A8CF2)'};
  border-radius:50%;border:none;color:white;font-size:20px;display:flex;align-items:center;justify-content:center;
  cursor:${p=>p.disabled?'not-allowed':'pointer'};transition:.2s;animation:${p=>p.active&&!p.disabled?pulse:'none'} 1.5s infinite;opacity:${p=>p.disabled?.7:1};
  &:hover{transform:${p=>p.disabled?'none':'scale(1.05)'};box-shadow:${p=>p.disabled?'none':'0 4px 12px rgba(122,194,221,.4)'}}
  &:active{transform:${p=>p.disabled?'none':'scale(.95)'}}
`;
const StatusMessage = styled.div`
  position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.7);color:#fff;
  padding:8px 16px;border-radius:20px;font-size:14px;z-index:101;animation:${fadeInDown} .3s ease-out;
`;
const WelcomeAnimation = styled.div`
  position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,.9);
  display:flex;justify-content:center;align-items:center;font-size:80px;font-weight:bold;color:#2b3993;z-index:200;
  opacity:${p=>p.visible?1:0};visibility:${p=>p.visible?'visible':'hidden'};transition:.5s;
`;
const fadeInStagger = keyframes`from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}`;
const IntroTextOverlay = styled.div`
  position:absolute;top:0;left:0;width:100%;height:100%;
  background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(248,250,252,.95));backdrop-filter:blur(8px);
  display:flex;flex-direction:column;justify-content:flex-start;align-items:center;padding:200px 40px 40px;text-align:center;z-index:200;
  opacity:${p=>p.visible?1:0};visibility:${p=>p.visible?'visible':'hidden'};transition:opacity .6s cubic-bezier(.4,0,.2,1),visibility .6s;
`;
const TipHeader = styled.h2`
  font-size:38px;font-weight:700;background:linear-gradient(45deg,#2e2f5e 30%,#5A8CF2 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;animation:${fadeInStagger} .8s ease-out;
`;
const IntroContent = styled.div`
  max-width:680px;width:100%;padding:32px;background:rgba(255,255,255,.8);border-radius:20px;border:1px solid rgba(255,255,255,.3);
  box-shadow:0 8px 32px rgba(0,0,0,.1), inset 0 1px 0 rgba(255,255,255,.5);animation:${fadeInStagger} .8s ease-out .4s both;
`;
const IntroText = styled.p`font-size:23px;color:#4a5568;line-height:1.8;margin:0;font-weight:400;`;
const HighlightText = styled.span`
  color:#2e2f5e;font-weight:600;position:relative;
  &::before{content:'';position:absolute;bottom:2px;left:0;right:0;height:2px;background:linear-gradient(90deg,#7AC2DD,#5A8CF2);opacity:.3;border-radius:1px;}
`;
const Disclaimer = styled.div`
  position:fixed;bottom:4px;left:${p=>p.isVideoMode?'70%':'50%'};transform:translateX(-50%);width:90%;max-width:1440px;font-size:12px;color:#666;text-align:center;padding:4px 8px;z-index:100;transition:left .3s ease;
`;
const FallbackImage = styled.img`position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;border-radius:20px;transition:opacity 1.2s;opacity:${p=>p.visible?1:0};`;
const DemoContainer = styled.div`position:relative;width:105%;height:91vh;max-height:90vh;`;

/* ================= Enhanced Bot Configuration ================= */
const ENHANCED_BOT_MAP = {
  empathy: {
    name: "Lumi",
    letter: "L",
    avatarBg: "linear-gradient(45deg,#FFB6C1,#FF8FB1)",
    role: "溫暖的同理型AI心理陪伴者",
    tagline: "Lumi — 用溫柔與共感陪你說說話。",
    subtitle: "溫暖陪伴、情緒承接與安撫，讓你被好好地聽見與理解。",
    specialty: "情感支持、同理傾聽、情緒驗證",
    approach: "以溫柔非評判的方式提供情感支持和陪伴"
  },
  insight: {
    name: "Solin",
    letter: "S", 
    avatarBg: "linear-gradient(45deg,#7AC2DD,#5A8CF2)",
    role: "智慧的洞察型AI探索引導者",
    tagline: "Solin — 一起釐清、看見新的可能。",
    subtitle: "以溫柔的提問與重述，幫助梳理線索、找出關鍵與洞見。",
    specialty: "深度探索、模式識別、自我覺察",
    approach: "透過蘇格拉底式提問引導自主思考和洞察"
  },
  solution: {
    name: "Niko",
    letter: "N",
    avatarBg: "linear-gradient(45deg,#9BB5E3,#6B73FF)",
    role: "務實的解決型AI行動教練", 
    tagline: "Niko — 一起做點能改變的事。",
    subtitle: "聚焦可行步驟與微目標，幫助把感受轉成行動與支持。",
    specialty: "問題解決、目標設定、行動規劃",
    approach: "以務實的方式協助制定具體可行的解決方案"
  },
  cognitive: {
    name: "Clara",
    letter: "C",
    avatarBg: "linear-gradient(45deg,#8D8DF2,#5A5B9F)",
    role: "理性的認知型AI思維重建專家",
    tagline: "Clara — 一起練習看見思緒的樣子。", 
    subtitle: "以認知重建、想法檢核、替代想法等，幫你和腦內小劇場溫柔同桌。",
    specialty: "認知重構、思維分析、理性檢驗",
    approach: "運用CBT技巧幫助識別和重構不合理的思維模式"
  },
};

/* ================= Enhanced API Integration ================= */
const API_BASE = (import.meta?.env?.VITE_API_BASE) || (process.env.REACT_APP_API_BASE) || "";

const apiSendEnhanced = async ({ botType, mode, message, history, demo = false, context = {} }) => {
  const userObj = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userObj?.id ?? 0;
  const url = `${API_BASE}/api/chat/send`.replace(/\/{2,}/g, "/").replace(":/", "://");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": String(userId),
        ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ 
        bot_type: botType, 
        mode, 
        message, 
        history, 
        demo,
        context  // 新增：上下文資訊
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} ${text.slice(0, 120)}`);
    }
    return await res.json();
  } catch (e) {
    console.warn("apiSendEnhanced failed:", e);
    return { ok: false, error: String(e) };
  }
};

export default function EnhancedMoodInput() {
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
  const [isSecondVideo, setIsSecondVideo] = useState(false);
  const [playIntroVideo, setPlayIntroVideo] = useState(false);
  const videoRef = useRef(null);
  
  // 新增：增強功能狀態
  const [emotionalAnalysis, setEmotionalAnalysis] = useState(null);
  const [suggestedResponses, setSuggestedResponses] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [botThinking, setBotThinking] = useState(false);
  const [showEmotionIndicator, setShowEmotionIndicator] = useState(false);

  const selectedBotType = localStorage.getItem("selectedBotType") || "solution";
  const bot = ENHANCED_BOT_MAP[selectedBotType] || ENHANCED_BOT_MAP.solution;
  const selectedBotImage = localStorage.getItem("selectedBotImage") || botTemp;
  const nickname = (JSON.parse(localStorage.getItem("user")||"{}").nickname) || "你";

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
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (playIntroVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(()=>{});
    }
  }, [playIntroVideo]);

  // 狀態提示
  const showStatus = (message, duration = 3000) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(null), duration);
  };

  // 開始對話 - 增強版
  const startConversation = async () => {
    const now = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const welcomeMessage = `嗨 ${nickname}，我是 ${bot.name}。${bot.approach}今天想從哪裡開始呢？`;
    
    const first = { 
      sender: "ai", 
      content: welcomeMessage, 
      timestamp: now,
      suggestions: [
        "想聊聊今天的心情",
        "分享最近的困擾", 
        "需要一些支持和陪伴"
      ]
    };
    
    setMessages([first]);
    setChatStarted(true);
    setSuggestedResponses(first.suggestions || []);
    setShowSuggestions(true);
    
    if (mode === "video") setPlayIntroVideo(true);
    
    // 後端記錄
    await apiSendEnhanced({ 
      botType: selectedBotType, 
      mode, 
      message: welcomeMessage, 
      history: [{role:"assistant",content:welcomeMessage}], 
      demo: true 
    });
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
  }, [chatStarted]);

  // 處理建議回應點擊
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setTimeout(() => handleSend(), 100);
  };

  // 發送訊息 - 增強版
  const handleSend = async (messageOverride = null) => {
    const actualMessage = messageOverride || inputValue.trim();
    
    if (!actualMessage && !isRecording) return;
    if (!chatStarted) { await startConversation(); return; }

    const now = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    // 使用者訊息
    let userMsgText = actualMessage;
    if (isRecording && !messageOverride) userMsgText = "[語音訊息]";
    
    const userMessage = { sender: "user", content: userMsgText, timestamp: now };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setInputDisabled(true);
    setIsTyping(true);
    setBotThinking(true);
    setShowSuggestions(false);
    if (isRecording) setIsRecording(false);

    // 準備歷史記錄
    const history = [...messages, userMessage].map(m => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.content
    }));

    // 準備上下文
    const context = {
      conversation_length: history.length,
      user_mood_indicators: extractMoodIndicators(userMsgText),
      time_of_day: new Date().getHours(),
      session_type: mode
    };

    try {
      // 呼叫增強版API
      const result = await apiSendEnhanced(userMsgText, selectedBotType, mode, history, context);
      
      if (result?.ok && result.reply) {
        const replyTime = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        const aiMessage = { 
          sender: "ai", 
          content: result.reply, 
          timestamp: replyTime,
          suggestions: result.suggested_follow_up || []
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // 更新增強功能狀態
        if (result.emotional_analysis) {
          setEmotionalAnalysis(result.emotional_analysis);
          if (result.emotional_analysis.emotions?.length > 0) {
            setShowEmotionIndicator(true);
            setTimeout(() => setShowEmotionIndicator(false), 5000);
          }
        }
        
        if (result.suggested_follow_up?.length > 0) {
          setSuggestedResponses(result.suggested_follow_up);
          setTimeout(() => setShowSuggestions(true), 1000);
        }
        
        if (mode === "video") {
          setIsSecondVideo(true);
          setPlayIntroVideo(true);
        }
      } else {
        throw new Error(result?.error || "API 回傳格式錯誤");
      }
    } catch (error) {
      console.error("Enhanced Chat API failed:", error);
      
      // Fallback 回覆 - 根據 bot 類型
      const fallbackReplies = {
        empathy: "我在這裡陪著你。此刻最強烈的感受是什麼？",
        insight: "讓我們一步步來理解這個情況。你覺得最重要的是哪個部分？",
        solution: "我們可以從一個小步驟開始。你想先處理哪個部分？",
        cognitive: "讓我們先識別一下剛剛的自動想法。你能描述一下當時心中想到什麼嗎？"
      };
      
      const replyTime = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      const fallbackReply = fallbackReplies[selectedBotType] || fallbackReplies.solution;
      
      setMessages(prev => [...prev, { 
        sender: "ai", 
        content: fallbackReply, 
        timestamp: replyTime,
        isError: true
      }]);
    }

    setIsTyping(false);
    setInputDisabled(false);
    setBotThinking(false);
  };

  // 提取心情指標
  const extractMoodIndicators = (message) => {
    const moodKeywords = {
      positive: ["開心", "快樂", "興奮", "滿足", "感謝", "希望"],
      negative: ["難過", "傷心", "生氣", "焦慮", "害怕", "壓力"],
      neutral: ["還好", "普通", "一般", "沒什麼", "不知道"]
    };
    
    const detected = {};
    Object.keys(moodKeywords).forEach(mood => {
      detected[mood] = moodKeywords[mood].some(keyword => message.includes(keyword));
    });
    
    return detected;
  };

  // 語音按鈕處理
  const handleVoiceButton = () => {
    if (inputDisabled) return;
    if (isRecording) {
      setIsRecording(false);
      showStatus("語音錄製已停止");
      handleSend();
    } else {
      setIsRecording(true);
      showStatus("正在錄製語音... 再次點擊結束錄製");
      navigator.mediaDevices?.getUserMedia?.({ audio: true }).then(()=>{}).catch(err=>{
        console.error("無法取得麥克風權限:", err);
        setIsRecording(false);
        showStatus("無法取得麥克風權限");
      });
    }
  };

  const today = new Date().toLocaleDateString('zh-TW', {year:'numeric',month:'long',day:'numeric',weekday:'long'});

  return (
    <Container>
      <WelcomeAnimation visible={showWelcome}>Welcome Emobot+</WelcomeAnimation>
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
            <ModeButton active={mode==="text"} onClick={()=>setMode("text")}>文字模式</ModeButton>
            <ModeButton active={mode==="video"} onClick={()=>setMode("video")}>影像模式</ModeButton>
          </ModeSelect>
        )}

        {chatStarted && (
          <AvatarContainer>
            <BotInfo>
              <BotName>{bot.name}</BotName>
              <BotStatus>
                在線上
                {botThinking && <span>• 思考中...</span>}
              </BotStatus>
              <BotRole>{bot.role}</BotRole>
            </BotInfo>
            <BotAvatar bg={bot.avatarBg} thinking={botThinking}>
              {bot.letter}
            </BotAvatar>
            
            {/* 情緒指示器 */}
            <EmotionIndicator show={showEmotionIndicator && emotionalAnalysis}>
              {emotionalAnalysis?.emotions?.length > 0 && (
                <>
                  <FiInfo size={12} style={{marginRight: '4px'}} />
                  偵測到: {emotionalAnalysis.emotions.join(', ')}
                </>
              )}
            </EmotionIndicator>
          </AvatarContainer>
        )}
      </Header>

      <Layout>
        {mode === "video" && (
          <VideoColumn show={true}>
            <DemoContainer>
              <FallbackImage src={selectedBotImage} visible={!playIntroVideo} />
              <DemoVideo 
                ref={videoRef} 
                src={isSecondVideo ? secondVideo : introVideo} 
                visible={playIntroVideo}
                onEnded={() => { 
                  setPlayIntroVideo(false); 
                  try{ videoRef.current.pause(); }catch{} 
                }} 
              />
            </DemoContainer>
          </VideoColumn>
        )}

        <ChatColumn>
          {!chatStarted ? (
            <FadeWrapper key={mode}>
              <Description>
                <Title>分享一下今天的心情吧！</Title>
                <Subtitle>{bot.tagline}</Subtitle>
                
                {/* AI 介紹卡片 */}
                <BotIntroCard botType={selectedBotType}>
                  <BotIntroHeader>
                    <BotAvatar bg={bot.avatarBg} style={{width: '36px', height: '36px', fontSize: '16px'}}>
                      {bot.letter}
                    </BotAvatar>
                    <div>
                      <BotIntroName>{bot.name}</BotIntroName>
                      <BotIntroRole>{bot.role}</BotIntroRole>
                    </div>
                  </BotIntroHeader>
                  <BotIntroText>
                    <strong>專長：</strong>{bot.specialty}<br/>
                    <strong>方式：</strong>{bot.approach}
                  </BotIntroText>
                </BotIntroCard>
              </Description>
            </FadeWrapper>
          ) : (
            <>
              <IntroBar>{bot.tagline}</IntroBar>
              <DateDivider><DateLabel>{today}</DateLabel></DateDivider>
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
                    <ChatBubble sender={m.sender} style={{borderColor: m.isError ? '#ff6b6b' : undefined}}>
                      {m.content}
                      
                      {/* 建議回應 */}
                      {m.sender === "ai" && m.suggestions?.length > 0 && (
                        <SuggestedResponses show={showSuggestions && i === messages.length - 1}>
                          {m.suggestions.map((suggestion, idx) => (
                            <SuggestionButton 
                              key={idx} 
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </SuggestionButton>
                          ))}
                        </SuggestedResponses>
                      )}
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
                      <TypingDot delay={.4} /><TypingDot delay={.6} /><TypingDot delay={.8} />
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
            inputDisabled ? "請等待回覆..." : 
            isRecording ? "正在錄製語音..." : 
            !chatStarted ? "按空白鍵開始對話，或直接輸入訊息" :
            "將你的心情寫在這裡吧！"
          }
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !inputDisabled) {
              handleSend();
            }
          }}
          disabled={inputDisabled || isRecording}
        />
        <InputButtons>
          <ActionButton 
            onClick={handleVoiceButton} 
            disabled={inputDisabled} 
            isRecording={isRecording}
            title={isRecording ? "停止錄音" : "語音輸入"}
          >
            <FiMic />
          </ActionButton>
          <SendButton 
            onClick={() => handleSend()} 
            active={inputValue.trim().length > 0 || isRecording} 
            disabled={inputDisabled && !isRecording}
            title="發送訊息"
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