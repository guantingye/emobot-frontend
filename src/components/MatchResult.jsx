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
const fadeInUp = keyframes`from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}`;
const Container = styled.div`
  width:100%;
  min-height:100dvh;
  background:#e8e8e8;
  font-family:"Noto Sans TC",sans-serif;
`;
const Header = styled.header`
  width:100%;
  height:70px;
  background:white;
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:0 30px;
  position:sticky; top:0; z-index:10;
  box-shadow:0 2px 10px rgba(0,0,0,0.1);
  @media (max-width: 1024px){ padding: 0 16px; height:64px; }
`;
const Logo = styled.div`
  font-size:35px;font-weight:bold;color:#2b3993;display:flex;align-items:center;cursor:pointer;transition:.3s;
  &:hover{transform:scale(1.05)}
  img{ height:68px; margin-right:8px; }
  @media (max-width: 480px){ font-size: 28px; img{height:54px;} }
`;
const Nav = styled.nav`
  display:flex; gap:40px; font-size:26px; font-weight:bold; color:black;
  div{cursor:pointer; transition:.2s;
    &:hover{color:#2b3993; transform:translateY(-2px)}
    &:active{transform:translateY(1px)}
  }
  @media (max-width: 1024px){ gap:20px; font-size:18px; }
  @media (max-width: 640px){ display:none; } /* 交給 GlobalStyle 同策略 */
`;
const AvatarImg = styled.img`
  width:50px;height:50px;border-radius:50%;object-fit:cover;cursor:pointer;transition:.3s;
  &:hover{transform:scale(1.1); box-shadow:0 4px 8px rgba(0,0,0,0.2)}
`;
const RightSection = styled.div`
  display:flex; align-items:center; gap:30px; margin-right: 10px;
  @media (max-width: 1024px){ gap:16px; }
`;
const Main = styled.div`
  max-width:1000px; width: 92%;
  margin:24px auto 60px;
  padding: clamp(16px, 3vw, 60px);
  background:white;border-radius:24px;text-align:center;animation:${fadeInUp} .8s ease-out;
  @media (max-width: 640px){ border-radius:18px; }
`;
const Title = styled.h2`
  font-size:clamp(18px, 2.4vw, 22px);
  font-weight:bold;margin-bottom:28px;color:#444; line-height:1.6;
`;
const Cards = styled.div`
  display:flex; justify-content:center; gap:24px; margin-bottom:32px; flex-wrap: wrap;
  @media (max-width: 480px){ gap:16px; }
`;
const BotCard = styled.div`
  position:relative;
  width:220px;
  cursor:pointer; transition:.3s;
  img{width:100%; border-radius:20px; border:${({selected})=>selected?"5px solid #2b3993":"3px solid transparent"};
      opacity:${({selected})=>selected?"1":"0.75"}; box-shadow:${({selected})=>selected?"0 0 12px rgba(43,57,147,0.6)":"none"}; transition:all .3s;}
  span{display:block;margin-top:10px;font-size:18px;font-weight:bold;color:#333;}
  &:hover{transform:scale(1.05); img{opacity:1; border-color:${({selected})=>selected?"#2b3993":"#bbb"}}}
  @media (max-width: 1024px){ width: 200px; }
  @media (max-width: 768px){ width: calc(50% - 16px); }
  @media (max-width: 420px){ width: 100%; }
`;
const ConfirmButton = styled.button`
  font-size:20px;font-weight:bold;padding:12px 30px;border:3px solid #3f3e66;border-radius:999px;background-color:rgba(30,31,19,.85);color:white;cursor:pointer;transition:.3s;
  &:hover{transform:scale(1.05)}
  &:active{transform:scale(.95)}
  @media (max-width: 480px){ width: 100%; }
`;
const RateText = styled.span`display:block;margin-top:6px;font-size:14px;color:#666;`;
const HintBox = styled.div`
  max-width:720px;margin:0 auto 20px;padding:12px 16px;background:#fff8e1;border:1px solid #ffecb3;border-radius:8px;
  box-shadow:0 2px 6px rgba(0,0,0,.05);font-size:14px;color:#5d4037;text-align:center;line-height:1.6;display:flex;align-items:center;justify-content:center;gap:8px;
  @media (max-width: 480px){ width: 100%; }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        <HintBox>提醒您 🔔 系統目前處於測試階段，AI 夥伴為首次選擇固定；欲更換需重新進行心理測驗。</HintBox>

        <ConfirmButton onClick={handleSubmit} disabled={loading}>
          {loading ? "處理中..." : "選擇完畢"}
        </ConfirmButton>
      </Main>
    </Container>
  );
}
