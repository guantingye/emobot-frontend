import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import userIcon from "../assets/profile.png";
import StepIndicator from "./StepIndicator";
import logoIcon from "../assets/logofig.png";
import { saveAssessment } from "../api/client";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: #e8e8e8;
  font-family: "Noto Sans TC", sans-serif;
  overflow-x: hidden;
  padding-bottom: 80px;
  animation: ${fadeInUp} 0.6s ease-in-out;

  @media (max-width: 768px) {
    padding-bottom: 60px;
  }

  @media (max-width: 480px) {
    padding-bottom: 40px;
  }
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

  @media (max-width: 768px) {
    height: 60px;
    padding: 0 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  @media (max-width: 480px) {
    height: 56px;
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
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  img {
    height: 68px;
    margin-right: 8px;
  }

  @media (max-width: 768px) {
    font-size: 28px;
    
    img {
      height: 48px;
      margin-right: 6px;
    }
  }

  @media (max-width: 480px) {
    font-size: 24px;
    
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
    gap: 20px;
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
    transition: color 0.3s ease, transform 0.2s ease;

    &:hover {
      color: #2b3993;
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(1px);
    }
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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

const StepIndicatorWrapper = styled.div`
  margin-top: 120px;

  @media (max-width: 768px) {
    margin-top: 100px;
  }

  @media (max-width: 480px) {
    margin-top: 80px;
  }
`;

const Main = styled.div`
  max-width: 900px;
  margin: 40px auto 0;
  background: white;
  border: 2px solid #d0d0d0;
  border-radius: 20px;
  padding: 50px;
  animation: ${fadeInUp} 0.8s ease-in-out;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    margin: 24px 16px 0;
    padding: 32px 24px;
    border-radius: 16px;
    border: 1px solid #d0d0d0;
  }

  @media (max-width: 480px) {
    margin: 20px 12px 0;
    padding: 24px 16px;
    border-radius: 12px;
  }
`;

const Title = styled.h2`
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 70px;
  text-align: center;
  color: #2b3993;
  text-shadow: 0 1px 3px rgba(43, 57, 147, 0.1);

  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 48px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
    margin-bottom: 32px;
  }
`;

const QuestionList = styled.ul`
  font-size: 22px;
  color: #333;
  padding-left: 0;
  text-align: left;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const QuestionItem = styled.li`
  list-style: decimal;
  margin-bottom: 64px;
  line-height: 1.5;

  @media (max-width: 768px) {
    margin-bottom: 48px;
  }

  @media (max-width: 480px) {
    margin-bottom: 36px;
  }
`;

const ScaleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-top: 48px;

  @media (max-width: 768px) {
    gap: 12px;
    margin-top: 32px;
    flex-wrap: wrap;
  }

  @media (max-width: 480px) {
    gap: 8px;
    margin-top: 24px;
  }
`;

const Circle = styled.div`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 50%;
  border: 2px solid
     ${(props) =>
    props.selected
      ? props.index < 3
        ? "#6A4C93"   
        : props.index === 3
        ? "#aaa"      
        : "#3AA87A"   
      : props.index < 3
      ? "#6A4C93"
      : props.index === 3
      ? "#aaa"
      : "#3AA87A"};

background: ${(props) =>
  props.selected
    ? props.index < 3
      ? "#6A4C93"     
      : props.index === 3
      ? "#aaa"        
      : "#3AA87A"     
    : "transparent"};
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  min-width: 44px;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
    box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    width: ${(props) => Math.max(props.size * 0.8, 32)}px;
    height: ${(props) => Math.max(props.size * 0.8, 32)}px;
    min-height: 32px;
    min-width: 32px;
  }

  @media (max-width: 480px) {
    width: ${(props) => Math.max(props.size * 0.7, 28)}px;
    height: ${(props) => Math.max(props.size * 0.7, 28)}px;
    min-height: 28px;
    min-width: 28px;
  }
`;

const Label = styled.span`
  font-size: 18px;
  color: ${(props) => (props.side === "left" ? "#6A4C93" : "#3AA87A")};
  width: 60px;
  text-align: center;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 16px;
    width: 50px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    width: 40px;
  }
`;

const ButtonGroup = styled.div`
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 40px;

  @media (max-width: 768px) {
    gap: 24px;
    margin-top: 32px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
  }
`;

const Button = styled.button`
  background: rgba(30, 31, 19, 0.8);
  color: white;
  font-size: 24px;
  padding: 16px 40px;
  border: 3px solid #f5fbf2;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  min-height: 44px;

  &:hover {
    transform: scale(1.05);
    background: rgba(30, 31, 19, 1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    font-size: 20px;
    padding: 14px 32px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    padding: 12px 28px;
    width: 100%;
    max-width: 200px;
  }
`;

export default function TestStep4() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const questions = [
    "我覺得我能自由決定如何過我的生活。",
    "我真的喜歡與我互動的人。",
    "我經常覺得自己不太有能力。",
    "我覺得生活中有很多壓力。",
    "我認識的人告訴我我在做的事情上表現得不錯。",
    "我與我接觸的人相處得很好。",
    "我大多保持自己一人，沒有太多社交接觸。",
    "我通常覺得自己能自由表達想法與意見。",
    "我將我經常互動的人視為朋友。",
    "最近我有學到一些有趣的新技能。",
    "在日常生活中，我經常得照別人的話去做。",
    "我的生活中有人在乎我。",
    "我大多數日子都覺得自己做的事情有成就感。",
    "每天互動的人大多會考慮我的感受。",
    "我的生活中沒什麼機會展現我有多能幹。",
    "我沒有太多親近的人。",
    "在日常情境中，我感覺可以做自己。",
    "我經常互動的人似乎不太喜歡我。",
    "我常常覺得自己不太能幹。",
    "我的日常生活中，我幾乎沒有機會自行決定事情的做法。",
    "大多數人對我都很友善。"
  ];

  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [loading, setLoading] = useState(false);

  const handleSelect = (questionIndex, score) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = score;
    setAnswers(newAnswers);
  };

  const handleNext = async () => {
    const isComplete = answers.every((a) => a !== null);
    
    if (!isComplete) { 
      alert("請完成所有題目的回答。"); 
      return; 
    }
    
    setLoading(true);
    
    try {
      // 本地儲存（作為備份）
      localStorage.setItem("step4Answers", JSON.stringify(answers));
      
      // 儲存到後端
      console.log("Saving step4 answers:", answers);
      await saveAssessment({ 
        step4Answers: answers,
        submittedAt: new Date().toISOString()
      });
      
      navigate("/test/step5");
    } catch (e) { 
      console.error("Save step4 failed:", e);
      alert(`儲存失敗：${e.message}，但可以繼續下一步`);
      navigate("/test/step5");
    } finally {
      setLoading(false);
    }
  };

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

      <StepIndicatorWrapper>
        <StepIndicator currentStep={4} />
      </StepIndicatorWrapper>

      <Main>
        <Title>Step4 基本心理需求</Title>
        <QuestionList>
          {questions.map((q, i) => (
            <QuestionItem key={i}>
              {q}
              <ScaleWrapper>
                <Label side="left">不同意</Label>
                {[1, 2, 3, 4, 5, 6, 7].map((n, idx) => (
                  <Circle
                    key={n}
                    size={48 + Math.abs(3 - idx) * 4}
                    index={idx}
                    selected={answers[i] === n}
                    onClick={() => handleSelect(i, n)}
                  />
                ))}
                <Label side="right">同意</Label>
              </ScaleWrapper>
            </QuestionItem>
          ))}
        </QuestionList>

        <ButtonGroup>
          <Button onClick={() => navigate("/test/step3")} disabled={loading}>返回上一步</Button>
          <Button onClick={handleNext} disabled={loading}>
            {loading ? "處理中..." : "繼續作答"}
          </Button>
        </ButtonGroup>
      </Main>
    </Container>
  );
}