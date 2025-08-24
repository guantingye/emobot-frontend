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
  width: 100vw; height: 100vh; background: #e8e8e8;
  font-family: "Noto Sans TC", sans-serif; display: flex; flex-direction: column;
`;

const Header = styled.header`
  width: 100%; height: 70px; background: white;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 30px; position: sticky; top: 0; z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 35px; font-weight: bold; color: #2b3993;
  display: flex; align-items: center; cursor: pointer; transition: transform 0.3s ease;
  &:hover { transform: scale(1.05); }
`;

const Nav = styled.nav`
  display: flex; gap: 40px; font-size: 26px; font-weight: bold; color: black;
  div{
    cursor: pointer; transition: color 0.3s ease, transform 0.2s ease;
    &:hover{ color:#2b3993; transform: translateY(-2px); }
    &:active{ transform: translateY(1px); }
  }
`;

const AvatarImg = styled.img`
  width: 50px; height: 50px; border-radius: 50%; object-fit: cover; cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover { transform: scale(1.1); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
`;

const RightSection = styled.div` display: flex; align-items: center; gap: 30px; margin-right: 40px; `;

const Content = styled.div`
  flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;
  text-align: center; animation: ${fadeIn} 1s ease;
`;

const Title = styled.h2` font-size: 30px; font-weight: bold; color: #444; margin-bottom: 20px; `;
const LoadingGifStyled = styled.img` width: 400px; margin-top: 0; `;

export default function MatchingProgress() {
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    (async () => {
      try {
        console.log("Starting matching process...");
        
        // 呼叫推薦API
        const data = await runMatching();
        console.log("Matching result:", data);
        
        // 存到前端，以便結果頁不用再打一次
        localStorage.setItem("match.recommend", JSON.stringify(data));
        
        // 等個 2 秒讓動畫跑完再進結果頁
        timer = setTimeout(() => navigate("/match/result"), 2000);
      } catch (e) {
        console.error("Matching failed:", e);
        alert(`媒合失敗：${e.message || "請稍後重試"}`);
        navigate("/test/step5"); // 回到測驗完成頁
      }
    })();
    return () => timer && clearTimeout(timer);
  }, [navigate]);

  return (
    <Container>
      <Header>
        <Logo onClick={() => navigate("/Home")}>
          <img src={logoIcon} alt="logo" style={{ height: "68px", marginRight: "8px" }} />
          Emobot+
        </Logo>
        <RightSection>
          <Nav>
            <div onClick={() => navigate("/Home")}>主頁</div>
            <div onClick={() => navigate("/Home#robots")}>機器人介紹</div>
            <div onClick={() => navigate("/Home", { state: { scrollTo: "about" } })}>
              關於我們
            </div>
          </Nav>
          <AvatarImg src={userIcon} alt="user avatar" onClick={() => navigate("/profile")} />
        </RightSection>
      </Header>

      <Content>
        <Title>正在為你媒合專屬的AI夥伴！</Title>
        <LoadingGifStyled src={loadingGif} alt="Matching in progress" />
      </Content>
    </Container>
  );
}