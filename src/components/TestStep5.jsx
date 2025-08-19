// src/components/TestStep5.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import userIcon from "../assets/profile.png";
import StepIndicator from "./StepIndicator";
import logoIcon from "../assets/logofig.png";

// 動畫 & 樣式（保持原樣）
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
  &:hover { transform: scale(1.05); }
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
    &:hover { color: #2b3993; transform: translateY(-2px); }
    &:active { transform: translateY(1px); }
  }
`;

const AvatarImg = styled.img`
  width: 50px; height: 50px; border-radius: 50%;
  object-fit: cover; cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover { transform: scale(1.1); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
`;

const RightSection = styled.div`
  display: flex; align-items: center; gap: 30px; margin-left: auto; margin-right: 40px;
`;

const StepIndicatorWrapper = styled.div` margin-top: 120px; `;

const Main = styled.div`
  max-width: 960px; margin: 40px auto; padding: 60px;
  background: white; border-radius: 24px; text-align: center;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const BigTitle = styled.h2` font-size: 32px; font-weight: bold; margin-bottom: 40px; `;

const Paragraph = styled.p`
  font-size: 20px; line-height: 1.8; color: #333; margin-bottom: 48px; white-space: pre-line;
`;

const ButtonGroup = styled.div` display: flex; justify-content: center; gap: 40px; margin-bottom: 24px; `;

const Button = styled.button`
  font-size: 20px; padding: 14px 36px;
  border: 3px solid #3f3e66; border-radius: 999px;
  background-color: rgba(30,31,19,0.8); color: white;
  cursor: pointer; transition: all 0.3s ease;
  &:hover { transform: scale(1.05); }
  &:active { transform: scale(0.95); }
`;

const DebugButton = styled(Button)`
  display: none;
  background-color: #999; border-color: #777;
`;

export default function TestStep5() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // 這段保留（你原本有需要的話）
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
    const aas  = JSON.parse(localStorage.getItem("step2Answers") || "[]");
    const ders = JSON.parse(localStorage.getItem("step3Answers") || "[]");
    const bpns = JSON.parse(localStorage.getItem("step4Answers") || "[]");
    setUserProfile({ mbti: mbtiArr, aas, ders, bpns });
  }, []);

  // Step5 的「開始媒合」→ 只負責導到 Loading 頁
  const goMatch = () => {
    // 若你想在這裡做最後的檢查可以加，但不打 API
    navigate("/matching");
  };

  const exportToCSV = () => {
    if (!userProfile) return;
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
            <div onClick={() => navigate("/Home", { state: { scrollTo: "about" } })}>關於我們</div>
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
          <Button onClick={goMatch}>開始媒合！</Button>
        </ButtonGroup>

        <DebugButton onClick={exportToCSV}>匯出填答資料 CSV（Debug）</DebugButton>
      </Main>
    </Container>
  );
}
