import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import botTemp from "../assets/bot_temp.png";
import { IoSend } from "react-icons/io5";
import { FiChevronLeft, FiMic } from "react-icons/fi";
import introVideo from "../assets/demo_video_2.mov";
import secondVideo from "../assets/demo_video_3.mov";


// ===== Animations =====
const float = keyframes`
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-4px); }
  100% { transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeInDown = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideInLTR = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInBubble = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
`;

const FadeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  animation: ${fadeIn} 1s ease-out forwards;
`;


const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(122, 194, 221, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(122, 194, 221, 0); }
  100% { box-shadow: 0 0 0 0 rgba(122, 194, 221, 0); }
`;

// 新增語音錄製動畫
const recording = keyframes`
  0%   { transform: scale(1); opacity: 1; }
  50%  { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

// ===== Styled Components =====
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef1f5 100%);
  font-family: 'Noto Sans TC', sans-serif;
  position: relative;
  overflow: hidden;
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 100;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  animation: ${fadeInDown} 0.8s ease-out both;
  animation-delay: 0.3s;
`;

const BackButton = styled.button`
  background: transparent;
  color: #2e2f5e;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  border: 1px solid rgba(46, 47, 94, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(46, 47, 94, 0.05);
    transform: translateX(-2px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ModeSelect = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 6px;
  border-radius: 14px;
  display: flex;
  gap: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
`;

const ModeButton = styled.button`
  padding: 8px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  background: ${p => p.active ? 'linear-gradient(45deg, #2e2f5e 0%, #5a5b9f 100%)' : 'transparent'};
  color: ${p => p.active ? '#fff' : '#555'};
  border: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${p => p.active ? 'linear-gradient(45deg, #2e2f5e 0%, #5a5b9f 100%)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BotAvatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(45deg, #7AC2DD, #5A8CF2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 4px 10px rgba(90, 140, 242, 0.3);
`;

const BotInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const BotName = styled.span`
  font-weight: 600;
  font-size: 16px;
`;

const BotStatus = styled.span`
  font-size: 13px;
  color: #65B741;
`;

const Layout = styled.div`
  flex: 1;
  display: flex;
  padding: 100px 40px 120px;
  box-sizing: border-box;
  overflow: hidden;
  margin-top: 0;
`;

const VideoColumn = styled.div`
  position: relative;
  top: 60px; 
  width: 45%;
  max-width: 520px;
  display: ${p => p.show ? 'block' : 'none'};
  padding-right: 30px;
  position: relative;
`;

const DemoVideo = styled.video`
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 20px;
  transition: opacity 1.2s ease-in-out;
  opacity: ${p => (p.visible ? 1 : 0)};
`;



const ChatColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  scroll-behavior: smooth;
`;

const Description = styled.div`
  margin: auto;
  text-align: center;
  max-width: 600px;
  animation: ${fadeIn} 1s ease-out forwards;
`;

const Title = styled.h1`
  font-size: 46px;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(45deg, #2e2f5e 30%, #5A8CF2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  animation: ${fadeIn} 1s ease-out forwards;
`;

const Subtitle = styled.p`
  font-size: 22px;
  color: #666;
  line-height: 1.7;
  opacity: 0;
  animation: ${fadeIn} 1s ease-out 0.5s forwards;
`;

const IntroBar = styled.div`
  margin: 0 auto 24px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.95);
  border-left: 4px solid #7AC2DD;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  font-size: 15px;
  line-height: 1.5;
  animation:
    ${fadeInDown} 0.4s ease-out,
    ${float} 4s ease-in-out 1s infinite;
  max-width: 600px;
  white-space: pre-wrap;
  text-align: center;
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
`;

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
  color: white;
  font-weight: bold;
  font-size: 10px;
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
`;

const MessageTime = styled.span`
  font-size: 11px;
  color: #999;
`;

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
  animation: ${p => keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  `} ${p => p.delay}s infinite ease-in-out;
`;

const InputArea = styled.div`
  position: fixed;
  bottom: 35px;
  /* 影像模式時 left:75% + translateX(-50%) → 對齊右半；文字模式時置中 */
  left: ${p => (p.isVideoMode ? '70%' : '50%')};
  transform: translateX(-50%);
  /* 影像模式寬度佔 50%；文字模式寬度維持 90% */
  width: ${p => (p.isVideoMode ? '50%' : '90%')};
  /* 文字模式才限制 max-width；影像模式不設上限 */
  max-width: ${p => (p.isVideoMode ? 'none' : '1440px')};
  background: ${p => (p.disabled ? 'rgba(240,240,240,0.9)' : 'rgba(255,255,255,0.95)')};
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 6px 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.05);
  z-index: 100;
  transition: all 0.3s ease;
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
  
  &::placeholder {
    color: ${p => p.disabled ? '#aaa' : '#999'};
  }
`;

const InputButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 8px;
`;

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  background: ${p => p.isRecording ? 'rgba(234, 84, 85, 0.1)' : 'transparent'};
  border-radius: 50%;
  border: none;
  color: ${p => p.isRecording ? '#EA5455' : '#888'};
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  animation: ${p => p.isRecording ? recording : 'none'} 1.5s infinite;
  opacity: ${p => p.disabled ? 0.5 : 1};
  
  &:hover {
    background: ${p => p.disabled ? 'transparent' : 'rgba(0, 0, 0, 0.05)'};
    color: ${p => p.isRecording ? '#EA5455' : '#555'};
  }
`;

const SendButton = styled.button`
  width: 48px;
  height: 48px;
  background: ${p => p.disabled ? '#ccc' : 'linear-gradient(135deg, #7AC2DD, #5A8CF2)'};
  border-radius: 50%;
  border: none;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  animation: ${p => p.active && !p.disabled ? pulse : 'none'} 1.5s infinite;
  opacity: ${p => p.disabled ? 0.7 : 1};
  
  &:hover {
    transform: ${p => p.disabled ? 'none' : 'scale(1.05)'};
    box-shadow: ${p => p.disabled ? 'none' : '0 4px 12px rgba(122, 194, 221, 0.4)'};
  }
  
  &:active {
    transform: ${p => p.disabled ? 'none' : 'scale(0.95)'};
  }
`;

// Status message component
const StatusMessage = styled.div`
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 101;
  animation: ${fadeInDown} 0.3s ease-out;
`;

const WelcomeAnimation = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 80px;
  font-weight: bold;
  color: #2b3993;
  z-index: 200;
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: opacity 0.5s ease, visibility 0.5s ease;
`;

// 新增的漸進式淡入動畫
const fadeInStagger = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px);
  }
  to { 
    opacity: 1; 
    transform: translateY(0);
  }
`;

// 優化後的 IntroTextOverlay 樣式
const IntroTextOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;  
  align-items: center;
  padding: 200px 40px 40px;            
  text-align: center;
  z-index: 200;
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s ease;
`;

// 優化後的標題樣式
const TipHeader = styled.h2`
  font-size: 38px;
  font-weight: 700;
  background: linear-gradient(45deg, #2e2f5e 30%, #5A8CF2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;            
  animation: ${fadeInStagger} 0.8s ease-out;
`;

// 新增的內容容器
const IntroContent = styled.div`
  max-width: 680px;
  width: 100%;
  padding: 32px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  animation: ${fadeInStagger} 0.8s ease-out 0.4s both;
`;

// 優化後的內容文字樣式
const IntroText = styled.p`
  font-size: 23px;
  color: #4a5568;
  line-height: 1.8;
  margin: 0;
  font-weight: 400;
  
  br {
    margin-bottom: 8px;
  }
`;

// 新增的重點文字樣式
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
  /* 只有水平位移：影像模式時往右移 70%，文字模式維持置中 */
  left: ${p => (p.isVideoMode ? '70%' : '50%')};
  transform: translateX(-50%);
  width: 90%;
  max-width: 1440px;
  font-size: 12px;
  color: #666;
  text-align: center;
  padding: 4px 8px;
  z-index: 100;
  transition: left 0.3s ease;
`;

const FallbackImage = styled.img`
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 20px;
  transition: opacity 1.2s ease-in-out;
  opacity: ${p => (p.visible ? 1 : 0)};
`;

const DemoContainer = styled.div`
  position: relative;
  width: 105%;
  height: 91vh;
  max-height: 90vh;
`;

// ===== Component =====
export default function MoodInput() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("video"); // 只保留 "text" 和 "video" 模式
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

  // 從 localStorage 抓使用者選的 AI 圖片
  const selectedBotImage = localStorage.getItem("selectedBotImage") || botTemp;
  

   // 進場動畫序列
   useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
      setShowIntroText(true);
      const introTimer = setTimeout(() => {
        setShowIntroText(false);
      }, 3000); // 新文字停留時間可調整
      return () => clearTimeout(introTimer);
    }, 1000); // Welcome 停留時間延長至 3 秒
    return () => clearTimeout(welcomeTimer);
  }, []);

  // 自動滾動到最新訊息
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (playIntroVideo && videoRef.current) {
      // 從頭開始播放
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, [playIntroVideo]);

  
  // 顯示暫時狀態訊息
  const showStatus = (message, duration = 3000) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(null), duration);
  };

  const startConversation = () => {
    const now = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    setMessages([{
      sender: "ai",
      content: `Hi Amanda❤️，你今天有什麼想聊的嗎～？`,
      timestamp: now
    }]);
    setChatStarted(true);
    if (mode === "video") setPlayIntroVideo(true);
  };

  React.useEffect(() => {
    const handleSpace = e => {
      if (e.code === 'Space' && !chatStarted) {
        e.preventDefault();
        startConversation();
      }
    };
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [chatStarted, startConversation]);

  const handleSend = async () => {
    // 1. 空字串或非錄音狀態下，阻擋送出
    if (!inputValue.trim() && !isRecording) return;
  
    // 2. 若還沒開始聊天，就先啟動開場
    if (!chatStarted) {
      startConversation();
      return;
    }

    // DEMO 階段：影像模式攔截
    if (mode === "video") {
      // 2.1 把使用者訊息先顯示
      const now = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
      setMessages(prev => [
        ...prev,
        { sender: "user", content: inputValue, timestamp: now }
      ]);
      setInputValue("");
      setInputDisabled(true);
      setIsTyping(true);

      // 2.2 切到第2支影片並播放
      setIsSecondVideo(true);
      setPlayIntroVideo(true);

      // 2.3 同步顯示你的制式回覆
      const videoStaticReply =
        "謝謝你讓我知道你的感受。為了幫助你慢慢走出低潮，我們可以從找出一個讓你感覺好一點的方法開始，妳願意和我一起試試看嗎？";
      setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
        setMessages(prev => [
          ...prev,
          { sender: "ai", content: videoStaticReply, timestamp: replyTime }
        ]);
        setIsTyping(false);
        setInputDisabled(false);
      }, 1000);  // 打字延遲 1 秒，可自行調整

      return;
    }
  
    // 3. DEMO 階段：文字模式下，跳過真正的 API 呼叫，直接回固定訊息
    if (mode === "text") {
      // 3.1. 把使用者的輸入先顯示出來
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        { sender: "user", content: inputValue, timestamp: now }
      ]);
      // 3.2. 清空輸入欄並鎖住，呈現「正在輸入」動畫
      setInputValue("");
      setInputDisabled(true);
      setIsTyping(true);
  
      // 3.3. 你的制式回覆文字
      const staticReply = 
      `Amanda，願意說出這樣的感受，其實需要很大的勇氣。
我感受到你現在可能真的很辛苦，而你已經很勇敢了。
雖然我無法取代真正的心理專業人員，但我會一直在這裡陪著你。
同時，也想邀請你，試著走向真正能幫助你的出口。
以下這些資源，或許能在你需要時，提供一些支持 💡：
🧭 政大身心健康中心諮商預約系統（點此進入網址）
📞 校安中心 24 小時專線：0919-099-119
🌱 生命線：1995
🧡 張老師專線：1980
☎️ 安心專線（衛福部）：1925`;
  
      // 3.4. 模擬打字延遲，然後顯示 AI 回覆
      setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [
          ...prev,
          { sender: "ai", content: staticReply, timestamp: replyTime }
        ]);
        setIsTyping(false);
        setInputDisabled(false);
      }, 800);
  
      // 3.5. 結束函式，不進入後面的 API 或錄音處理
      return;
    }

    // 如果正在錄音,則停止錄音並處理
    if (isRecording) {
      setIsRecording(false);
      const now = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      setMessages(prev => [...prev, { 
        sender: "user", 
        content: "[語音訊息]", 
        timestamp: now 
      }]);
      setInputDisabled(true);
      setIsTyping(true);
      
      // 模擬處理語音訊息
      setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        setMessages(prev => [...prev, { 
          sender: "ai", 
          content: "我收到你的語音訊息了！請問你今天感覺怎麼樣？", 
          timestamp: replyTime 
        }]);
        setIsTyping(false);
        setInputDisabled(false);
      }, 2000);
      
      return;
    }

    // 文字訊息處理
    const now = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    setMessages(prev => [...prev, { sender: "user", content: inputValue, timestamp: now }]);
    const userMsg = inputValue;
    setInputValue("");
    setInputDisabled(true);
    setIsTyping(true);

    try {
      // 模擬API請求延遲
      setTimeout(async () => {
        try {
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer YOUR_API_KEY`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                { role: "system", content: "你是一位溫柔的心理諮商 AI 夥伴，用支持的語氣回覆。" },
                ...messages.map(m => ({
                  role: m.sender === "user" ? "user" : "assistant",
                  content: m.content
                })),
                { role: "user", content: userMsg }
              ]
            }),
          });
          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content || "我收到你的訊息囉！";
          const replyTime = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
          setMessages(prev => [...prev, { sender: "ai", content: reply, timestamp: replyTime }]);
        } catch (err) {
          console.error(err);
          const errTime = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
          setMessages(prev => [...prev, { 
            sender: "ai", 
            content: "抱歉，系統忙碌中，請稍後再試。", 
            timestamp: errTime 
          }]);
        } finally {
          setIsTyping(false);
          setInputDisabled(false);
        }
      }, 1000); // 模擬API延遲
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setInputDisabled(false);
    }
  };

  // 處理語音按鈕
  const handleVoiceButton = () => {
    if (inputDisabled) return;
    
    if (isRecording) {
      // 停止錄音
      setIsRecording(false);
      showStatus("語音錄製已停止");
      handleSend(); // 發送錄製的語音
    } else {
      // 開始錄音
      setIsRecording(true);
      showStatus("正在錄製語音... 再次點擊結束錄製");
      
      // 在真實場景這裡會請求麥克風權限和開始錄音
      navigator.mediaDevices?.getUserMedia?.({ audio: true })
        .then(stream => {
          // 這裡會連接實際的錄音功能
          console.log("錄音已開始", stream);
        })
        .catch(err => {
          console.error("無法取得麥克風權限:", err);
          setIsRecording(false);
          showStatus("無法取得麥克風權限");
        });
    }
  };

  // 取得今天日期
  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  

  return (
    <Container>
      <WelcomeAnimation visible={showWelcome}>Welcome Emobot+</WelcomeAnimation>
      <IntroTextOverlay visible={showIntroText}>

        <TipHeader>溫馨提示</TipHeader>
        <IntroContent>
          <IntroText>
            當你結束這段對話時，<br/>
            系統會詢問你是否願意分享今天的聊天內容。<br/>
            只有在你同意的情況下，<br/>
            這些紀錄才會提供給校方的心理專業人員，<br/>
            協助你獲得更適切的支持與關懷，<br/>
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
              <BotName>Niko AI</BotName>
              <BotStatus>在線上</BotStatus>
            </BotInfo>
            <BotAvatar>N</BotAvatar>
          </AvatarContainer>
        )}
      </Header>

      <Layout>
        {/* 影像模式：永遠保留 VideoColumn */}
        {mode === "video" && (
          <VideoColumn show={true}>
            <DemoContainer>
              {/* 靜態 avatar，當 playIntroVideo = false 顯示 */}
              <FallbackImage src={botTemp} visible={!playIntroVideo} />
              {/* 影片，透過 useEffect(playIntroVideo) 來 .play() */}
              <DemoVideo
                ref={videoRef}
                src={isSecondVideo ? secondVideo : introVideo}
                visible={playIntroVideo}
                onEnded={() => {
                  setPlayIntroVideo(false);
                  videoRef.current.pause();
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
                <Subtitle>
                  Niko — 您的心靈探索夥伴<br/>
                  是一個協助你深入挖掘、自我探索內心的夥伴。
                </Subtitle>
              </Description>
            </FadeWrapper>
          ) : (
            <>
              <IntroBar>
                Niko — 您的心靈探索夥伴，<br/>
                是一個協助你深入挖掘、自我探索內心的夥伴。
              </IntroBar>
              
              <DateDivider>
                <DateLabel>{today}</DateLabel>
              </DateDivider>
              
              <ChatBox ref={chatBoxRef}>
                {messages.map((m, i) => (
                  <BubbleWrapper key={i} sender={m.sender}>
                    <BubbleHeader>
                      <SenderAvatar sender={m.sender}>
                        {m.sender === "user" ? "A" : "N"}
                      </SenderAvatar>
                      {m.sender === "user" ? "Amanda" : "Niko AI"} 
                      <MessageTime>{m.timestamp}</MessageTime>
                    </BubbleHeader>
                    <ChatBubble sender={m.sender}>{m.content}</ChatBubble>
                  </BubbleWrapper>
                ))}
                {isTyping && (
                  <BubbleWrapper sender="ai">
                    <BubbleHeader>
                      <SenderAvatar sender="ai">N</SenderAvatar>
                      Niko AI 正在輸入...
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

        <InputArea
          disabled={inputDisabled}
          isVideoMode={mode === "video"}   // 新增這個 prop 判斷模式
        >
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