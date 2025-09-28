// src/components/MoodInput.jsx - 整合頭像動畫功能
import React, { useState, useRef, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import botTemp from "../assets/bot_temp.png";
import { IoSend } from "react-icons/io5";
import { FiChevronLeft, FiMic, FiVolume2, FiVolumeX } from "react-icons/fi";
import introVideo from "../assets/demo_video_2.mov";
import secondVideo from "../assets/demo_video_3.mov";
import { sendChatMessage } from "../api/client";
import AvatarAnimation from "./AvatarAnimation";

/* ===========================================================
   工具：呼叫後端 Agents Streaming API（內建，避免額外檔案依賴）
   後端請加入 /api/chat/did/agents/* 路由（我在訊息後段有說明）
=========================================================== */
const API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/+$/, "");

async function jsonFetch(path, { method = "GET", body } = {}) {
  const url = `${API_BASE}${path}`;
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

// 頭像動畫 API
async function apiCreateAnimation(text, botType) {
  return jsonFetch(`/api/chat/avatar/animate`, {
    method: "POST",
    body: { 
      text, 
      bot_type: botType,
      animation_style: "normal"
    },
  });
}

// Streaming API（保留原有功能）
async function apiCreateStream() {
  return jsonFetch(`/api/chat/did/agents/streams`, {
    method: "POST",
    body: { fluent: true, compatibility_mode: "on" },
  });
}
async function apiSendSDP(streamId, answer, sessionId) {
  return jsonFetch(`/api/chat/did/agents/streams/${encodeURIComponent(streamId)}/sdp`, {
    method: "POST",
    body: { answer, session_id: sessionId },
  });
}
async function apiSendICE(streamId, candidate, sessionId) {
  return jsonFetch(`/api/chat/did/agents/streams/${encodeURIComponent(streamId)}/ice`, {
    method: "POST",
    body: {
      candidate: candidate || null,
      sdpMid: candidate?.sdpMid ?? null,
      sdpMLineIndex: candidate?.sdpMLineIndex ?? null,
      session_id: sessionId,
    },
  });
}
async function apiSpeak(streamId, sessionId, text) {
  return jsonFetch(`/api/chat/did/agents/streams/${encodeURIComponent(streamId)}/speak`, {
    method: "POST",
    body: { stream_id: streamId, session_id: sessionId, text },
  });
}
async function apiCloseStream(streamId, sessionId) {
  return jsonFetch(`/api/chat/did/agents/streams/${encodeURIComponent(streamId)}`, {
    method: "DELETE",
    body: { session_id: sessionId },
  });
}

/* ================= 動畫定義（保留原有 + 微調）================ */
const float = keyframes`0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)}`;
const fadeIn = keyframes`from{opacity:0}to{opacity:1}`;
const fadeInDown = keyframes`from{opacity:0;transform:translateY(-30px)}to{opacity:1;transform:translateY(0)}`;
const slideInLTR = keyframes`from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}`;
const fadeInBubble = keyframes`from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}`;
const pulse = keyframes`0%{box-shadow:0 0 0 0 rgba(122,194,221,.4)}70%{box-shadow:0 0 0 10px rgba(122,194,221,0)}100%{box-shadow:0 0 0 0 rgba(122,194,221,0)}`;
const recording = keyframes`0%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:.8)}100%{transform:scale(1);opacity:1}`;
const fadeInStagger = keyframes`from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}`;

/* ================= 樣式（原樣保留）================ */
const Container = styled.div`
  display:flex;flex-direction:column;width:100vw;height:100vh;
  background:linear-gradient(135deg,#f5f7fa 0%,#eef1f5 100%);font-family:'Noto Sans TC',-apple-system,BlinkMacSystemFont,sans-serif;
  position:relative;overflow:hidden;
  @media (max-width:768px){overflow-y:auto;background-size:140%;background-position:center 30%;}
`;
const Header = styled.header`
  position:fixed;top:0;left:0;right:0;height:70px;display:flex;align-items:center;justify-content:space-between;
  padding:0 30px;background:linear-gradient(135deg,rgba(255,255,255,.95) 0%,rgba(248,250,252,.95) 100%);
  backdrop-filter:blur(15px);border-bottom:1px solid rgba(43,57,147,.1);box-shadow:0 4px 20px rgba(43,57,147,.08),0 2px 8px rgba(0,0,0,.04);
  z-index:100;animation:${fadeInDown} .8s ease-out both;animation-delay:.3s;
  @media (max-width:768px){height:55px;padding:0 12px;}
`;
const BackButton = styled.button`
  background:transparent;color:#2e2f5e;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;font-weight:600;font-size:16px;
  border:1px solid rgba(46,47,94,.2);cursor:pointer;transition:all .3s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;
  &:before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.2) 50%,transparent 100%);transition:left .6s ease;}
  &:hover{background:rgba(46,47,94,.05);transform:translateX(-2px) scale(1.02);box-shadow:0 4px 12px rgba(46,47,94,.15);&:before{left:100%;}}
  &:active{transform:translateX(-1px) scale(.98);}
  @media (max-width:768px){font-size:14px;padding:8px 14px;}
`;
const ModeSelect = styled.div`
  background:rgba(255,255,255,.9);padding:6px;border-radius:14px;display:flex;gap:4px;box-shadow:0 4px 20px rgba(0,0,0,.06);backdrop-filter:blur(10px);
  @media (max-width:320px){display:none;}
`;
const ModeButton = styled.button`
  padding:10px 22px;border-radius:10px;font-weight:600;font-size:15px;border:none;cursor:pointer;position:relative;overflow:hidden;
  background:${p=>p.active?'linear-gradient(45deg,#2e2f5e,#5a5b9f)':'transparent'};
  color:${p=>p.active?'#fff':'#555'};
  &:hover{background:${p=>p.active?'linear-gradient(45deg,#2e2f5e,#5a5b9f)':'rgba(0,0,0,.05)'};transform:translateY(-1px);}
`;
const AvatarContainer = styled.div`display:flex;align-items:center;gap:12px;`;
const BotAvatar = styled.div`
  width:50px;height:50px;border-radius:50%;background:${p=>p.bg||'linear-gradient(45deg,#7AC2DD,#5A8CF2)'};
  display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:20px;box-shadow:0 4px 12px rgba(90,140,242,.3);
`;
const BotInfo = styled.div`display:flex;flex-direction:column;@media (max-width:480px){display:none;}`;
const BotName = styled.span`font-weight:700;font-size:16px;color:#2e2f5e;`;
const BotStatus = styled.span`font-size:13px;color:#65B741;`;
const Layout = styled.div`
  flex:1;display:flex;padding:100px 40px 140px;box-sizing:border-box;overflow:hidden;gap:30px;
  @media (max-width:768px){flex-direction:column;padding:70px 16px 150px;gap:16px;}
`;
const VideoColumn = styled.div`
  position:relative;top:60px;width:45%;max-width:520px;display:${p=>p.show?'block':'none'};padding-right:30px;
  @media (max-width:768px){width:100%;top:0;padding-right:0;margin-bottom:20px;order:1;}
`;
const DemoContainer = styled.div`
  position:relative;width:100%;height:85vh;max-height:700px;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.15);
  @media (max-width:768px){height:220px;max-height:250px;border-radius:12px;}
`;
const DemoVideo = styled.video`
  position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;transition:opacity 1.2s ease-in-out;opacity:${p=>p.visible?1:0};
`;
const FallbackImage = styled.img`
  position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;transition:opacity 1.2s ease-in-out;opacity:${p=>p.visible?1:0};
`;
const ChatColumn = styled.div`flex:1;display:flex;flex-direction:column;overflow-y:auto;position:relative;scroll-behavior:smooth;`;
const FadeWrapper = styled.div`display:flex;flex-direction:column;justify-content:center;align-items:center;flex:1;animation:${fadeIn} 1s ease-out forwards;padding:20px;text-align:center;`;
const Description = styled.div`margin:auto;text-align:center;max-width:600px;animation:${fadeIn} 1s ease-out forwards;`;
const Title = styled.h1`
  font-size:42px;font-weight:800;margin-bottom:16px;background:linear-gradient(45deg,#2e2f5e 30%,#5A8CF2 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.2;text-shadow:0 2px 4px rgba(0,0,0,.1);
  @media (max-width:768px){font-size:30px;}
`;
const Subtitle = styled.p`
  font-size:22px;color:#666;line-height:1.7;opacity:0;animation:${fadeIn} 1s ease-out .5s forwards;
  @media (max-width:768px){font-size:17px;}
`;
const IntroBar = styled.div`
  margin:0 auto 24px;padding:20px 28px;background:linear-gradient(135deg,rgba(122,194,221,.1) 0%,rgba(90,140,242,.08) 100%);
  border:1px solid rgba(122,194,221,.2);border-radius:16px;box-shadow:0 8px 32px rgba(122,194,221,.12),0 4px 16px rgba(0,0,0,.04),inset 0 1px 0 rgba(255,255,255,.6);
  font-size:16px;font-weight:600;line-height:1.6;animation:${fadeInDown} .6s ease-out, ${float} 4s ease-in-out 1s infinite;max-width:600px;text-align:center;color:#2e2f5e;
`;
const DateDivider = styled.div`text-align:center;margin:20px 0;position:relative; &:before{content:"";position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(0,0,0,.1);z-index:-1;}`;
const DateLabel = styled.span`background:#f0f4f8;padding:4px 12px;border-radius:20px;font-size:13px;color:#666;box-shadow:0 2px 4px rgba(0,0,0,.05);`;
const ChatBox = styled.div`display:flex;flex-direction:column;gap:16px;padding-right:10px;padding-bottom:20px;overflow-y:auto;animation:${slideInLTR} .4s ease-out both;`;
const BubbleWrapper = styled.div`
  display:flex;flex-direction:column;align-items:${p=>p.sender==='user'?'flex-end':'flex-start'};
  max-width:85%;align-self:${p=>p.sender==='user'?'flex-end':'flex-start'};
`;
const BubbleHeader = styled.div`font-size:12px;color:#888;margin-bottom:4px;padding:0 12px;display:flex;align-items:center;gap:6px;`;
const SenderAvatar = styled.div`
  width:24px;height:24px;border-radius:50%;background:${p=>p.sender==='user'?'#5A8CF2':'linear-gradient(135deg,#7AC2DD,#5A8CF2)'};
  display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:10px;box-shadow:0 2px 4px rgba(0,0,0,.1);
`;
const ChatBubble = styled.div`
  background:${p=>p.sender==='user'?'linear-gradient(135deg,#5A8CF2,#7A72E0)':'#fff'};
  color:${p=>p.sender==='user'?'#fff':'#333'};padding:14px 20px;border-radius:${p=>p.sender==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px'};
  box-shadow:${p=>p.sender==='user'?'0 4px 12px rgba(90,140,242,.2)':'0 4px 12px rgba(0,0,0,.08)'};white-space:pre-wrap;animation:${fadeInBubble} .3s ease-out;line-height:1.5;font-size:15px;
`;
const MessageTime = styled.span`font-size:11px;color:#999;`;
const TypingBubble = styled(ChatBubble)`width:60px;height:32px;padding:0;display:flex;align-items:center;justify-content:center;gap:4px;`;
const TypingDot = styled.div`
  width:8px;height:8px;background:#888;border-radius:50%;opacity:.8;animation:${p=>keyframes`
    0%,100%{transform:translateY(0);opacity:.8;}
    50%{transform:translateY(-4px);opacity:1;}
  `} ${p=>p.delay}s infinite ease-in-out;
`;
const InputArea = styled.div`
  position:fixed;bottom:35px;left:${p=>p.isVideoMode?'70%':'50%'};transform:translateX(-50%);width:${p=>p.isVideoMode?'50%':'90%'};
  background:${p=>p.disabled?'rgba(240,240,240,.95)':'rgba(255,255,255,.98)'};border-radius:14px;display:flex;align-items:center;padding:6px 10px;
  backdrop-filter:blur(15px);box-shadow:0 10px 40px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.04),inset 0 1px 0 rgba(255,255,255,.8);
  border:1px solid rgba(0,0,0,.05);z-index:100;transition:all .3s cubic-bezier(.4,0,.2,1);
  @media (max-width:768px){left:50%;width:94%;}
`;
const InputField = styled.input`
  flex:1;font-size:16px;background:transparent;border:none;outline:none;padding:14px 20px;color:${p=>p.disabled?'#999':'#333'};
  &::placeholder{color:${p=>p.disabled?'#aaa':'#999'};font-style:italic;}
`;
const InputButtons = styled.div`display:flex;align-items:center;gap:12px;padding-right:8px;`;
const ActionButton = styled.button`
  width:44px;height:44px;background:${p=>p.isRecording?'rgba(234,84,85,.1)':'transparent'};border-radius:50%;border:none;color:${p=>p.isRecording?'#EA5455':'#888'};
  font-size:20px;display:flex;align-items:center;justify-content:center;cursor:${p=>p.disabled?'not-allowed':'pointer'};
  transition:all .3s cubic-bezier(.4,0,.2,1);animation:${p=>p.isRecording?recording:'none'} 1.5s infinite;opacity:${p=>p.disabled?.5:1};
`;
const SendButton = styled.button`
  width:50px;height:50px;background:${p=>p.disabled?'#ccc':'linear-gradient(135deg,#7AC2DD,#5A8CF2)'};border-radius:50%;border:none;color:#fff;font-size:22px;
  display:flex;align-items:center;justify-content:center;cursor:${p=>p.disabled?'not-allowed':'pointer'};transition:all .3s cubic-bezier(.4,0,.2,1);
  animation:${p=>p.active&&!p.disabled?pulse:'none'} 1.5s infinite;opacity:${p=>p.disabled?.7:1};box-shadow:0 4px 12px rgba(122,194,221,.3);
`;
const StatusMessage = styled.div`
  position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.8);color:#fff;padding:12px 20px;border-radius:24px;font-size:14px;z-index:101;
  animation:${fadeInDown} .3s ease-out;backdrop-filter:blur(10px);box-shadow:0 4px 16px rgba(0,0,0,.2);max-width:90%;text-align:center;
`;
const WelcomeAnimation = styled.div`
  position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,rgba(255,255,255,.95) 0%,rgba(248,250,252,.95) 100%);
  display:flex;justify-content:center;align-items:center;font-size:80px;font-weight:bold;color:#2b3993;z-index:200;opacity:${p=>p.visible?1:0};visibility:${p=>p.visible?'visible':'hidden'};
  transition:all .5s cubic-bezier(.4,0,.2,1);text-shadow:0 4px 8px rgba(43,57,147,.2);
`;
const IntroTextOverlay = styled.div`
  position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(248,250,252,.95));
  display:flex;flex-direction:column;justify-content:flex-start;align-items:center;padding:200px 40px 40px;text-align:center;z-index:200;
  opacity:${p=>p.visible?1:0};visibility:${p=>p.visible?'visible':'hidden'};transition:opacity .6s cubic-bezier(.4,0,.2,1),visibility .6s;
`;
const TipHeader = styled.h2`
  font-size:38px;font-weight:700;background:linear-gradient(45deg,#2e2f5e 30%,#5A8CF2 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;animation:${fadeInStagger} .8s ease-out;
`;
const IntroContent = styled.div`
  max-width:680px;width:100%;padding:32px;background:rgba(255,255,255,.9);border-radius:20px;border:1px solid rgba(255,255,255,.3);
  box-shadow:0 8px 32px rgba(0,0,0,.1),0 4px 16px rgba(0,0,0,.04),inset 0 1px 0 rgba(255,255,255,.5);animation:${fadeInStagger} .8s ease-out .4s both;
`;
const IntroText = styled.p`font-size:23px;color:#4a5568;line-height:1.8;margin:0;font-weight:400;`;
const Disclaimer = styled.div`
  position:fixed;bottom:4px;left:${p=>p.isVideoMode?'70%':'50%'};transform:translateX(-50%);width:90%;max-width:1440px;font-size:12px;color:#666;text-align:center;padding:4px 8px;z-index:100;
  transition:left .3s ease;
`;

/* ====== 影音控制 Overlay ====== */
const OverlayBar = styled.div`
  position:absolute;right:12px;bottom:12px;display:flex;gap:8px;z-index:5;
`;
const SmallBtn = styled.button`
  background:rgba(0,0,0,.55);color:#fff;border:none;border-radius:999px;padding:8px 12px;display:flex;align-items:center;gap:6px;cursor:pointer;
  font-size:13px;backdrop-filter:blur(6px);
`;

/* ================== Bot 定義（保留）================== */
const BOT_MAP = {
  empathy: { name: "Lumi", letter: "L", avatarBg: "linear-gradient(45deg, #FFB6C1, #FF8FB1)", tagline: "Lumi — 用溫柔與共感陪你說說話。", subtitle: "溫暖陪伴、情緒承接與安撫，讓你被好好地聆聽與理解。"},
  insight:  { name: "Solin", letter: "S", avatarBg: "linear-gradient(45deg, #7AC2DD, #5A8CF2)", tagline: "Solin — 一起澄清、看見新的可能。", subtitle: "以溫柔的提問與澄清，幫助梳理線索、找出關鍵與洞見。"},
  solution: { name: "Niko", letter: "N", avatarBg: "linear-gradient(45deg, #7AC2DD, #5A8CF2)", tagline: "Niko — 一起做點能改變的事。", subtitle: "聚焦可行步驟與微目標，幫助把感受轉成行動與支持。"},
  cognitive:{ name: "Clara", letter: "C", avatarBg: "linear-gradient(45deg, #8D8DF2, #5A5B9F)", tagline: "Clara — 一起練習看見思緒的樣子。", subtitle: "以認知重建、想法檢核、替代想法等，幫你和腦內小劇場溫柔共桌。"},
};

/* ====== 加粗強調（保留）====== */
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

/* ====== 語音片段策略：只取第一句 / 限長 ====== */
function sliceForSpeech(text, maxChars = 80) {
  if (!text) return "";
  const firstSentence = text.split(/(?<=[。！？!?])\s*/)[0] || text;
  const trimmed = firstSentence.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return trimmed.slice(0, maxChars) + "…";
}

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

  /* ============ Streaming 狀態 ============ */
  const [streamInfo, setStreamInfo] = useState(null); // { stream_id, session_id }
  const pcRef = useRef(null);

  /* ============ 影音控制 ============ */
  const [isMuted, setIsMuted] = useState(true);
  const [soundUnlocked, setSoundUnlocked] = useState(localStorage.getItem("sound_unlocked") === "1");

  /* ============ 頭像動畫狀態 ============ */
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  /* ============ 句子佇列（避免重入）============ */
  const [talkQueue, setTalkQueue] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  /* ============ 其餘參考資料 ============ */
  const selectedBotType = (localStorage.getItem("selectedBotType") || "solution");
  const bot = BOT_MAP[selectedBotType] || BOT_MAP.solution;
  const selectedBotImage = localStorage.getItem("selectedBotImage") || botTemp;
  const nickname = (JSON.parse(localStorage.getItem("user") || "{}").nickname) || "你";

  /* ============ 提示 ============ */
  const showStatus = (message, duration = 3000) => {
    setStatusMessage(message);
    if (duration > 0) setTimeout(() => setStatusMessage(null), duration);
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

  /* ============ 自動滾底 ============ */
  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages, isTyping]);

  /* ============ 視訊元素屬性 ============ */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !soundUnlocked || isMuted;
      videoRef.current.playsInline = true;
      if (soundUnlocked) videoRef.current.play().catch(()=>{});
    }
  }, [soundUnlocked, isMuted]);

  /* ============ 一次性解鎖聲音（行動端必要）============ */
  const unlockAudio = useCallback(async () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf; src.connect(ctx.destination); src.start(0);
      setSoundUnlocked(true);
      localStorage.setItem("sound_unlocked", "1");
      setIsMuted(false);
      if (videoRef.current) {
        videoRef.current.muted = false;
        await videoRef.current.play().catch(()=>{});
      }
    } catch (e) { console.warn("unlock failed", e); }
  }, []);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !isMuted;
    setIsMuted(next);
    v.muted = !soundUnlocked || next;
    if (soundUnlocked && !next) { v.play().catch(()=>{}); }
  };

  /* ============ 佇列：加入要說的句子 ============ */
  const enqueueTalk = useCallback((text) => {
    const toSpeak = sliceForSpeech(text, 80);
    if (!toSpeak) return;
    setTalkQueue(q => [...q, toSpeak]);
  }, []);

  /* ============ 佇列處理：送入 Speak ============ */
  useEffect(() => {
    if (!streamInfo || isSpeaking || talkQueue.length === 0) return;
    let cancelled = false;
    (async () => {
      setIsSpeaking(true);
      try {
        while (!cancelled && talkQueue.length > 0 && streamInfo) {
          const sentence = talkQueue[0];
          try {
            await apiSpeak(streamInfo.stream_id, streamInfo.session_id, sentence);
          } catch (e) {
            console.warn("speak failed:", e);
            showStatus("串流說話失敗，將以文字繼續", 2500);
            break;
          }
          setTalkQueue(q => q.slice(1));
        }
      } finally {
        if (!cancelled) setIsSpeaking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [streamInfo, talkQueue, isSpeaking]);

  /* ============ 建立/關閉 Streaming 連線 ============ */
  async function startDidStreaming() {
    try {
      const s = await apiCreateStream(); // { id, session_id, offer, ice_servers }
      const streamId = s.id, sessionId = s.session_id;

      const pc = new RTCPeerConnection({ iceServers: s.ice_servers || [] });
      pcRef.current = pc;

      const remoteStream = new MediaStream();
      if (videoRef.current) videoRef.current.srcObject = remoteStream;

      pc.ontrack = (e) => {
        // 接收遠端音/影 track
        e.streams[0].getTracks().forEach(t => remoteStream.addTrack(t));
        // 自動播放
        if (videoRef.current && soundUnlocked) videoRef.current.play().catch(()=>{});
      };

      pc.onicecandidate = async (ev) => {
        try { await apiSendICE(streamId, ev.candidate, sessionId); } catch (e) { console.warn("sendICE", e); }
      };

      await pc.setRemoteDescription({ type: "offer", sdp: s.offer });
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await apiSendSDP(streamId, answer.sdp, sessionId);

      // 等 ICE 連線
      await new Promise((res) => {
        const check = () => {
          const st = pc.iceConnectionState;
          if (st === "connected" || st === "completed") res();
        };
        pc.addEventListener("iceconnectionstatechange", check);
        check();
        setTimeout(res, 5000);
      });

      setStreamInfo({ stream_id: streamId, session_id: sessionId });
      return { streamId, sessionId };
    } catch (e) {
      console.error("startDidStreaming error:", e);
      setStreamInfo(null);
      if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
      throw e;
    }
  }

  async function stopDidStreaming() {
    const info = streamInfo;
    try {
      if (info) await apiCloseStream(info.stream_id, info.session_id);
    } catch {}
    setStreamInfo(null);
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
  }

  useEffect(() => () => { stopDidStreaming(); }, []); // 卸載清理

  /* ============ 頭像動畫功能 ============ */
  const triggerAvatarAnimation = useCallback(async (text) => {
    if (!text || mode !== "video") return;
    
    try {
      setIsAnimating(true);
      showStatus("正在生成動畫...", 1000);
      
      const result = await apiCreateAnimation(text, selectedBotType);
      
      if (result.success) {
        setCurrentAnimation({
          avatarUrl: selectedBotImage,
          audioUrl: result.audio_base64,
          animationData: result.animation_data
        });
        showStatus("", 0); // 清除狀態
      } else {
        console.warn("動畫生成失敗:", result.error);
        // 靜默動畫作為後備
        setCurrentAnimation({
          avatarUrl: selectedBotImage,
          audioUrl: null,
          animationData: result.animation_data || null
        });
        if (result.error) {
          showStatus(result.error, 3000);
        }
      }
    } catch (error) {
      console.error("頭像動畫錯誤:", error);
      showStatus("動畫生成失敗，使用靜態顯示", 2500);
      // 使用靜態顯示作為後備
      setCurrentAnimation({
        avatarUrl: selectedBotImage,
        audioUrl: null,
        animationData: null
      });
    }
  }, [mode, selectedBotType, selectedBotImage]);

  /* ============ 動畫結束處理 ============ */
  const handleAnimationEnd = useCallback(() => {
    setIsAnimating(false);
    setCurrentAnimation(null);
  }, []);

  /* ============ 啟動對話 ============ */
  const startConversation = async () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const first = { sender: "ai", content: `嗨 ${nickname}，我是 ${bot.name}。今天想從哪裡開始呢？`, timestamp: now };
    setMessages([first]);
    setChatStarted(true);

    if (mode === "video") {
      // 優先嘗試頭像動畫
      await triggerAvatarAnimation(first.content);
      
      // 如果需要，也可以同時嘗試 streaming（作為備用）
      try {
        const { streamId, sessionId } = await startDidStreaming();
        // 第一句立即說
        const toSpeak = sliceForSpeech(first.content, 80);
        if (toSpeak) await apiSpeak(streamId, sessionId, toSpeak);
      } catch {
        // fallback：示範影片
        setPlayIntroVideo(true);
      }
    }

    // 回報後端（保留舊有）
    await sendChatMessage(first.content, selectedBotType, mode, [{ role: "assistant", content: first.content }], true);
  };

  /* ============ 快捷鍵：空白鍵開始對話 ============ */
  useEffect(() => {
    const handleSpace = e => { if (e.code === 'Space' && !chatStarted) { e.preventDefault(); startConversation(); } };
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [chatStarted]); // eslint-disable-line

  /* ============ 傳送訊息 → GPT → 佇列進 Streaming + 頭像動畫 ============ */
  const handleSend = async () => {
    if (!inputValue.trim() && !isRecording) return;
    if (!chatStarted) { await startConversation(); return; }

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
      const result = await sendChatMessage(userMsgText, localStorage.getItem("selectedBotType") || "solution", mode, history);
      if (result?.ok && result.reply) {
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const aiMsg = { sender: "ai", content: result.reply, timestamp: replyTime };
        setMessages(prev => [...prev, aiMsg]);

        if (mode === "video") {
          // 優先頭像動畫
          await triggerAvatarAnimation(result.reply);
          
          // 串流存在就即時說；否則試著啟動串流
          if (streamInfo) {
            enqueueTalk(result.reply);
          } else {
            try {
              const { streamId, sessionId } = await startDidStreaming();
              const toSpeak = sliceForSpeech(result.reply, 80);
              if (toSpeak) await apiSpeak(streamId, sessionId, toSpeak);
            } catch {
              setIsSecondVideo(true);
              setPlayIntroVideo(true);
            }
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
      
      if (mode === "video") {
        await triggerAvatarAnimation(fallbackReply);
        enqueueTalk(fallbackReply);
      }
    }

    setIsTyping(false);
    setInputDisabled(false);
  };

  /* ============ 語音按鈕（保留）============ */
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

  const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

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
        <BackButton onClick={() => { stopDidStreaming(); navigate("/dashboard"); }}>
          <FiChevronLeft size={18} />
          {chatStarted ? '離開對話' : '離開'}
        </BackButton>

        {!chatStarted && (
          <ModeSelect>
            <ModeButton active={mode === "text"} onClick={() => setMode("text")}>文字模式</ModeButton>
            <ModeButton active={mode === "video"} onClick={() => setMode("video")}>影像模式</ModeButton>
          </ModeSelect>
        )}

        {chatStarted && (
          <AvatarContainer>
            <BotInfo>
              <BotName>{bot.name}</BotName>
              <BotStatus>線上</BotStatus>
            </BotInfo>
            <BotAvatar bg={bot.avatarBg}>{bot.letter}</BotAvatar>
          </AvatarContainer>
        )}
      </Header>

      <Layout>
        {mode === "video" && (
          <VideoColumn show={true}>
            <DemoContainer>
              {/* 頭像動畫組件 */}
              {currentAnimation ? (
                <AvatarAnimation
                  avatarUrl={currentAnimation.avatarUrl}
                  audioUrl={currentAnimation.audioUrl}
                  animationData={currentAnimation.animationData}
                  isPlaying={isAnimating}
                  onAnimationEnd={handleAnimationEnd}
                />
              ) : (
                <>
                  {/* Streaming：使用 WebRTC track，因此這裡 <video> 用 srcObject（已在 startDidStreaming 設定） */}
                  <FallbackImage src={selectedBotImage} visible={!streamInfo && !playIntroVideo} />
                  <DemoVideo
                    ref={videoRef}
                    src={streamInfo ? undefined : (isSecondVideo ? secondVideo : introVideo)}
                    visible={Boolean(streamInfo) || playIntroVideo}
                    onEnded={() => { setPlayIntroVideo(false); try { videoRef.current.pause(); } catch {} }}
                    controls
                    playsInline
                    autoPlay
                    preload="auto"
                    muted={!soundUnlocked || isMuted}
                  />
                </>
              )}
              
              {/* 啟用聲音遮罩（一次性解鎖） */}
              {(!soundUnlocked) && (
                <div style={{
                  position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                  background:"linear-gradient(transparent, rgba(0,0,0,.35))", zIndex:6
                }}>
                  <button onClick={unlockAudio}
                    style={{padding:"10px 16px", borderRadius:999, border:"none",
                            background:"rgba(0,0,0,.6)", color:"#fff", cursor:"pointer"}}>
                    🔊 點一下啟用聲音
                  </button>
                </div>
              )}
              
              {/* 影音控制 Overlay */}
              {(Boolean(streamInfo) || playIntroVideo || currentAnimation) && (
                <OverlayBar>
                  <SmallBtn onClick={toggleMute} title={(!soundUnlocked || isMuted) ? "開聲音" : "關靜音"}>
                    {(!soundUnlocked || isMuted) ? <FiVolumeX /> : <FiVolume2 />}
                    <span>{(!soundUnlocked || isMuted) ? "點我開聲音" : "靜音"}</span>
                  </SmallBtn>
                </OverlayBar>
              )}
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
              <DateDivider><DateLabel>{today}</DateLabel></DateDivider>
              <ChatBox ref={chatBoxRef}>
                {messages.map((m, i) => (
                  <BubbleWrapper key={i} sender={m.sender}>
                    <BubbleHeader>
                      <SenderAvatar sender={m.sender}>
                        {m.sender === "user" ? (nickname?.[0] || "你") : bot.letter}
                      </SenderAvatar>
                      {m.sender === "user" ? nickname : `${bot.name} AI`} <MessageTime> {m.timestamp}</MessageTime>
                    </BubbleHeader>
                    <ChatBubble sender={m.sender}>{renderEmphasis(m.content)}</ChatBubble>
                  </BubbleWrapper>
                ))}
                {isTyping && (
                  <BubbleWrapper sender="ai">
                    <BubbleHeader>
                      <SenderAvatar sender="ai">{bot.letter}</SenderAvatar>
                      {bot.name} 正在輸入...
                    </BubbleHeader>
                    <TypingBubble>
                      <TypingDot delay={0.4} /><TypingDot delay={0.6} /><TypingDot delay={0.8} />
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
          placeholder={inputDisabled ? "請等待回復..." : isRecording ? "正在錄製語音..." : "將你的心情寫在這裡吧！"}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !inputDisabled && handleSend()}
          disabled={inputDisabled || isRecording}
        />
        <InputButtons>
          <ActionButton onClick={handleVoiceButton} disabled={inputDisabled} isRecording={isRecording} aria-label="錄製語音" title="錄製語音">
            <FiMic />
          </ActionButton>
          <SendButton onClick={handleSend} active={inputValue.trim().length > 0 || isRecording} disabled={inputDisabled && !isRecording} aria-label="送出訊息" title="送出訊息">
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