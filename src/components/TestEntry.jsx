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

// ===== 元件樣式優化 =====
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

  @media (max-width: 768px) {
    background-size: 120%;
    background-position: center 20%;
    background-attachment: scroll;
  }

  @media (max-width: 480px) {
    background-size: 140%;
    background-position: center 30%;
  }
`;

const Header = styled.header`
  width: 100%;
  height: 70px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  position: fixed;
  top: 0;
  left: 0;
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

const MainContentWrapper = styled.div`
  margin-top: 80px;
  height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    margin-top: 60px;
    height: calc(100vh - 60px);
    padding: 0 20px;
  }

  @media (max-width: 480px) {
    margin-top: 55px;
    height: calc(100vh - 55px);
    padding: 0 16px;
  }
`;

const ContentScaler = styled.div`
  max-width: 700px;
  text-align: center;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const Title = styled.h1`
  font-size: 56px;
  color: #3f3e66;
  font-weight: 700;
  margin-bottom: 40px;
  opacity: 0;
  animation: ${fadeInUp} 0.8s ease-out 0.2s forwards;
  background: linear-gradient(135deg, #3f3e66 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(63, 62, 102, 0.1);

  @media (max-width: 768px) {
    font-size: 36px;
    margin-bottom: 30px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
    margin-bottom: 25px;
  }

  @media (max-width: 320px) {
    font-size: 24px;
    margin-bottom: 20px;
  }
`;

const Description = styled.p`
  font-size: 28px;
  color: #333;
  line-height: 2;
  white-space: pre-line;
  opacity: 0;
  animation: ${fadeInUp} 0.8s ease-out 0.5s forwards;

  @media (max-width: 768px) {
    font-size: 20px;
    line-height: 1.8;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    line-height: 1.7;
  }

  @media (max-width: 320px) {
    font-size: 15px;
    line-height: 1.6;
  }
`;

const StartButton = styled.button`
  margin-top: 48px;
  font-size: 26px;
  font-weight: bold;
  color: white;
  border: 3px solid rgba(43, 57, 147, 0.2);
  border-radius: 999px;
  padding: 16px 42px;
  background: linear-gradient(135deg, rgba(32,114,202,0.9) 0%, rgba(43,80,126,0.9) 100%);
  backdrop-filter: blur(32px);
  cursor: pointer;
  transition: all 0.4s ease;
  opacity: 0;
  animation: ${fadeInUp} 0.8s ease-out 0.8s forwards;
  box-shadow: 0 8px 25px rgba(43, 57, 147, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    transition: left 0.6s ease;
  }

  &:hover {
    transform: scale(1.08);
    background: linear-gradient(135deg, rgba(32,114,202,1) 0%, rgba(43,80,126,1) 100%);
    box-shadow: 0 12px 35px rgba(43, 57, 147, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    margin-top: 35px;
    font-size: 20px;
    padding: 14px 32px;
  }

  @media (max-width: 480px) {
    margin-top: 30px;
    font-size: 18px;
    padding: 12px 24px;
    width: 100%;
    max-width: 280px;
  }

  @media (max-width: 320px) {
    font-size: 16px;
    padding: 12px 20px;
    max-width: 240px;
  }
`;

const RobotImage = styled.img`
  position: absolute;
  right: 50px;
  bottom: 35px;
  width: 240px;
  animation: ${float} 3s ease-in-out infinite;
  z-index: 0;

  @media (max-width: 1024px) {
    right: 30px;
    bottom: 30px;
    width: 200px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

// ===== 主組件 =====
export default function TestEntry() {
  const navigate = useNavigate();

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
            <div onClick={() => navigate("/Home", { state: { scrollTo: "about" } })}>
              關於我們
            </div>
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