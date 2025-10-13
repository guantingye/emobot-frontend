// src/components/MatchResult.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FiX } from "react-icons/fi";
import { BsClipboard2Data, BsClipboard2Pulse } from "react-icons/bs";
import { TiLightbulb } from "react-icons/ti";
import { TbTargetArrow } from "react-icons/tb";
import { PiHandHeartDuotone } from "react-icons/pi";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import userIcon from "../assets/profile.png";
import bot1 from "../assets/bot1.png";
import bot2 from "../assets/bot2.png";
import bot6 from "../assets/bot6.png";
import bot4 from "../assets/bot4.png";
import logoIcon from "../assets/logofig.png";
import { runMatching, commitChoice, apiGetMyAssessment } from "../api/client";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalFadeIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const overlayFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: #e8e8e8;
  font-family: "Noto Sans TC", sans-serif;
`;

const Header = styled.header`
  width: 100%;
  height: 70px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 20px rgba(43, 57, 147, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(43, 57, 147, 0.1);

  @media (max-width: 768px) {
    height: 60px;
    padding: 0 16px;
  }
`;

const Logo = styled.div`
  font-size: 35px;
  font-weight: bold;
  color: #2b3993;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    color: #1e2a6b;
  }

  img {
    height: 68px;
    margin-right: 8px;
  }

  @media (max-width: 768px) {
    font-size: 24px;
    img {
      height: 48px;
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 40px;
  font-size: 26px;
  font-weight: bold;
  color: black;

  div {
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    padding: 8px 0;

    &:hover {
      color: #2b3993;
      transform: translateY(-2px);
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #2b3993, #667eea);
      transition: width 0.3s ease;
    }

    &:hover::after {
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    gap: 16px;
    font-size: 16px;
  }
`;

const AvatarImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(43, 57, 147, 0.1);

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 8px 20px rgba(43, 57, 147, 0.2);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  margin-left: auto;
  margin-right: 40px;

  @media (max-width: 768px) {
    gap: 16px;
    margin-right: 0;
  }
`;

const Main = styled.div`
  max-width: 1000px;
  margin: 60px auto;
  padding: 60px;
  background: white;
  border-radius: 24px;
  text-align: center;
  animation: ${fadeInUp} 0.8s ease-out;
  position: relative;

  @media (max-width: 768px) {
    margin: 20px 16px;
    padding: 32px 20px;
  }
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 40px;
  color: #444;

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 24px;
  }
`;

const Cards = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 48px;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
`;

const BotCard = styled.div`
  position: relative;
  width: 220px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  img {
    width: 100%;
    border-radius: 20px;
    border: ${({selected}) => selected ? "5px solid #2b3993" : "3px solid transparent"};
    opacity: ${({selected}) => selected ? "1" : "0.6"};
    box-shadow: ${({selected}) => selected ? "0 0 12px rgba(43,57,147,0.6)" : "none"};
    transition: all 0.3s ease;
  }
  
  span {
    display: block;
    margin-top: 10px;
    font-size: 20px;
    font-weight: bold;
    color: #333;
  }
  
  &:hover {
    transform: scale(1.05);
    
    img {
      opacity: 1;
      border-color: ${({selected}) => selected ? "#2b3993" : "#bbb"};
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    
    span {
      font-size: 18px;
    }
  }
`;

const ConfirmButton = styled.button`
  font-size: 22px;
  font-weight: bold;
  padding: 14px 36px;
  border: 3px solid #3f3e66;
  border-radius: 999px;
  background-color: rgba(30,31,19,.8);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(.95);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    font-size: 18px;
    padding: 12px 28px;
    width: 100%;
    max-width: 280px;
  }
`;

const RateText = styled.span`
  display: block;
  margin-top: 6px;
  font-size: 16px;
  color: #666;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const HintBox = styled.div`
  max-width: 720px;
  margin: 0 auto 24px;
  padding: 14px 20px;
  background: #fff8e1;
  border: 1px solid #ffecb3;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,.05);
  font-size: 15px;
  color: #5d4037;
  text-align: center;
  line-height: 1.6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px 16px;
  }
`;

const TestResultButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #2b3993 0%, #667eea 100%);
  color: white;
  border: none;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(43, 57, 147, 0.3);
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(43, 57, 147, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: wait;
    background: linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%);
  }

  svg {
    font-size: 18px;
  }

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    padding: 10px 20px;
    font-size: 14px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: ${overlayFadeIn} 0.3s ease-out;
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 1200px;
  max-height: 88vh;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  animation: ${modalFadeIn} 0.4s ease-out;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 95%;
    max-height: 92vh;
    border-radius: 16px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 36px;
  border-bottom: 2px solid #e7e7ef;
  background: linear-gradient(135deg, rgba(43, 57, 147, 0.05) 0%, rgba(248, 250, 252, 0.95) 100%);

  @media (max-width: 768px) {
    padding: 20px 24px;
  }
`;

const ModalTitle = styled.div`
  font-size: 26px;
  font-weight: 800;
  color: #2b3993;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    font-size: 28px;
  }

  @media (max-width: 768px) {
    font-size: 20px;
    
    svg {
      font-size: 24px;
    }
  }
`;

const CloseButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(43, 57, 147, 0.1);
  color: #2b3993;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(43, 57, 147, 0.2);
    transform: rotate(90deg);
  }

  svg {
    font-size: 22px;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 36px;
  background: #fafbfc;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f3f5;
    border-radius: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #2b3993, #667eea);
    border-radius: 5px;

    &:hover {
      background: linear-gradient(135deg, #1e2a6b, #5568d3);
    }
  }

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  margin-bottom: 28px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const DashboardCard = styled.div`
  background: white;
  border: 1px solid #e1e4e8;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(43, 57, 147, 0.12);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: 800;
  color: #2b3993;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e7e7ef;

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 20px;
    padding-bottom: 12px;
  }
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 360px;
  margin-top: 16px;
  padding: 8px;

  @media (max-width: 768px) {
    height: 300px;
  }
`;

const MBTIDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 32px 20px;
  background: linear-gradient(135deg, rgba(43, 57, 147, 0.08) 0%, rgba(102, 126, 234, 0.08) 100%);
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: inset 0 2px 8px rgba(43, 57, 147, 0.1);

  @media (max-width: 768px) {
    padding: 24px 16px;
    gap: 4px;
  }
`;

const MBTILetter = styled.div`
  text-align: center;
  padding: 12px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(43, 57, 147, 0.15);
  transition: all 0.3s ease;
  min-width: 80px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(43, 57, 147, 0.25);
  }

  .letter {
    font-size: 52px;
    font-weight: 900;
    color: #2b3993;
    text-shadow: 2px 2px 4px rgba(43, 57, 147, 0.2);
    line-height: 1;
  }

  .label {
    font-size: 13px;
    color: #666;
    margin-top: 8px;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    min-width: 60px;

    .letter {
      font-size: 40px;
    }

    .label {
      font-size: 11px;
      margin-top: 4px;
    }
  }
`;

const InfoText = styled.p`
  font-size: 15px;
  color: #555;
  line-height: 1.8;
  text-align: center;
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(43, 57, 147, 0.03);
  border-radius: 8px;
  font-weight: 500;

  strong {
    color: #2b3993;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px 12px;
  }
`;

const DimensionComparison = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 20px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const DimensionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${props => props.selected ? 'linear-gradient(135deg, rgba(43, 57, 147, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)' : 'rgba(0, 0, 0, 0.02)'};
  border: 2px solid ${props => props.selected ? '#2b3993' : 'transparent'};
  border-radius: 10px;
  transition: all 0.3s ease;

  .dim-label {
    font-size: 14px;
    font-weight: ${props => props.selected ? '700' : '600'};
    color: ${props => props.selected ? '#2b3993' : '#666'};
  }

  .dim-value {
    font-size: 16px;
    font-weight: 800;
    color: ${props => props.selected ? '#2b3993' : '#999'};
  }

  &:hover {
    background: ${props => props.selected ? 'linear-gradient(135deg, rgba(43, 57, 147, 0.15) 0%, rgba(102, 126, 234, 0.15) 100%)' : 'rgba(0, 0, 0, 0.04)'};
  }

  @media (max-width: 768px) {
    padding: 10px 12px;

    .dim-label {
      font-size: 12px;
    }

    .dim-value {
      font-size: 14px;
    }
  }
`;

const NoDataText = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 40px 16px;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #2b3993;
  font-size: 18px;
  font-weight: 600;

  &::after {
    content: '...';
    animation: ${shimmer} 1.5s linear infinite;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 40px 16px;
  }
`;

const ScoreDisplay = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(43, 57, 147, 0.05) 0%, rgba(248, 250, 252, 0.8) 100%);
  border-radius: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
`;

const ScoreItem = styled.div`
  text-align: center;

  .label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    font-weight: 600;
  }

  .value {
    font-size: 28px;
    font-weight: 800;
    color: ${props => props.color || '#2b3993'};
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    .label {
      font-size: 13px;
    }

    .value {
      font-size: 24px;
    }
  }
`;

export default function MatchResult() {
  const navigate = useNavigate();
  const [selectedBot, setSelectedBot] = useState(null);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

  const bots = [
    { id: 1, name: "同理型 AI", img: bot1, type: "empathy" },
    { id: 2, name: "洞察型 AI", img: bot2, type: "insight" },
    { id: 3, name: "解決型 AI", img: bot6, type: "solution" },
    { id: 4, name: "認知型 AI", img: bot4, type: "cognitive" },
  ];
  const typeToBotId = { empathy: 1, insight: 2, solution: 3, cognitive: 4 };
  const botIdToType = { 1: "empathy", 2: "insight", 3: "solution", 4: "cognitive" };

  const handleSelect = (id) => setSelectedBot(prev => (prev === id ? null : id));

  const handleSubmit = async () => {
    if (!selectedBot) return alert("請先選擇一位 AI 夥伴!");
    setLoading(true);
    try {
      const botType = botIdToType[selectedBot];
      await commitChoice(botType);

      const selectedBotData = bots.find((b) => b.id === selectedBot);
      localStorage.setItem("selectedBotId", String(selectedBot));
      localStorage.setItem("selectedBotImage", selectedBotData.img);
      localStorage.setItem("selectedBotName", selectedBotData.name);
      localStorage.setItem("selectedBotType", botType);

      navigate("/dashboard");
    } catch (err) {
      console.error("Submit failed:", err);
      alert(`選擇失敗:${err?.message || "請稍後再試"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTestResult = async () => {
    setLoadingModal(true);
    try {
      const result = await apiGetMyAssessment();
      if (result.assessment) {
        setAssessmentData(result.assessment);
        setShowModal(true);
      } else {
        alert("尚無測驗資料");
      }
    } catch (err) {
      console.error("載入測驗資料失敗:", err);
      alert("載入失敗,請稍後再試");
    } finally {
      setLoadingModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setAssessmentData(null);
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  useEffect(() => {
    const cached = localStorage.getItem("match.recommend");
    const loadData = async () => {
      try {
        let data;
        if (cached) {
          data = JSON.parse(cached);
        } else {
          data = await runMatching();
          localStorage.setItem("match.recommend", JSON.stringify(data));
        }

        const r = {};
        if (Array.isArray(data?.ranked) && data.ranked.length) {
          data.ranked.forEach(({ type, score }) => {
            const id = typeToBotId[type];
            if (id) r[id] = Number(score);
          });
        } else if (data?.scores) {
          const s = data.scores;
          const vals = Object.values(s);
          const max = Math.max(...vals, 1e-9);
          Object.keys(s).forEach((type) => {
            const id = typeToBotId[type];
            if (id) r[id] = Number((s[type] / max) * 100.0);
          });
        }

        setRates(r);

        const ids = Object.keys(r);
        if (ids.length > 0) {
          const bestId = ids.reduce((a, b) => (r[a] > r[b] ? a : b));
          setSelectedBot(parseInt(bestId, 10));
        }
      } catch (e) {
        console.warn("Load recommendation failed:", e);
        navigate("/test/step5");
      }
    };
    loadData();
  }, []);

  const calculateScores = (assessment) => {
    if (!assessment) return null;

    const safeList = (values, n, fill) => {
      const arr = values || [];
      const out = [];
      for (let i = 0; i < n; i++) {
        try {
          out.push(arr[i] !== undefined ? parseFloat(arr[i]) : fill);
        } catch {
          out.push(fill);
        }
      }
      return out;
    };

    const mean = (xs) => xs.length > 0 ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;

    const scale01 = (x, lo, hi) => {
      if (hi <= lo) return 0;
      const v = (x - lo) / (hi - lo);
      return v < 0 ? 0 : v > 1 ? 1 : v;
    };

    const normList = (vals, lo, hi, revIdx) => {
      return vals.map((x, i) => {
        let v = scale01(x, lo, hi);
        if (revIdx.includes(i)) v = 1.0 - v;
        return v;
      });
    };

    const mbtiEncoded = assessment.mbti_encoded || [0.5, 0.5, 0.5, 0.5];
    const [e, n, t, p] = mbtiEncoded.map(v => parseFloat(v));

    const mbti = {
      E: e, I: 1 - e,
      N: n, S: 1 - n,
      T: t, F: 1 - t,
      P: p, J: 1 - p
    };

    const dersRev = [0, 2, 4];
    const dersRaw = safeList(assessment.step3_answers, 18, 3.0);
    const dersN5 = normList(dersRaw, 1.0, 5.0, dersRev);
    
    const awarenessItems = [0, 3, 5].map(i => dersN5[i]);
    const clarityItems = [1, 2, 4].map(i => dersN5[i]);
    const goalsItems = [7, 11, 14].map(i => dersN5[i]);
    const impulseItems = [8, 15, 17].map(i => dersN5[i]);
    const nonAcceptanceItems = [6, 12, 13].map(i => dersN5[i]);
    const strategiesItems = [9, 10, 16].map(i => dersN5[i]);

    const ders = {
      awareness: mean(awarenessItems),
      clarity: mean(clarityItems),
      goals: mean(goalsItems),
      impulse: mean(impulseItems),
      nonAcceptance: mean(nonAcceptanceItems),
      strategies: mean(strategiesItems),
      overall: mean(dersN5)
    };

    const aasRev = [12, 15];  // 根據附圖修正: 13, 16 題 (0-based: 12, 15)
    const aasRaw = safeList(assessment.step2_answers, 24, 3.0);
    const aasN6 = normList(aasRaw, 1.0, 6.0, aasRev);
    const avoid = mean(aasN6.slice(0, 8));
    const mid = mean(aasN6.slice(8, 16));
    const anx = mean(aasN6.slice(16, 24));
    const insecure = (avoid + anx) / 2.0;
    const aas = {
      avoid,
      anx,
      secure: Math.max(0, 1.0 - insecure),
      mid
    };

    const bpnsRev = [3, 10, 19, 2, 14, 18, 6, 15, 17];  // 根據附圖修正: 4,11,20,3,15,19,7,16,18 (0-based)
    const bpnsRaw = safeList(assessment.step4_answers, 21, 4.0);
    const bpnsN7 = normList(bpnsRaw, 1.0, 7.0, bpnsRev);
    const bpns = {
      autonomy: mean(bpnsN7.slice(0, 7)),      // 題1-7
      competence: mean(bpnsN7.slice(7, 14)),   // 題8-14
      relatedness: mean(bpnsN7.slice(14, 21))  // 題15-21
    };

    return { mbti, ders, aas, bpns };
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          padding: '12px 16px',
          border: '2px solid #2b3993',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#2b3993', fontSize: '14px' }}>
            {payload[0].payload.name || payload[0].name}
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>
            分數: <strong style={{ color: '#2b3993' }}>{payload[0].value.toFixed(1)}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderDashboard = () => {
    const scores = calculateScores(assessmentData);
    if (!scores) {
      return <NoDataText>無法計算測驗分數</NoDataText>;
    }

    const { mbti, ders, aas, bpns } = scores;

    const mbtiType = 
      (mbti.E > mbti.I ? 'E' : 'I') +
      (mbti.N > mbti.S ? 'N' : 'S') +
      (mbti.T > mbti.F ? 'T' : 'F') +
      (mbti.P > mbti.J ? 'P' : 'J');

    const mbtiLabels = {
      E: '外向', I: '內向',
      N: '直覺', S: '實感',
      T: '思考', F: '情感',
      P: '感知', J: '判斷'
    };

    const dersData = [
      { name: 'Awareness\n覺察困難', value: Math.round(ders.awareness * 100), fullMark: 100 },
      { name: 'Clarity\n清晰困難', value: Math.round(ders.clarity * 100), fullMark: 100 },
      { name: 'Goals\n目標困難', value: Math.round(ders.goals * 100), fullMark: 100 },
      { name: 'Impulse\n衝動困難', value: Math.round(ders.impulse * 100), fullMark: 100 },
      { name: 'Non-acceptance\n不接納', value: Math.round(ders.nonAcceptance * 100), fullMark: 100 },
      { name: 'Strategies\n策略缺乏', value: Math.round(ders.strategies * 100), fullMark: 100 }
    ];

    const aasData = [
      { name: '迴避依附', value: Math.round(aas.avoid * 100), color: '#FF8FB1' },
      { name: '焦慮依附', value: Math.round(aas.anx * 100), color: '#FFBE98' },
      { name: '安全依附', value: Math.round(aas.secure * 100), color: '#94D7A2' }
    ];

    const bpnsData = [
      { name: '自主性', value: Math.round(bpns.autonomy * 100), fullMark: 100 },
      { name: '關係感', value: Math.round(bpns.relatedness * 100), fullMark: 100 },
      { name: '勝任感', value: Math.round(bpns.competence * 100), fullMark: 100 }
    ];

    return (
      <>
        <DashboardGrid>
          <DashboardCard>
            <CardTitle><TbTargetArrow /> MBTI 人格類型</CardTitle>
            <MBTIDisplay>
              <MBTILetter>
                <div className="letter">{mbtiType[0]}</div>
                <div className="label">{mbtiLabels[mbtiType[0]]}</div>
              </MBTILetter>
              <MBTILetter>
                <div className="letter">{mbtiType[1]}</div>
                <div className="label">{mbtiLabels[mbtiType[1]]}</div>
              </MBTILetter>
              <MBTILetter>
                <div className="letter">{mbtiType[2]}</div>
                <div className="label">{mbtiLabels[mbtiType[2]]}</div>
              </MBTILetter>
              <MBTILetter>
                <div className="letter">{mbtiType[3]}</div>
                <div className="label">{mbtiLabels[mbtiType[3]]}</div>
              </MBTILetter>
            </MBTIDisplay>
            <InfoText>
              您的人格類型為 <strong>{mbtiType}</strong>
            </InfoText>
            <DimensionComparison>
              <DimensionItem selected={mbti.E > mbti.I}>
                <span className="dim-label">外向 E</span>
                <span className="dim-value">{mbti.E > mbti.I ? '✓' : ''}</span>
              </DimensionItem>
              <DimensionItem selected={mbti.I >= mbti.E}>
                <span className="dim-label">內向 I</span>
                <span className="dim-value">{mbti.I >= mbti.E ? '✓' : ''}</span>
              </DimensionItem>
              <DimensionItem selected={mbti.N > mbti.S}>
                <span className="dim-label">直覺 N</span>
                <span className="dim-value">{mbti.N > mbti.S ? '✓' : ''}</span>
              </DimensionItem>
              <DimensionItem selected={mbti.S >= mbti.N}>
                <span className="dim-label">實感 S</span>
                <span className="dim-value">{mbti.S >= mbti.N ? '✓' : ''}</span>
              </DimensionItem>
              <DimensionItem selected={mbti.T > mbti.F}>
                <span className="dim-label">思考 T</span>
                <span className="dim-value">{mbti.T > mbti.F ? '✓' : ''}</span>
              </DimensionItem>
              <DimensionItem selected={mbti.F >= mbti.T}>
                <span className="dim-label">情感 F</span>
                <span className="dim-value">{mbti.F >= mbti.T ? '✓' : ''}</span>
              </DimensionItem>
              <DimensionItem selected={mbti.P > mbti.J}>
                <span className="dim-label">感知 P</span>
                <span className="dim-value">{mbti.P > mbti.J ? '✓' : ''}</span>
              </DimensionItem>
              <DimensionItem selected={mbti.J >= mbti.P}>
                <span className="dim-label">判斷 J</span>
                <span className="dim-value">{mbti.J >= mbti.P ? '✓' : ''}</span>
              </DimensionItem>
            </DimensionComparison>
          </DashboardCard>

          <DashboardCard>
            <CardTitle><PiHandHeartDuotone /> 依附風格分析</CardTitle>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aasData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    style={{ fontSize: '13px', fontWeight: '600', fill: '#555' }}
                    tick={{ fill: '#555' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    style={{ fontSize: '12px', fontWeight: '600' }}
                    tick={{ fill: '#555' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} maxBarSize={80}>
                    {aasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <ScoreDisplay>
              <ScoreItem color="#FF8FB1">
                <div className="label">迴避依附</div>
                <div className="value">{Math.round(aas.avoid * 100)}</div>
              </ScoreItem>
              <ScoreItem color="#FFBE98">
                <div className="label">焦慮依附</div>
                <div className="value">{Math.round(aas.anx * 100)}</div>
              </ScoreItem>
              <ScoreItem color="#94D7A2">
                <div className="label">安全依附</div>
                <div className="value">{Math.round(aas.secure * 100)}</div>
              </ScoreItem>
            </ScoreDisplay>
          </DashboardCard>

          <DashboardCard>
            <CardTitle><BsClipboard2Pulse /> 情緒調節困難量表</CardTitle>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dersData} margin={{ top: 30, right: 40, bottom: 30, left: 40 }}>
                  <PolarGrid stroke="#d8dce6" strokeWidth={1.5} />
                  <PolarAngleAxis 
                    dataKey="name" 
                    tick={{ 
                      fill: '#555', 
                      fontSize: 11, 
                      fontWeight: 600 
                    }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fill: '#999', fontSize: 10 }}
                  />
                  <Radar 
                    name="DERS" 
                    dataKey="value" 
                    stroke="#8b9aed" 
                    fill="#b8c5f5" 
                    fillOpacity={0.55}
                    strokeWidth={2.5}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <InfoText>
              整體困難度: <strong>{Math.round(ders.overall * 100)} 分</strong><br/>
              (分數越高表示該面向的調節困難程度越高)
            </InfoText>
          </DashboardCard>

          <DashboardCard>
            <CardTitle><TiLightbulb /> 基本心理需求滿足量表</CardTitle>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={bpnsData} margin={{ top: 30, right: 40, bottom: 30, left: 40 }}>
                  <PolarGrid stroke="#d8dce6" strokeWidth={1.5} />
                  <PolarAngleAxis 
                    dataKey="name" 
                    tick={{ 
                      fill: '#555', 
                      fontSize: 12, 
                      fontWeight: 600 
                    }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fill: '#999', fontSize: 10 }}
                  />
                  <Radar 
                    name="需求滿足" 
                    dataKey="value" 
                    stroke="#2b3993" 
                    fill="#7a8dd8" 
                    fillOpacity={0.55}
                    strokeWidth={2.5}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <ScoreDisplay>
              <ScoreItem color="#2b3993">
                <div className="label">自主性</div>
                <div className="value">{Math.round(bpns.autonomy * 100)}</div>
              </ScoreItem>
              <ScoreItem color="#667eea">
                <div className="label">關係感</div>
                <div className="value">{Math.round(bpns.relatedness * 100)}</div>
              </ScoreItem>
              <ScoreItem color="#8b9aed">
                <div className="label">勝任感</div>
                <div className="value">{Math.round(bpns.competence * 100)}</div>
              </ScoreItem>
            </ScoreDisplay>
          </DashboardCard>
        </DashboardGrid>
      </>
    );
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
            <div onClick={() => navigate("/Home#robots")}>機器人介紹</div>
            <div onClick={() => navigate("/Home", { state: { scrollTo: "about" } })}>關於我們</div>
          </Nav>
          <AvatarImg src={userIcon} alt="user avatar" onClick={() => navigate("/profile")} />
        </RightSection>
      </Header>

      <Main>
        <Title>
          我們根據心理測驗結果,提供您與每位 AI 夥伴的適合程度。<br/>
          您可以自由選擇最想開始對話的一位。
        </Title>

        <Cards>
          {bots.map((bot) => (
            <BotCard key={bot.id} selected={selectedBot === bot.id} onClick={() => handleSelect(bot.id)}>
              <img src={bot.img} alt={bot.name} />
              <span>{bot.name}</span>
              {rates[bot.id] != null && <RateText>媒合分數:{Number(rates[bot.id]).toFixed(1)}</RateText>}
            </BotCard>
          ))}
        </Cards>

        <HintBox>提醒您 系統目前處於測試階段,AI 夥伴為首次選擇固定;欲更換需重新進行心理測驗。</HintBox>

        <ConfirmButton onClick={handleSubmit} disabled={loading}>
          {loading ? "處理中..." : "選擇完畢"}
        </ConfirmButton>

        <TestResultButton onClick={handleOpenTestResult} disabled={loadingModal}>
          <BsClipboard2Data />
          {loadingModal ? "請稍等" : "測驗結果"}
        </TestResultButton>
      </Main>

      {showModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <BsClipboard2Data />
                心理測驗結果 - 嘗試更了解自己！
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            <ModalContent>
              {assessmentData ? renderDashboard() : <LoadingText>載入中</LoadingText>}
            </ModalContent>
          </ModalContainer>
        </ModalOverlay>
      )}
    </Container>
  );
}