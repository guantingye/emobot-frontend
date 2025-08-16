import React from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import robotGif from "../assets/robot.gif";
import userIcon from "../assets/profile.png";
import background from "../assets/background.png";
import logoIcon from "../assets/logofig.png";

// ===== 動畫定義 =====
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ===== 元件樣式區塊 =====
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-image: url(${background});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-family: "Noto Sans TC", sans-serif;
  overflow: hidden;
  position: relative;
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

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  margin-left: auto;
  margin-right: 40px;
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

const MainContentWrapper = styled.div`
  margin-top: 80px;
  height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContentScaler = styled.div`
  max-width: 700px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 56px;
  color: #3f3e66;
  font-weight: 700;
  margin-bottom: 40px;
  opacity: 0;
  animation: ${fadeInUp} 0.8s ease-out 0.2s forwards;
`;

const Description = styled.p`
  font-size: 28px;
  color: #333;
  line-height: 2;
  white-space: pre-line;
  opacity: 0;
  animation: ${fadeInUp} 0.8s ease-out 0.5s forwards;
`;

const StartButton = styled.button`
  margin-top: 48px;
  font-size: 26px;
  font-weight: bold;
  color: white;
  border: 3px solid #f5fbf2;
  border-radius: 999px;
  padding: 16px 42px;
  background: linear-gradient(168deg, rgba(32,114,202,0.29) 0%, rgba(43,80,126,0.78) 100%);
  backdrop-filter: blur(32px);
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  animation: ${fadeInUp} 0.8s ease-out 0.8s forwards;

  &:hover {
    transform: scale(1.08);
    background: linear-gradient(168deg, rgba(32,114,202,0.45) 0%, rgba(43,80,126,0.95) 100%);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const RobotImage = styled.img`
  position: absolute;
  right: 50px;
  bottom: 35px;
  width: 240px;
  animation: ${float} 3s ease-in-out infinite;
  z-index: 0;
`;

// ===== 主組件 =====
export default function TestEntry() {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <Logo onClick={() => navigate("Home/")}>
          <img src={logoIcon} alt="logo" style={{ height: "68px", marginRight: "8px" }} />
          Emobot+
        </Logo>
        <RightSection>
          <Nav>
            <div onClick={() => navigate("/Home")}>主頁</div>
            <div onClick={() => navigate("/Home#robots")}>機器人介紹</div>
            <div onClick={() => navigate("/mood")}>聊天</div>
            <div onClick={() => navigate("/about-us")}>關於我們</div>
          </Nav>
          <AvatarImg src={userIcon} alt="user avatar" onClick={() => navigate("/profile")} />
        </RightSection>
      </Header>

      <MainContentWrapper>
        <ContentScaler>
          <Title>【心理測驗】</Title>
          <Description>
            每個人都有獨特的思考節奏與心理風景。<br/>
            這份小測驗不是為了評價你，而是為了更了解你。<br/>
            幾分鐘內的回覆，我們將媒合一位真正懂你的 AI 夥伴，<br/>
            陪你展開一段溫柔的對話旅程。
          </Description>
          <StartButton onClick={() => navigate("/test/step1")}>開始測驗 →</StartButton>
        </ContentScaler>
      </MainContentWrapper>

      <RobotImage src={robotGif} alt="AI Robot" />
    </Container>
  );
}

