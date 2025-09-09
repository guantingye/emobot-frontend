import React, { useState } from "react";
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
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  box-shadow: 0 4px 20px rgba(43, 57, 147, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
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

const StepIndicatorWrapper = styled.div`
  margin-top: 120px;

  @media (max-width: 768px) {
    margin-top: 80px;
  }

  @media (max-width: 480px) {
    margin-top: 75px;
  }
`;

const Main = styled.div`
  max-width: 900px;
  margin: 40px auto 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border: 2px solid rgba(43, 57, 147, 0.1);
  border-radius: 20px;
  padding: 50px;
  animation: ${fadeInUp} 0.8s ease-in-out;
  box-shadow: 0 8px 32px rgba(43, 57, 147, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    margin: 20px 8px 0;
    padding: 24px 16px;
    border-radius: 16px;
    max-width: none;
  }

  @media (max-width: 480px) {
    margin: 16px 6px 0;
    padding: 20px 12px;
    border-radius: 12px;
  }

  @media (max-width: 320px) {
    margin: 12px 4px 0;
    padding: 16px 8px;
    border-radius: 10px;
  }
`;

const Title = styled.h2`
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
  background: linear-gradient(135deg, #2b3993 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(43, 57, 147, 0.1);

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
    margin-bottom: 16px;
  }

  @media (max-width: 320px) {
    font-size: 18px;
    margin-bottom: 14px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #444;
  line-height: 1.7;
  max-width: 720px;
  margin: 0 auto 28px;
  text-align: center;
  background: linear-gradient(135deg, #f9f9f9 0%, #f0f4f8 100%);
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid rgba(43, 57, 147, 0.1);
  box-shadow: 0 2px 8px rgba(43, 57, 147, 0.05);

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px 12px;
    margin: 0 auto 20px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 6px 8px;
    margin: 0 auto 16px;
  }

  @media (max-width: 320px) {
    font-size: 11px;
    padding: 4px 6px;
    margin: 0 auto 12px;
  }
`;

const QuestionList = styled.ul`
  font-size: 22px;
  color: #333;
  padding-left: 0;
  text-align: left;

  @media (max-width: 768px) {
    font-size: 16px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
  }

  @media (max-width: 320px) {
    font-size: 12px;
  }
`;

const QuestionItem = styled.li`
  list-style: decimal;
  margin-bottom: 64px;
  padding: 0 8px;

  @media (max-width: 768px) {
    margin-bottom: 32px;
    padding: 0 4px;
  }

  @media (max-width: 480px) {
    margin-bottom: 24px;
    padding: 0 2px;
  }

  @media (max-width: 320px) {
    margin-bottom: 20px;
    padding: 0;
  }
`;

const ScaleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-top: 48px;

  @media (max-width: 768px) {
    gap: 8px;
    margin-top: 24px;
    flex-wrap: wrap;
  }

  @media (max-width: 480px) {
    gap: 4px;
    margin-top: 16px;
    flex-direction: column;
  }

  @media (max-width: 320px) {
    gap: 2px;
    margin-top: 12px;
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
  transition: all 0.3s ease;
  box-shadow: ${(props) => (props.selected ? "0 4px 12px rgba(106, 76, 147, 0.3)" : "0 2px 6px rgba(0, 0, 0, 0.1)")};

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
    box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    width: ${(props) => Math.max(props.size - 12, 24)}px;
    height: ${(props) => Math.max(props.size - 12, 24)}px;
  }

  @media (max-width: 480px) {
    width: ${(props) => Math.max(props.size - 16, 20)}px;
    height: ${(props) => Math.max(props.size - 16, 20)}px;
  }

  @media (max-width: 320px) {
    width: ${(props) => Math.max(props.size - 20, 18)}px;
    height: ${(props) => Math.max(props.size - 20, 18)}px;
  }
`;

const Label = styled.span`
  font-size: 18px;
  color: ${(props) => (props.side === "left" ? "#6A4C93" : "#3AA87A")};
  width: 60px;
  text-align: center;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 14px;
    width: 50px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    width: 100%;
    margin: 4px 0;
  }

  @media (max-width: 320px) {
    font-size: 10px;
    margin: 2px 0;
  }
`;

const CircleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;

  @media (max-width: 768px) {
    gap: 8px;
  }

  @media (max-width: 480px) {
    gap: 4px;
    order: 2;
    margin: 8px 0;
  }

  @media (max-width: 320px) {
    gap: 2px;
    margin: 4px 0;
  }
`;

const ButtonGroup = styled.div`
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 40px;

  @media (max-width: 768px) {
    gap: 16px;
    margin-top: 24px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-top: 20px;
  }

  @media (max-width: 320px) {
    gap: 8px;
    margin-top: 16px;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, rgba(30,31,19,0.9) 0%, rgba(43,57,147,0.9) 100%);
  color: white;
  font-size: 24px;
  padding: 16px 40px;
  border: 3px solid rgba(43, 57, 147, 0.2);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(43, 57, 147, 0.2);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(43, 57, 147, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    font-size: 18px;
    padding: 12px 24px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    padding: 10px 20px;
    width: 100%;
    max-width: 180px;
  }

  @media (max-width: 320px) {
    font-size: 14px;
    padding: 8px 16px;
    max-width: 160px;
  }
`;

export default function TestStep2() {
  const navigate = useNavigate();

  const questions = [
    "和別人親近會讓我覺得不舒服。",
    "我發現自己很容易和別人親近。",
    "即使沒有任何親近的情感關係我仍過得很自在。",
    "我想要情感上的親密關係，但卻很難完全信賴別人。",
    "對我來說，獨立和自給自足的感覺是非常重要的。",
    "我擔心如果和別人太親近會容易受到傷害。",
    "我會擔心別人並不那麼想跟我在一起。",
    "我不喜歡依賴別人。",
    "我會擔心別人不如我看重他們那樣的看重我。",
    "我不會擔心自己孤單一人。",
    "當別人太親近我時，會讓我感覺不自在。",
    "我會擔心別人並不真正喜歡我。",
    "我很少擔心別人不接納我。",
    "我寧可和別人保持距離以避免失望。",
    "當別人想要和我更親近時，我會感到不安焦慮。",
    "我對自己不滿意。",
    "通常我寧可自己一個人比較自由。",
    "我發現自己一直在尋求別人的接納並藉以肯定自己。",
    "我瞭解自己的優點與缺點，並且喜歡自己。",
    "我時常太過於在乎別人對我的看法。",
    "我可以很自在的讓別人依賴我。",
    "一個人的生活就可以過得很好了。",
    "即使別人不欣賞我，我仍然能肯定自己的價值。",
    "當我需要朋友的時候，總會找得到人的。"
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
      localStorage.setItem("step2Answers", JSON.stringify(answers));
      
      // 儲存到後端 - 修正：將 array 直接作為 step2Answers 傳送
      console.log("Saving step2 answers:", answers);
      await saveAssessment({ 
        step2Answers: answers,
        submittedAt: new Date().toISOString()
      });
      
      navigate("/test/step3");
    } catch (e) { 
      console.error("Save step2 failed:", e);
      alert(`儲存失敗：${e.message}，但可以繼續下一步`);
      navigate("/test/step3");
    } finally {
      setLoading(false);
    }
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
            <div onClick={() => navigate("/Home", { state: { scrollTo: "about" } })}>
              關於我們
            </div>
          </Nav>
          <AvatarImg src={userIcon} alt="user avatar" onClick={() => navigate("/profile")} />
        </RightSection>
      </Header>

      <StepIndicatorWrapper>
        <StepIndicator currentStep={2} />
      </StepIndicatorWrapper>

      <Main>
        <Title>Step2 情感連結風格</Title>
        <Subtitle>請根據您的真實感受，選擇最符合的選項。<br />越靠左側表示越不同意，越靠右側表示越同意，中間則代表中立或一般程度。</Subtitle>
        <QuestionList>
          {questions.map((q, i) => (
            <QuestionItem key={i}>
              {q}
              <ScaleWrapper>
                <Label side="left">不同意</Label>
                <CircleRow>
                  {[1, 2, 3, 4, 5, 6, 7].map((n, idx) => (
                    <Circle
                      key={n}
                      size={48 + Math.abs(4 - n) * 4}
                      index={idx}
                      selected={answers[i] === n}
                      onClick={() => handleSelect(i, n)}
                    />
                  ))}
                </CircleRow>
                <Label side="right">同意</Label>
              </ScaleWrapper>
            </QuestionItem>
          ))}
        </QuestionList>

        <ButtonGroup>
          <Button onClick={() => navigate("/test/step1")} disabled={loading}>返回上一步</Button>
          <Button onClick={handleNext} disabled={loading}>
            {loading ? "處理中..." : "繼續作答"}
          </Button>
        </ButtonGroup>
      </Main>
    </Container>
  );
}