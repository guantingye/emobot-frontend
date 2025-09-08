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

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// ===== 容器和背景 =====
const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
  background-image: url(${background});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-family: "Noto Sans TC", sans-serif;
  position: relative;
  overflow-x: hidden;

  /* 背景遮罩層增強可讀性 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(248, 250, 255, 0.05) 50%,
      rgba(240, 245, 255, 0.1) 100%
    );
    pointer-events: none;
    z-index: 0;
  }

  @media (max-width: 768px) {
    background-size: 110%;
    background-position: center 15%;
    background-attachment: scroll;
  }

  @media (max-width: 480px) {
    background-size: 125%;
    background-position: center 25%;
  }

  @media (max-width: 320px) {
    background-size: 135%;
    background-position: center 30%;
  }
`;

// ===== 標題列 =====
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
  z-index: 100;
  box-shadow: 0 4px 20px rgba(43, 57, 147, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(20px);
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
    margin-right: +15px;
  }
`;

// ===== 主要內容區域 =====
const MainContentWrapper = styled.div`
  padding-top: 90px;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding-top: 80px;
    padding-left: 20px;
    padding-right: 20px;
  }

  @media (max-width: 480px) {
    padding-top: 75px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const ContentContainer = styled.div`
  max-width: 800px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 2;
  
  /* 增加內容背景 */
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(248, 250, 255, 0.1) 100%);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 60px 40px;
  box-shadow: 0 8px 32px rgba(43, 57, 147, 0.05);

  @media (max-width: 768px) {
    padding: 40px 30px;
    border-radius: 20px;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: 32px 24px;
    border-radius: 16px;
  }

  @media (max-width: 320px) {
    padding: 24px 16px;
  }
`;

const Title = styled.h1`
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 40px;
  opacity: 0;
  animation: ${fadeInUp} 0.8s ease-out 0.2s forwards;
  background: linear-gradient(135deg, #3f3e66 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 8px rgba(63, 62, 102, 0.15);
  position: relative;

  /* 標題底部裝飾線 */
  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, #3f3e66, #667eea);
    border-radius: 2px;
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    font-size: 42px;
    margin-bottom: 32px;
    
    &::after {
      width: 60px;
      height: 2px;
      bottom: -10px;
    }
  }

  @media (max-width: 480px) {
    font-size: 32px;
    margin-bottom: 28px;
    
    &::after {
      width: 50px;
      bottom: -8px;
    }
  }

  @media (max-width: 320px) {
    font-size: 28px;
    margin-bottom: 24px;
  }
`;

const Description = styled.div`
  font-size: 24px;
  color: #444;
  line-height: 1.8;
  margin-bottom: 48px;
  opacity: 0;
  animation: ${fadeInUp} 0.8s ease-out 0.5s forwards;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  /* 段落間距優化 */
  p {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  @media (max-width: 768px) {
    font-size: 20px;
    line-height: 1.7;
    margin-bottom: 36px;
    
    p {
      margin-bottom: 12px;
    }
  }

  @media (max-width: 480px) {
    font-size: 17px;
    line-height: 1.6;
    margin-bottom: 32px;
    
    p {
      margin-bottom: 10px;
    }
  }

  @media (max-width: 320px) {
    font-size: 16px;
    margin-bottom: 28px;
    
    p {
      margin-bottom: 8px;
    }
  }
`;

const StartButton = styled.button`
  font-size: 24px;
  font-weight: 700;
  color: white;
  border: 2px solid rgba(43, 57, 147, 0.3);
  border-radius: 60px;
  padding: 18px 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  animation: ${fadeInUp} 0.8s ease-out 0.8s forwards;
  box-shadow: 0 8px 32px rgba(103, 126, 234, 0.25);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);

  /* 光澤效果 */
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
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    transition: left 0.7s ease;
  }

  /* 閃爍光圈效果 */
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #667eea, #764ba2, #667eea);
    background-size: 200% 200%;
    border-radius: 60px;
    z-index: -1;
    animation: ${shimmer} 2s linear infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px) scale(1.05);
    background: linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%);
    box-shadow: 0 16px 48px rgba(103, 126, 234, 0.35);
    border-color: rgba(43, 57, 147, 0.5);

    &::before {
      left: 100%;
    }

    &::after {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(-2px) scale(1.02);
    transition: all 0.1s ease;
  }

  @media (max-width: 768px) {
    font-size: 20px;
    padding: 16px 40px;
    border-radius: 50px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    padding: 16px 36px;
    border-radius: 40px;
    width: 100%;
    max-width: 300px;
  }

  @media (max-width: 320px) {
    font-size: 16px;
    padding: 14px 32px;
    max-width: 260px;
  }
`;

const RobotImage = styled.img`
  position: fixed;
  right: 60px;
  bottom: 40px;
  width: 220px;
  animation: ${float} 4s ease-in-out infinite;
  z-index: 1;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
  opacity: 0.9;

  @media (max-width: 1200px) {
    width: 180px;
    right: 40px;
    bottom: 30px;
  }

  @media (max-width: 900px) {
    width: 160px;
    right: 20px;
    bottom: 20px;
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

// ===== 裝飾元素 =====
const FloatingElements = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(103, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    animation: ${float} 6s ease-in-out infinite;
  }

  &::before {
    width: 200px;
    height: 200px;
    top: 20%;
    right: 10%;
    animation-delay: -2s;
  }

  &::after {
    width: 150px;
    height: 150px;
    bottom: 30%;
    left: 15%;
    animation-delay: -4s;
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
      <FloatingElements />
      
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
        <ContentContainer>
          <Title>【心理測驗】</Title>
          <Description>
            <p>每個人都有獨特的思考節奏與心理風景。</p>
            <p>這份小測驗不是為了評價你，而是為了更了解你。</p>
            <p>幾分鐘內的回覆，我們將媒合一位真正懂你的 AI 夥伴，</p>
            <p>陪你展開一段溫柔的對話旅程。</p>
          </Description>
          <StartButton onClick={() => navigate("/test/step1")}>
            開始測驗 →
          </StartButton>
        </ContentContainer>
      </MainContentWrapper>

      <RobotImage src={robotGif} alt="AI Robot" />
    </Container>
  );
}