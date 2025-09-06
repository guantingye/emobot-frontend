// src/components/TestStep4.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import userIcon from "../assets/profile.png";
import StepIndicator from "./StepIndicator";
import logoIcon from "../assets/logofig.png";
import { saveAssessment } from "../api/client";

const fadeInUp = keyframes` from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;

const Container = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: #e8e8e8;
  font-family: "Noto Sans TC", sans-serif;
  overflow-x: hidden;
  padding-bottom: 80px;
  animation: ${fadeInUp} 0.6s ease-in-out;
`;

const Header = styled.header`
  width: 100%; height: 70px; background: white;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 30px; position: fixed; top: 0; left: 0; z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  @media (max-width: 1024px){ height: 64px; padding: 0 16px; }
`;

const Logo = styled.div`
  font-size: 35px; font-weight: bold; color: #2b3993; display: flex; align-items: center; cursor: pointer; transition: transform 0.3s ease;
  &:hover { transform: scale(1.05); }
  img{ height: 68px; margin-right: 8px; }
  @media (max-width: 480px){ font-size: 28px; img{ height: 54px; } }
`;

const RightSection = styled.div` display: flex; align-items: center; gap: 30px; margin-left: auto; margin-right: 16px; @media (max-width: 1024px){ gap: 16px; }`;
const Nav = styled.nav`
  display: flex; gap: 40px; font-size: 26px; font-weight: bold; color: black;
  div { cursor: pointer; transition: color 0.3s ease, transform 0.2s ease; &:hover { color: #2b3993; transform: translateY(-2px); } &:active { transform: translateY(1px); } }
  @media (max-width: 1024px){ gap: 20px; font-size: 18px; }
  @media (max-width: 640px){ display: none; }
`;

const AvatarImg = styled.img`
  width: 50px; height: 50px; border-radius: 50%; object-fit: cover; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover { transform: scale(1.1); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); }
`;

const StepIndicatorWrapper = styled.div` margin-top: 120px; @media (max-width: 1024px){ margin-top: 100px; }`;

const Main = styled.div`
  max-width: 900px; width: 92%; margin: 24px auto 0; background: white; border: 2px solid #d0d0d0; border-radius: 20px;
  padding: clamp(18px, 3vw, 50px); animation: ${fadeInUp} 0.8s ease-in-out;
`;

const Title = styled.h2` font-size: clamp(22px, 3vw, 36px); font-weight: bold; margin-bottom: 26px; text-align: center; `;
const QuestionList = styled.ul` font-size: clamp(16px, 2.1vw, 22px); color: #333; padding-left: 0; text-align: left; `;
const QuestionItem = styled.li` list-style: decimal; margin-bottom: 40px; `;

const ScaleWrapper = styled.div`
  display: flex; align-items: center; justify-content: center; gap: 18px; margin-top: 24px; flex-wrap: wrap;
  @media (max-width: 480px){ transform: scale(0.9); transform-origin: center; }
`;

const Circle = styled.div`
  width: ${(props) => props.size}px; height: ${(props) => props.size}px; border-radius: 50%;
  border: 2px solid
     ${(props) =>
    props.selected
      ? props.index < 3 ? "#6A4C93" : props.index === 3 ? "#aaa" : "#3AA87A"
      : props.index < 3 ? "#6A4C93" : props.index === 3 ? "#aaa" : "#3AA87A"};
  background: ${(props) =>
    props.selected
      ? props.index < 3 ? "#6A4C93" : props.index === 3 ? "#aaa" : "#3AA87A"
      : "transparent"};
  cursor: pointer; transition: all 0.2s ease;
  &:hover { transform: scale(1.1); box-shadow: 0 0 6px rgba(0, 0, 0, 0.2); }
  &:active { transform: scale(0.95); box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3); }
`;

const Label = styled.span` font-size: 16px; color: ${(props) => (props.side === "left" ? "#6A4C93A" : "#3AA87A")}; width: 60px; text-align: center; `;
const ButtonGroup = styled.div` margin-top: 24px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; `;
const Button = styled.button`
  background: rgba(30, 31, 19, 0.8); color: white; font-size: 20px; padding: 12px 28px; border: 3px solid #f5fbf2; border-radius: 999px; cursor: pointer; transition: all 0.2s;
  &:hover { transform: scale(1.05); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  @media (max-width: 480px){ width: 100%; }
`;

export default function TestStep4() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const questions = [
    "我覺得我能自由決定如何過我的生活。","我真的喜歡與我互動的人。","我經常覺得自己不太有能力。","我覺得生活中有很多壓力。","我認識的人告訴我我在做的事情上表現得不錯。",
    "我與我接觸的人相處得很好。","我大多保持自己一人，沒有太多社交接觸。","我通常覺得自己能自由表達想法與意見。","我將我經常互動的人視為朋友。","最近我有學到一些有趣的新技能。",
    "在日常生活中，我經常得照別人的話去做。","我的生活中有人在乎我。","我大多數日子都覺得自己做的事情有成就感。","每天互動的人大多會考慮我的感受。","我的生活中沒什麼機會展現我有多能幹。",
    "我沒有太多親近的人。","在日常情境中，我感覺可以做自己。","我經常互動的人似乎不太喜歡我。","我常常覺得自己不太能幹。","我的日常生活中，我幾乎沒有機會自行決定事情的做法。","大多數人對我都很友善。"
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
    if (!isComplete) { alert("請完成所有題目的回答。"); return; }
    setLoading(true);
    try {
      localStorage.setItem("step4Answers", JSON.stringify(answers));
      await saveAssessment({ step4Answers: answers, submittedAt: new Date().toISOString() });
      navigate("/test/step5");
    } catch (e) {
      console.error("Save step4 failed:", e);
      alert(`儲存失敗：${e.message}，但可以繼續下一步`);
      navigate("/test/step5");
    } finally { setLoading(false); }
  };

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
                {[1,2,3,4,5,6,7].map((n, idx) => (
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
