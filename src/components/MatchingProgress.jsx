// src/components/MatchingProgress.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import userIcon from "../assets/profile.png";
import loadingGif from "../assets/matching_progress_bar.gif";
import logoIcon from "../assets/logofig.png";
import { runMatching } from "../api/client";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: #e8e8e8;
  font-family: "Noto Sans TC", sans-serif;
  overflow-x: hidden;
`;

const Header = styled.header`
  width: 100%;
  height: 70px;
  background: white;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 30px;
  position: sticky; top: 0; z-index: 10;
  box-shadow: 0 2px 10px rgba(0,0,0,.1);
  @media (max-width: 1024px){ height: 64px; padding: 0 16px; }
`;

const Logo = styled.div`
  font-size: 35px; font-weight: bold; color: #2b3993;
  display: flex; align-items: center; cursor: pointer; transition: .3s;
  &:hover { transform: scale(1.05); }
  img{ height: 68px; margin-right: 8px; }
  @media (max-width: 480px){ font-size: 28px; img{ height: 54px; } }
`;

const Nav = styled.nav`
  display: flex; gap: 40px; font-size: 26px; font-weight: bold; color: black;
  div{ cursor: pointer; transition: .2s; &:hover{ color:#2b3993; transform: translateY(-2px); } &:active{ transform: translateY(1px); } }
  @media (max-width: 1024px){ gap: 20px; font-size: 18px; }
  @media (max-width: 640px){ display: none; }
`;

const AvatarImg = styled.img`
  width: 50px; height: 50px; border-radius: 50%; object-fit: cover; cursor: pointer;
  transition: .3s; &:hover { transform: scale(1.1); box-shadow: 0 4px 8px rgba(0,0,0,.2); }
`;

const RightSection = styled.div`
  display:flex; align-items:center; gap:30px; margin-right: 16px;
  @media (max-width: 1024px){ gap:16px; }
`;

const Content = styled.main`
  max-width: 1000px; width: 92%;
  margin: clamp(20px, 4vw, 40px) auto;
  padding: clamp(16px, 3vw, 40px);
  background: white; border-radius: 24px; text-align: center;
  animation: ${fadeIn} .8s ease-out;
`;

const Title = styled.h2`
  font-size: clamp(18px, 2.6vw, 28px);
  font-weight: 800; color: #444; margin-bottom: 16px;
`;

const LoadingGifStyled = styled.img`
  width: clamp(180px, 50vw, 560px);
  height: auto;
  display: block; margin: 0 auto;
`;

export default function MatchingProgress() {
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    (async () => {
      try {
        const data = await runMatching();
        localStorage.setItem("match.recommend", JSON.stringify(data));
        timer = setTimeout(() => navigate("/match/result"), 1200);
      } catch (e) {
        console.error("Matching failed:", e);
        alert(`媒合失敗：${e?.message || "請稍後重試"}`);
        navigate("/test/step5");
      }
    })();
    return () => timer && clearTimeout(timer);
  }, [navigate]);

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

      <Content>
        <Title>正在為你媒合專屬的 AI 夥伴⋯</Title>
        <LoadingGifStyled src={loadingGif} alt="Matching in progress" />
      </Content>
    </Container>
  );
}
