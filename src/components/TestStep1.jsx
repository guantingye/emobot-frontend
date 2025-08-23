import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import userIcon from "../assets/profile.png";
import StepIndicator from "./StepIndicator";
import logoIcon from "../assets/logofig.png";
import { saveAssessment } from "../api/client";


// ========== 動畫 ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ========== 樣式 ==========
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: #e8e8e8;
  font-family: "Noto Sans TC", sans-serif;
  overflow: hidden;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

const StepIndicatorWrapper = styled.div`
  margin-top: 120px;
`;

const Main = styled.div`
  margin-top: 60px;
  display: flex;
  justify-content: center;
`;

const Card = styled.div`
  width: 800px;
  background: white;
  border: 2px solid #d0d0d0;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  animation: ${fadeIn} 0.8s ease;
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
`;

const Instruction = styled.p`
  font-size: 20px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 70%;
  height: 55px;
  font-size: 24px;
  border: 1.5px solid #b4b4b4;
  border-radius: 8px;
  padding-left: 20px;
  margin-bottom: 15px;
`;

const Hint = styled.p`
  font-size: 18px;
  color: #555;
  margin-bottom: 30px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
`;

const Button = styled.button`
  background: rgba(30, 31, 19, 0.8);
  color: white;
  font-size: 24px;
  padding: 14px 30px;
  border: 3px solid #f5fbf2;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(30, 31, 19, 1);
    transform: scale(1.05);
  }
`;

export default function MBTIStep1() {
  const navigate = useNavigate();
  const [mbtiStr, setMbtiStr] = useState("");

  const handleNext = async () => {
    const s = mbtiStr.trim().toUpperCase();
    if (!/^[EI][NS][TF][PJ]$/.test(s)) {
      alert("請輸入正確的 MBTI 4 字母（如 ENTP、ISFJ）");
      return;
    }
    const mbtiArr = [
      s[0] === "E" ? 1 : 0,
      s[1] === "N" ? 1 : 0,
      s[2] === "T" ? 1 : 0,
      s[3] === "P" ? 1 : 0,
    ];
    localStorage.setItem("step1MBTI", JSON.stringify(mbtiArr));
    try {
      await saveAssessment({ mbti: { raw: s, encoded: mbtiArr } });
    } catch (e) {
      console.warn("save step1 failed:", e.message);
    }
    navigate("/test/step2");
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
            <div onClick={() => navigate("/Home")}>主頁</div>
            <div onClick={() => navigate("/Home#robots")}>機器人介紹</div>
            <div onClick={() => navigate("/Home", { state: { scrollTo: "about" } })}>
              關於我們
            </div>
          </Nav>
          <AvatarImg
            src={userIcon}
            alt="user avatar"
            onClick={() => navigate("/profile")}
          />
        </RightSection>
      </Header>

      <StepIndicatorWrapper>
        <StepIndicator currentStep={1} />
      </StepIndicatorWrapper>

      <Main>
        <Card>
          <Title>Step1 MBTI人格特質</Title>
          <Instruction>
            1. 請填寫你測驗過的 MBTI 四個字母（如：ENFP）
          </Instruction>
          <Input
            type="text"
            placeholder="在此輸入你的MBTI"
            value={mbtiStr}
            onChange={(e) => setMbtiStr(e.target.value)}
          />
          <Hint>*若尚未測驗，可於本頁連結前往免費測驗。</Hint>
          <ButtonGroup>
            <Button
              onClick={() =>
                window.open("https://www.16personalities.com/tw", "_blank")
              }
            >
              前往MBTI測驗
            </Button>
            <Button onClick={handleNext}>填完，下一步！</Button>
          </ButtonGroup>
        </Card>
      </Main>
    </Container>
  );
}
