// src/components/TestStep5.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import userIcon from "../assets/profile.png";
import StepIndicator from "./StepIndicator";
import axios from "axios";
import logoIcon from "../assets/logofig.png";

// 動畫 & 樣式
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: #e8e8e8;
  font-family: "Noto Sans TC", sans-serif;
  padding-top: 10px;
`;

const Header = styled.header`
  width: 100%;
  height: 70px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  margin-left: auto;
  margin-right: 40px;
`;

const StepIndicatorWrapper = styled.div`
  margin-top: 120px;
`;

const Main = styled.div`
  max-width: 960px; margin: 40px auto; padding: 60px;
  background: white; border-radius: 24px; text-align: center;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const BigTitle = styled.h2`
  font-size: 32px; font-weight: bold; margin-bottom: 40px;
`;

const Paragraph = styled.p`
  font-size: 20px; line-height: 1.8; color: #333; margin-bottom: 48px;
  white-space: pre-line;
`;

const ButtonGroup = styled.div`
  display: flex; justify-content: center; gap: 40px; margin-bottom: 24px;
`;

const Button = styled.button`
  font-size: 20px; padding: 14px 36px;
  border: 3px solid #3f3e66; border-radius: 999px;
  background-color: rgba(30,31,19,0.8); color: white;
  cursor: pointer; transition: all 0.3s ease;
  &:hover { transform: scale(1.05); }
  &:active { transform: scale(0.95); }
`;

const DebugButton = styled(Button)`
  display: none; // 暫時先把主動匯出CSV資料關起來
  background-color: #999; border-color: #777;
`;

export default function TestStep5() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // 1. 讀取 MBTI，fallback 處理舊格式
    const rawMBTI = localStorage.getItem("step1MBTI") || "";
    let mbtiArr;
    try {
      mbtiArr = JSON.parse(rawMBTI);
      if (!Array.isArray(mbtiArr) || mbtiArr.length !== 4) throw new Error();
    } catch {
      mbtiArr = rawMBTI
        .toUpperCase()
        .split("")
        .map(c => (c==="E"||c==="N"||c==="T"||c==="P" ? 1 : 0));
    }
    // 2. 讀取其他三個量表
    const aas  = JSON.parse(localStorage.getItem("step2Answers") || "[]");
    const ders = JSON.parse(localStorage.getItem("step3Answers") || "[]");
    const bpns = JSON.parse(localStorage.getItem("step4Answers") || "[]");
    setUserProfile({ mbti: mbtiArr, aas, ders, bpns });
  }, []);

  // 呼叫後端演算法
  const handleMatch = async () => {
    if (!userProfile) {
      alert("資料尚未準備完成！");
      return;
    }
    try {
      // 添加 API URL 配置
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      console.log('API URL:', API_URL); // 除錯用
      console.log('User Profile:', userProfile); // 除錯用
      
      const { data } = await axios.post(`${API_URL}/api/recommend`, userProfile);
      
      // 處理後端回傳的資料格式
      console.log('API Response:', data); // 除錯用
      
      // 存儲推薦結果
      localStorage.setItem("recommendResult", JSON.stringify(data));
      
      // 根據後端回傳的推薦結果設定選中的機器人
      if (data.best) {
        // 映射 AI 名稱到 ID
        const aiNameToId = {
          "EmpathicAI": 1,           // 同理型 AI
          "InsightfulAI": 2,         // 洞察型 AI
          "Solution-FocusedAI": 3,   // 解決型 AI
          "CognitiveAI": 4           // 認知型 AI
        };
        
        const botNames = {
          1: "同理型 AI",
          2: "洞察型 AI", 
          3: "解決型 AI",
          4: "認知型 AI"
        };
        
        const botImages = {
          1: "bot1.png",
          2: "bot2.png",
          3: "bot6.png", 
          4: "bot4.png"
        };
        
        const recommendedBotId = aiNameToId[data.best] || 3; // 預設解決型
        
        localStorage.setItem("selectedBotId", recommendedBotId.toString());
        localStorage.setItem("selectedBotName", botNames[recommendedBotId]);
        localStorage.setItem("selectedBotImage", botImages[recommendedBotId]);
        
        console.log('Recommended Bot ID:', recommendedBotId); // 除錯用
      }
      
      navigate("/match/result");
    } catch (err) {
      console.error("媒合失敗：", err);
      alert(`媒合失敗：${err.response?.data?.message || err.message || '請檢查網路連線'}`);
    }
  };

  // 保留 CSV 匯出
  const exportToCSV = () => {
    if (!userProfile) {
      alert("資料尚未載入完成！");
      return;
    }
    const { mbti, aas, ders, bpns } = userProfile;
    const headers = ["MBTI"], vals = [mbti.join("")];
    (aas||[]).forEach((v,i)=>{ headers.push(`AAS_Q${i+1}`); vals.push(v); });
    (ders||[]).forEach((v,i)=>{ headers.push(`DERS_Q${i+1}`); vals.push(v); });
    (bpns||[]).forEach((v,i)=>{ headers.push(`BPNS_Q${i+1}`); vals.push(v); });
    const csv = [headers.join(","), vals.join(",")].join("\n");
    const blob= new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download="answers.csv"; a.click();
  };

  return (
    <Container>
      <Header>
          <Logo onClick={() => navigate("Home/")}>
            <img src={logoIcon} alt="logo" style={{ height: "68px", marginRight: "8px" }} />
            Emobot+
          </Logo>
        <RightSection>
          <Nav>
            <div onClick={()=>navigate("/Home")}>主頁</div>
            <div onClick={() => navigate("/Home#robots")}>機器人介紹</div>
            <div onClick={()=>navigate("/mood")}>聊天</div>
            <div onClick={()=>navigate("/about-us")}>關於我們</div>
          </Nav>
          <AvatarImg src={userIcon} alt="avatar" onClick={()=>navigate("/profile")} />
        </RightSection>
      </Header>

      <StepIndicatorWrapper>
        <StepIndicator currentStep={5} />
      </StepIndicatorWrapper>

      <Main>
        <BigTitle>謝謝你走過這段小小的探索旅程。</BigTitle>
        <Paragraph>
          我們已收到你的回覆，這些資料將協助我們更了解你的心理特質與互動風格。
          {"\n"}接下來，我們會根據你的回覆，提供你與四位AI夥伴的適合程度✨
          {"\n"}你可以從中挑選一位開始旅程，也可以自由切換其他夥伴，或選擇重新測驗再次媒合。
        </Paragraph>

        <ButtonGroup>
          <Button onClick={() => navigate("/test/step4")}>返回上一步</Button>
          <Button onClick={handleMatch}>開始媒合！</Button>
        </ButtonGroup>

        <DebugButton onClick={exportToCSV}>
          匯出填答資料 CSV（Debug）
        </DebugButton>
      </Main>
    </Container>
  );
}