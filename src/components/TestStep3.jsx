import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import userIcon from "../assets/profile.png";
import StepIndicator from "./StepIndicator";
import logoIcon from "../assets/logofig.png";
import { saveAssessment } from "../api/client";

// === 動畫效果 ===
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

const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: #e8e8e8;
  font-family: "Noto Sans TC", sans-serif;
  overflow-x: hidden;
  padding-bottom: 80px;
  animation: ${fadeInUp} 0.6s ease-in-out;
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

const StepIndicatorWrapper = styled.div`
  margin-top: 120px;
`;

const Main = styled.div`
  max-width: 900px;
  margin: 40px auto 0;
  background: white;
  border: 2px solid #d0d0d0;
  border-radius: 20px;
  padding: 50px;
  animation: ${fadeInUp} 0.8s ease-in-out;
`;

const Title = styled.h2`
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 70px;
  text-align: center;
`;

const QuestionList = styled.ul`
  font-size: 22px;
  color: #333;
  padding-left: 0;
  text-align: left;
`;

const QuestionItem = styled.li`
  list-style: decimal;
  margin-bottom: 64px;
`;

const ScaleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-top: 48px;
`;

const Circle = styled.div`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 50%;
  border: 2px solid
    ${(props) =>
    props.selected
      ? props.index < 2
        ? "#6A4C93"   // 左邊兩個 → 紫色
        : props.index > 2
        ? "#3AA87A"   // 右邊兩個 → 綠色
        : "#aaa"      // 中間一個 → 灰色
      : props.index < 2
      ? "#6A4C93"
      : props.index > 2
      ? "#3AA87A"
      : "#aaa"};

background: ${(props) =>
  props.selected
    ? props.index < 2
      ? "#6A4C93"     // 左邊兩個 → 紫色實心
      : props.index > 2
      ? "#3AA87A"     // 右邊兩個 → 綠色實心
      : "#aaa"        // 中間一個 → 灰色實心
    : "transparent"};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
    box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
  }
`;

const Label = styled.span`
  font-size: 18px;
  color: ${(props) => (props.side === "left" ? "#6A4C93" : "#3AA87A")};
  width: 60px;
  text-align: center;
`;

const ButtonGroup = styled.div`
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 40px;
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

  &:hover {
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function TestStep3() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const questions = [
    "我會注意自己的感受。",
    "我完全不知道自己在感受什麼。",
    "我難以理解自己的感受。",
    "我對自己的感受保持專注。",
    "我對自己的感受感到困惑。",
    "當我感到難過時，我會承認自己的情緒。",
    "當我感到難過時，我會因為這種感受而感到尷尬。",
    "當我感到難過時，我難以完成工作。",
    "當我感到難過時，我變得失控。",
    "當我感到難過時，我認為自己會長時間維持這種狀態。",
    "當我感到難過時，我認為自己最終會變得非常憂鬱。",
    "我感到難過時，我難以專注於其他事情。",
    "當我感到難過時，我因為這種感受而感到羞愧。",
    "當我感到難過時，我會因為這種感受而感到內疚。",
    "當我感到難過時，我難以集中注意力。",
    "當我感到難過時，我難以控制自己的行為。",
    "當我感到難過時，我認為沉浸於這種情緒是我唯一能做的事。",
    "當我感到難過時，我無法控制自己的行為。"
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
      localStorage.setItem("step3Answers", JSON.stringify(answers));
      
      // 儲存到後端
      console.log("Saving step3 answers:", answers);
      await saveAssessment({ 
        step3Answers: answers,
        submittedAt: new Date().toISOString()
      });
      
      navigate("/test/step4");
    } catch (e) { 
      console.error("Save step3 failed:", e);
      alert(`儲存失敗：${e.message}，但可以繼續下一步`);
      navigate("/test/step4");
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
        <StepIndicator currentStep={3} />
      </StepIndicatorWrapper>

      <Main>
        <Title>Step3 情緒調節策略</Title>
        <QuestionList>
          {questions.map((q, i) => (
            <QuestionItem key={i}>
              {q}
              <ScaleWrapper>
                <Label side="left">不同意</Label>
                {[1, 2, 3, 4, 5].map((n, idx) => (
                  <Circle
                    key={n}
                    size={48 + Math.abs(2 - idx) * 6}
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
          <Button onClick={() => navigate("/test/step2")} disabled={loading}>返回上一步</Button>
          <Button onClick={handleNext} disabled={loading}>
            {loading ? "處理中..." : "繼續作答"}
          </Button>
        </ButtonGroup>
      </Main>
    </Container>
  );
}