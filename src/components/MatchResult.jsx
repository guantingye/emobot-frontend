import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import userIcon from "../assets/profile.png";
import bot1 from "../assets/bot1.png";
import bot2 from "../assets/bot2.png";
import bot6 from "../assets/bot6.png";
import bot4 from "../assets/bot4.png";
import logoIcon from "../assets/logofig.png";

// Animation
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
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Logo = styled.div`
  font-size: 35px;
  font-weight: bold;
  color: #2b3993;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
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
    transition: color 0.3s ease, transform 0.2s ease;
    
    &:hover {
      color: #2b3993;
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(1px);
    }
  }
`;

const AvatarImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  margin-right: 40px;
`;

const Main = styled.div`
  max-width: 1000px;
  margin: 60px auto;
  padding: 60px;
  background: white;
  border-radius: 24px;
  text-align: center;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 40px;
  color: #444;
`;

const Cards = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 48px;
`;

const BotCard = styled.div`
  position: relative;
  width: 220px;
  cursor: pointer;
  transition: transform 0.3s ease, opacity 0.3s ease, border 0.3s ease;

  img {
    width: 100%;
    border-radius: 20px;
    border: ${({ selected }) => (selected ? "5px solid #2b3993" : "3px solid transparent")};
    opacity: ${({ selected }) => (selected ? "1" : "0.6")};
    box-shadow: ${({ selected }) => (selected ? "0 0 12px rgba(43,57,147,0.6)" : "none")};
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
      border-color: ${({ selected }) => (selected ? "#2b3993" : "#bbb")};
    }
  }
`;

const ConfirmButton = styled.button`
  font-size: 22px;
  font-weight: bold;
  padding: 14px 36px;
  border: 3px solid #3f3e66;
  border-radius: 999px;
  background-color: rgba(30, 31, 19, 0.8);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SectionTitle = styled.h3`
  font-size: 24px;
  margin-top: 60px;
  margin-bottom: 20px;
  color: #444;
`;

const ResultBox = styled.pre`
  width: 80%;
  max-height: 300px;
  overflow: auto;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin: 0 auto;
  text-align: left;
`;

const RateText = styled.span`
  display: block;
  margin-top: 6px;
  font-size: 16px;
  color: #666;
`;

export default function MatchResult() {
  const navigate = useNavigate();
  const [selectedBot, setSelectedBot] = useState(null);
  const [recommendedBot, setRecommendedBot] = useState(null);
  const [algoResult, setAlgoResult] = useState(null);

  const bots = [
    { id: 1, name: "同理型 AI", img: bot1 },
    { id: 2, name: "洞察型 AI", img: bot2 },
    { id: 3, name: "解決型 AI", img: bot6 },
    { id: 4, name: "認知型 AI", img: bot4 },
  ];

  // 動態計算媒合率
  const getDynamicRates = () => {
    // 如果有 API 回傳的結果，使用真實的相似度分數
    if (algoResult && algoResult.all_scores) {
      const rates = {};
      algoResult.all_scores.forEach(item => {
        // 映射 AI 名稱到 ID
        const aiNameToId = {
          "EmpathicAI": 1,
          "InsightfulAI": 2,
          "Solution-FocusedAI": 3,
          "CognitiveAI": 4
        };
        const botId = aiNameToId[item.label];
        if (botId) {
          rates[botId] = item.sim.toFixed(3);
        }
      });
      return rates;
    }
    
    // 備用的預設值
    return {
      1: "0.650",   // 同理型
      2: "0.720",   // 洞察型
      3: "0.850",   // 解決型
      4: "0.680",   // 認知型
    };
  };

  const handleSelect = (id) => {
    setSelectedBot((prev) => (prev === id ? null : id));
  };

  const handleSubmit = async () => {
    if (!selectedBot) {
      alert("請先選擇一位 AI 夥伴！");
      return;
    }

    try {
      // 添加 API URL 配置
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      const selectedBotData = bots.find(bot => bot.id === selectedBot);
      localStorage.setItem("selectedBotId", selectedBot.toString());
      localStorage.setItem("selectedBotImage", selectedBotData.img);
      localStorage.setItem("selectedBotName", selectedBotData.name);

      // 修改 API 呼叫
      const response = await fetch(`${API_URL}/api/selected-bot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot_id: selectedBot }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("選擇結果已送出：", result);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("送出失敗，請稍後再試");
    }
  };

  useEffect(() => {
    // 從 localStorage 讀取推薦結果
    const recJson = localStorage.getItem("recommendResult");
    if (recJson) {
      try {
        const result = JSON.parse(recJson);
        setAlgoResult(result);
        
        console.log('Loaded recommendation result:', result); // 除錯用
        
        // 處理推薦的機器人顯示
        if (result.best) {
          // 映射 AI 名稱到前端的機器人資料
          const aiNameToBot = {
            "EmpathicAI": { name: "同理型 AI", img: bot1 },
            "InsightfulAI": { name: "洞察型 AI", img: bot2 },
            "Solution-FocusedAI": { name: "解決型 AI", img: bot6 },
            "CognitiveAI": { name: "認知型 AI", img: bot4 }
          };
          
          const recommendedBotData = aiNameToBot[result.best];
          if (recommendedBotData) {
            setRecommendedBot(recommendedBotData);
          }
        }
      } catch (error) {
        console.error("Failed to parse recommendation result:", error);
      }
    }
    
    // 備用：從 localStorage 讀取已選擇的機器人
    const botName = localStorage.getItem("selectedBotName");
    const botImage = localStorage.getItem("selectedBotImage");
    if (botName && botImage && !recommendedBot) {
      setRecommendedBot({ name: botName, img: botImage });
    }
  }, []);

  // 取得動態媒合率
  const dynamicRates = getDynamicRates();

  return (
    <Container>
      <Header>
        <Logo onClick={() => navigate("Home/")}>
          <img src={logoIcon} alt="logo" style={{ height: "68px", marginRight: "8px" }} />
          Emobot+
        </Logo>
        <RightSection>
          <Nav>
            <div onClick={() => navigate("/")}>主頁</div>
            <div onClick={() => navigate("/Home#robots")}>機器人介紹</div>
            <div onClick={() => navigate("/mood")}>聊天</div>
            <div onClick={() => navigate("/about-us")}>關於我們</div>
          </Nav>
          <AvatarImg src={userIcon} alt="user avatar" />
        </RightSection>
      </Header>

      <Main>
        <Title>我們根據心理測驗結果，提供你與每位AI夥伴的適合程度。<br/>
          你可以自由選擇最想開始對話的一位。
        </Title>
        <Cards>
          {bots.map((bot) => {
            const rate = dynamicRates[bot.id];
            return (
              <BotCard
                key={bot.id}
                selected={selectedBot === bot.id}
                onClick={() => handleSelect(bot.id)}
              >
                <img src={bot.img} alt={bot.name} />
                <span>{bot.name}</span>
                {rate && <RateText>媒合率：{rate}</RateText>}
              </BotCard>
            );
          })}
        </Cards>
        <ConfirmButton onClick={handleSubmit}>選擇完畢</ConfirmButton>

        <SectionTitle>你的媒合結果</SectionTitle>
        {recommendedBot ? (
          <BotCard selected style={{ margin: "0 auto" }}>
            <img src={recommendedBot.img} alt={recommendedBot.name} />
            <span>{recommendedBot.name}</span>
          </BotCard>
        ) : (
          <p style={{ fontSize: "18px", color: "#888" }}>
            目前沒有成功媒合的結果
          </p>
        )}

        {/* 演算法推薦結果顯示 */}
        {algoResult && (
          <>
            <SectionTitle>演算法原始回傳結果</SectionTitle>
            <ResultBox>{JSON.stringify(algoResult, null, 2)}</ResultBox>
          </>
        )}
      </Main>
    </Container>
  );
}