// src/components/TestStep5.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import userIcon from "../assets/profile.png";
import StepIndicator from "./StepIndicator";
import logoIcon from "../assets/logofig.png";
import { saveAssessment } from "../api/client";

const fadeInUp = keyframes`from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}`;

const Container = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: #e8e8e8;
  font-family: "Noto Sans TC", sans-serif;
  overflow-x: hidden;
`;

const Header = styled.header`
  width: 100%; height: 70px; background: white;
  display:flex; justify-content:space-between; align-items:center;
  padding: 0 30px; position: fixed; top:0; left:0; z-index:10; box-shadow:0 2px 10px rgba(0,0,0,.1);
  @media (max-width:1024px){ height:64px; padding:0 16px; }
`;

const Logo = styled.div`
  font-size:35px; font-weight:bold; color:#2b3993; display:flex; align-items:center; cursor:pointer; transition:.3s;
  img{ height:68px; margin-right:8px; }
  &:hover{ transform: scale(1.05); }
  @media (max-width:480px){ font-size:28px; img{ height:54px; } }
`;

const Nav = styled.nav`
  display:flex; gap:40px; font-size:26px; font-weight:bold; color:black;
  div{ cursor:pointer; transition:.2s; &:hover{ color:#2b3993; transform: translateY(-2px); } &:active{ transform: translateY(1px); } }
  @media (max-width:1024px){ gap:20px; font-size:18px; }
  @media (max-width:640px){ display:none; }
`;

const AvatarImg = styled.img` width:50px; height:50px; border-radius:50%; object-fit:cover; transition:.3s; &:hover{ transform:scale(1.1) }`;
const RightSection = styled.div` display:flex; align-items:center; gap:30px; margin-left:auto; margin-right:16px; @media (max-width:1024px){ gap:16px; }`;

const StepIndicatorWrapper = styled.div` margin-top: 100px; `;

const Main = styled.main`
  max-width: 960px; width: 92%; margin: 24px auto 40px;
  background:white; border-radius:24px; text-align:center; padding: clamp(20px, 3vw, 48px);
  animation:${fadeInUp} .8s ease;
  box-shadow: 0 8px 24px rgba(0,0,0,.06);
`;

const BigTitle = styled.h2` font-size: clamp(22px, 3.2vw, 36px); font-weight: 900; color:#333; margin-bottom: 10px; `;
const Paragraph = styled.p` white-space: pre-line; font-size: clamp(14px, 2.1vw, 18px); color:#444; line-height: 1.9; margin: 12px 0 22px; `;

const ButtonGroup = styled.div` display:flex; justify-content:center; gap:16px; flex-wrap:wrap; `;
const Button = styled.button`
  min-width: 180px; padding: 12px 24px; font-size: 18px; font-weight: 800; border-radius: 999px; border: 3px solid #f5fbf2;
  background: rgba(30,31,19,.85); color:white; cursor: pointer; transition:.2s;
  &:hover{ transform: scale(1.05); } &:active{ transform: scale(.96); }
  @media (max-width: 480px){ width: 100%; }
`;

export default function TestStep5() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // 原有彙總/整理程式（略）— 保持你的既有邏輯
  useEffect(() => {
    try {
      const rawMBTI = localStorage.getItem("step1MBTI") || "";
      let mbtiArr;
      try {
        mbtiArr = JSON.parse(rawMBTI);
        if (!Array.isArray(mbtiArr) || mbtiArr.length !== 4) throw new Error();
      } catch {
        mbtiArr = rawMBTI.toUpperCase().split("").map(c => (c==="E"||c==="N"||c==="T"||c==="P" ? 1 : 0));
      }
      setUserProfile({ mbtiArr });
    } catch {}
  }, []);

  const goMatch = async () => {
    setLoading(true);
    try {
      await saveAssessment({ step5Confirm: true, at: new Date().toISOString() });
      navigate("/matching");
    } catch (e) {
      console.error("confirm failed:", e);
      navigate("/matching");
    } finally { setLoading(false); }
  };

  return (
    <Container>
      <Header>
        <Logo onClick={() => navigate("/Home")}><img src={logoIcon} alt="logo" />Emobot+</Logo>
        <RightSection>
          <Nav>
            <div onClick={()=>navigate("/Home")}>主頁</div>
            <div onClick={() => navigate("/Home#robots")}>機器人介紹</div>
            <div onClick={() => navigate("/Home", { state: { scrollTo: "about" } })}>關於我們</div>
          </Nav>
          <AvatarImg src={userIcon} alt="avatar" onClick={()=>navigate("/profile")} />
        </RightSection>
      </Header>

      <StepIndicatorWrapper><StepIndicator currentStep={5} /></StepIndicatorWrapper>

      <Main>
        <BigTitle>謝謝你走過這段小小的探索旅程</BigTitle>
        <Paragraph>{`我們已收到你的回覆，這些資料將幫助我們更了解你的心理特質與互動風格。\n接下來，我們會根據你的回覆，提供你與四位 AI 夥伴的適合程度。\n你可以挑選一位開始旅程，也能再度重新測驗。`}</Paragraph>
        <ButtonGroup>
          <Button onClick={() => navigate("/test/step4")} disabled={loading}>返回上一步</Button>
          <Button onClick={goMatch} disabled={loading}>{loading ? "處理中..." : "開始媒合！"}</Button>
        </ButtonGroup>
      </Main>
    </Container>
  );
}
