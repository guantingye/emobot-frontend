// src/components/MatchResult.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import userIcon from "../assets/profile.png";
import bot1 from "../assets/bot1.png";
import bot2 from "../assets/bot2.png";
import bot6 from "../assets/bot6.png";
import bot4 from "../assets/bot4.png";
import logoIcon from "../assets/logofig.png";
import { runMatching, commitChoice } from "../api/client";

// 動畫 & 版面（沿用）
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
    box-shadow: 0 2px 12px rgba(43, 57, 147, 0.06);
  }

  @media (max-width: 480px) {
    height: 55px;
    padding: 0 12px;
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
  text-shadow: 0 2px 4px rgba(43, 57, 147, 0.1);

  &:hover {
    transform: scale(1.05);
    color: #1e2a6b;
  }

  img {
    height: 68px;
    margin-right: 8px;
    filter: drop-shadow(0 2px 4px rgba(43, 57, 147, 0.1));
  }

  @media (max-width: 768px) {
    font-size: 24px;
    
    img {
      height: 48px;
      margin-right: 6px;
    }
  }

  @media (max-width: 480px) {
    font-size: 20px;
    
    img {
      height: 40px;
      margin-right: 4px;
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

    &:active {
      transform: translateY(1px);
    }

    &:hover::after {
      width: 100%;
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
  }

  @media (max-width: 900px) {
    gap: 20px;
    font-size: 20px;
  }

  @media (max-width: 768px) {
    gap: 16px;
    font-size: 16px;
  }

  @media (max-width: 480px) {
    display: none;
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
  box-shadow: 0 4px 12px rgba(43, 57, 147, 0.1);

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 8px 20px rgba(43, 57, 147, 0.2);
    border-color: rgba(43, 57, 147, 0.3);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
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

  @media (max-width: 480px) {
    gap: 12px;
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

  @media (max-width: 768px) {
    margin: 20px 16px;
    padding: 32px 20px;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    margin: 16px 12px;
    padding: 24px 16px;
    border-radius: 12px;
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
    line-height: 1.5;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 20px;
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
    margin-bottom: 32px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
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
      margin-top: 8px;
    }
    
    &:hover {
      transform: scale(1.02);
    }
  }

  @media (max-width: 480px) {
    span {
      font-size: 16px;
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

  @media (max-width: 480px) {
    font-size: 16px;
    padding: 12px 24px;
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

  @media (max-width: 480px) {
    font-size: 13px;
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
    margin: 0 auto 20px;
    padding: 12px 16px;
    font-size: 14px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
    padding: 10px 12px;
    margin: 0 auto 16px;
  }
`;

export default function MatchResult() {
  const navigate = useNavigate();
  const [selectedBot, setSelectedBot] = useState(null);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(false);

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
    if (!selectedBot) return alert("請先選擇一位 AI 夥伴！");
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
      alert(`選擇失敗：${err?.message || "請稍後再試"}`);
    } finally {
      setLoading(false);
    }
  };

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
          我們根據心理測驗結果，提供你與每位 AI 夥伴的適合程度。<br/>
          你可以自由選擇最想開始對話的一位。
        </Title>

        <Cards>
          {bots.map((bot) => (
            <BotCard key={bot.id} selected={selectedBot === bot.id} onClick={() => handleSelect(bot.id)}>
              <img src={bot.img} alt={bot.name} />
              <span>{bot.name}</span>
              {rates[bot.id] != null && <RateText>媒合分數：{Number(rates[bot.id]).toFixed(1)}</RateText>}
            </BotCard>
          ))}
        </Cards>

        <HintBox>提醒您 系統目前處於測試階段，AI 夥伴為首次選擇固定；欲更換需重新進行心理測驗。</HintBox>

        <ConfirmButton onClick={handleSubmit} disabled={loading}>
          {loading ? "處理中..." : "選擇完畢"}
        </ConfirmButton>
      </Main>
    </Container>
  );
}