import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import userIcon from "../assets/profile.png";
import StepIndicator from "./StepIndicator";
import logoIcon from "../assets/logofig.png";
import { saveAssessment } from "../api/client";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: #e8e8e8;
  font-family: "Noto Sans TC", sans-serif;
  overflow-x: hidden;
`;

const Header = styled.header`
  width: 100%; height: 70px; background: white;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 30px; position: fixed; top: 0; left: 0; z-index: 10;
  box-shadow: 0 2px 10px rgba(0,0,0,.1);
  @media (max-width: 1024px){ height: 64px; padding: 0 16px; }
`;

const Logo = styled.div`
  font-size: 35px; font-weight: bold; color: #2b3993; display: flex; align-items: center; cursor: pointer; transition: .3s;
  &:hover { transform: scale(1.05); }
  img{ height: 68px; margin-right: 8px; }
  @media (max-width: 480px){ font-size: 28px; img{ height: 54px; } }
`;

const RightSection = styled.div`
  display:flex; align-items:center; gap:30px; margin-left:auto; margin-right:16px;
  @media (max-width: 1024px){ gap:16px; }
`;

const Nav = styled.nav`
  display:flex; gap:40px; font-size:26px; font-weight:bold; color:black;
  div{ cursor:pointer; transition:.2s; &:hover{ color:#2b3993; transform: translateY(-2px); } &:active{ transform: translateY(1px); } }
  @media (max-width: 1024px){ gap:20px; font-size:18px; }
  @media (max-width: 640px){ display:none; }
`;

const AvatarImg = styled.img`
  width:50px; height:50px; border-radius:50%; object-fit:cover; cursor:pointer; transition:.3s;
  &:hover{ transform:scale(1.1); box-shadow:0 4px 8px rgba(0,0,0,.2); }
`;

const StepIndicatorWrapper = styled.div` margin-top: 100px; `;

const Main = styled.main`
  max-width: 900px; width: 92%; margin: 20px auto 40px;
  background:white; border:2px solid #d0d0d0; border-radius:20px;
  padding: clamp(18px, 3vw, 50px);
  animation:${fadeInUp} .8s ease-in-out;
`;

const Title = styled.h2` font-size: clamp(22px, 3vw, 36px); font-weight: 800; text-align:center; margin-bottom: 16px; `;
const Subtitle = styled.p`
  font-size: clamp(14px, 2.1vw, 18px); color:#444; line-height:1.7; text-align:center;
  max-width: 720px; margin: 0 auto 18px; background:#f9f9f9; padding:12px 16px; border-radius:8px; border:1px solid #eee;
`;

const QuestionList = styled.ul` font-size: clamp(16px, 2.1vw, 20px); color:#333; padding-left:0; `;
const QuestionItem = styled.li` list-style: decimal; margin: 0 0 28px 18px; `;

const ScaleWrapper = styled.div`
  display:flex; align-items:center; justify-content:center; gap:18px; margin-top: 14px; flex-wrap: wrap;
  @media (max-width: 480px){ transform: scale(0.92); transform-origin:center; }
`;

const Circle = styled.div`
  width: ${(p)=>p.size}px; height: ${(p)=>p.size}px; border-radius:50%;
  border: 2px solid
    ${(p)=> p.selected
      ? p.index < 3 ? "#6A4C93" : p.index === 3 ? "#aaa" : "#3AA87A"
      : p.index < 3 ? "#6A4C93" : p.index === 3 ? "#aaa" : "#3AA87A"};
  background: ${(p)=> p.selected
      ? p.index < 3 ? "#6A4C93" : p.index === 3 ? "#aaa" : "#3AA87A"
      : "transparent"};
  cursor:pointer; transition:.2s;
  &:hover{ transform: scale(1.1); box-shadow:0 0 6px rgba(0,0,0,.2); }
  &:active{ transform: scale(.95); box-shadow: inset 0 0 4px rgba(0,0,0,.3); }
`;

const Label = styled.span` font-size:14px; color:#666; width:60px; text-align:center; `;

const ButtonGroup = styled.div` display:flex; justify-content:center; gap:16px; flex-wrap:wrap; `;
const Button = styled.button`
  background: rgba(30,31,19,.85); color:white; font-size: 18px; padding: 10px 24px; border:3px solid #f5fbf2; border-radius:999px; cursor:pointer; transition:.2s;
  &:hover{ transform: scale(1.05); } &:disabled{ opacity:.6; cursor:not-allowed; }
  @media (max-width: 480px){ width:100%; }
`;

export default function TestStep2() {
  const navigate = useNavigate();

  const questions = [
    "和別人親近會讓我覺得不舒服。","我發現自己很容易和別人親近。","即使沒有任何親近的情感關係我仍過得很自在。",
    "我想要情感上的親密關係，但卻很難完全信賴別人。","對我來說，獨立和自給自足的感覺是非常重要的。","我擔心如果和別人太親近會容易受到傷害。",
    "我會擔心別人並不那麼想跟我在一起。","我不喜歡依賴別人。","我會擔心別人不如我看重他們那樣的看重我。","我不會擔心自己孤單一人。",
    "當別人太親近我時，會讓我感覺不自在。","我會擔心別人並不真正喜歡我。","我很少擔心別人不接納我。","我寧可和別人保持距離以避免失望。",
    "當別人想要和我更親近時，我會感到不安焦慮。","我對自己不滿意。","通常我寧可自己一個人比較自由。","我發現自己一直在尋求別人的接納並藉以肯定自己。",
    "我瞭解自己的優點與缺點，並且喜歡自己。","我時常太過於在乎別人對我的看法。","我可以很自在的讓別人依賴我。","一個人的生活就可以過得很好了。",
    "即使別人不欣賞我，我仍然能肯定自己的價值。"
  ];

  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [loading, setLoading] = useState(false);

  const handleSelect = (qi, score) => {
    const next = [...answers]; next[qi] = score; setAnswers(next);
  };

  const handleNext = async () => {
    if (!answers.every(a => a !== null)) { alert("請完成所有題目的回答。"); return; }
    setLoading(true);
    try {
      localStorage.setItem("step2Answers", JSON.stringify(answers));
      await saveAssessment({ step2Answers: answers });
      navigate("/test/step3");
    } catch (e) {
      console.error("Save step2 failed:", e);
      alert(`儲存失敗：${e.message}，但可以繼續下一步`);
      navigate("/test/step3");
    } finally { setLoading(false); }
  };

  return (
    <Page>
      <Header>
        <Logo onClick={() => navigate("/Home")}><img src={logoIcon} alt="logo" />Emobot+</Logo>
        <RightSection>
          <Nav>
            <div onClick={() => navigate("/Home")}>主頁</div>
            <div onClick={() => navigate("/Home#robots")}>機器人介紹</div>
            <div onClick={() => navigate("/Home", { state: { scrollTo: "about" } })}>關於我們</div>
          </Nav>
          <AvatarImg src={userIcon} alt="user avatar" onClick={() => navigate("/profile")} />
        </RightSection>
      </Header>

      <StepIndicatorWrapper><StepIndicator currentStep={2} /></StepIndicatorWrapper>

      <Main>
        <Title>Step2 情感連結風格</Title>
        <Subtitle>請根據你的真實感受作答。越靠左代表越不同意，越靠右代表越同意，中間則代表一般/中立。</Subtitle>
        <QuestionList>
          {questions.map((q, i) => (
            <QuestionItem key={i}>
              {q}
              <ScaleWrapper>
                <Label>不同意</Label>
                {[1,2,3,4,5,6,7].map((n, idx) => (
                  <Circle
                    key={n}
                    size={48 + Math.abs(3 - idx) * 4}
                    index={idx}
                    selected={answers[i] === n}
                    onClick={() => handleSelect(i, n)}
                  />
                ))}
                <Label>同意</Label>
              </ScaleWrapper>
            </QuestionItem>
          ))}
        </QuestionList>

        <ButtonGroup>
          <Button onClick={() => navigate("/test/step1")} disabled={loading}>返回上一步</Button>
          <Button onClick={handleNext} disabled={loading}>{loading ? "處理中..." : "繼續作答"}</Button>
        </ButtonGroup>
      </Main>
    </Page>
  );
}
