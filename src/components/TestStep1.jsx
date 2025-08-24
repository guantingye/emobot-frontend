// src/components/TestStep1.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import userIcon from "../assets/profile.png";
import StepIndicator from "./StepIndicator";
import logoIcon from "../assets/logofig.png";
import { saveAssessmentMBTI } from "../api/client";

// 動畫
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// 允許捲動的頁面容器（保留原框架視覺）
const Page = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: #e8e8e8;
  font-family: "Noto Sans TC", sans-serif;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
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
  top: 0; left: 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 10;
`;

const Logo = styled.div`
  font-size: 35px;
  font-weight: bold;
  color: #2b3993;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform .3s ease;
  &:hover { transform: scale(1.05); }
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
    transition: color .3s ease, transform .2s ease;
    &:hover { color: #2b3993; transform: translateY(-2px); }
    &:active { transform: translateY(1px); }
  }
  @media (max-width: 900px) { gap: 20px; font-size: 20px; }
`;

const AvatarImg = styled.img`
  width: 50px; height: 50px; border-radius: 50%;
  object-fit: cover; cursor: pointer;
  transition: transform .3s ease, box-shadow .3s ease;
  &:hover { transform: scale(1.08); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
`;

const Content = styled.main`
  padding-top: 90px;
  padding-bottom: 40px;
  display: flex;
  justify-content: center;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 960px;
  padding: 0 16px;
`;

const StepIndicatorBox = styled.div` margin-bottom: 20px; `;

const Card = styled.div`
  background: white;
  border: 2px solid #d0d0d0;
  border-radius: 20px;
  padding: 36px;
  text-align: center;
  animation: ${fadeIn} .8s ease;
  @media (max-width: 860px) { padding: 22px 16px; border-radius: 16px; }
`;

const Title = styled.h2`
  font-size: 32px; font-weight: 800; margin-bottom: 6px;
  @media (max-width: 860px) { font-size: 24px; }
`;
const Subtitle = styled.p`
  font-size: 18px; color: #555; margin-bottom: 24px;
  @media (max-width: 860px) { font-size: 16px; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  max-width: 720px;
  margin: 0 auto 12px;
`;

const Group = styled.div`
  display: grid;
  grid-template-columns: 1fr 160px 1fr;
  align-items: center; gap: 12px;
  padding: 16px 18px;
  border: 1.5px solid #e5e5e5;
  border-radius: 14px;
  background: #fafafa;
  @media (max-width: 640px) { grid-template-columns: 1fr; text-align: center; }
`;

const DimLabel = styled.div` font-size: 16px; color: #666; @media (max-width: 640px) { order: 2; } `;
const DimTitle = styled.div` font-size: 18px; font-weight: 800; color: #222; text-align: center; @media (max-width: 640px) { order: 1; margin-bottom: 6px; } `;
const Center = styled.div` display: flex; align-items: center; justify-content: center; gap: 10px; `;

const Pill = styled.button`
  appearance: none;
  border: 2px solid ${p => (p.$active ? "#2b3993" : "#d7d7d7")};
  background: ${p => (p.$active ? "#2b3993" : "white")};
  color: ${p => (p.$active ? "white" : "#222")};
  font-size: 18px; font-weight: 800;
  border-radius: 999px; padding: 10px 16px;
  cursor: pointer; transition: all .15s ease;
  box-shadow: ${p => (p.$active ? "0 4px 10px rgba(43,57,147,.25)" : "none")};
  &:hover { transform: translateY(-1px); }
  &:active { transform: translateY(0); }
  @media (max-width: 640px) { width: 100%; }
`;

const Hint = styled.p` font-size: 16px; color: #777; margin-top: 8px; margin-bottom: 24px; `;
const ButtonRow = styled.div` display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; `;
const Button = styled.button`
  background: rgba(30,31,19,0.9);
  color: white; font-size: 18px; padding: 12px 26px;
  border: 3px solid #f5fbf2; border-radius: 999px;
  cursor: pointer; transition: all .2s;
  &:hover { transform: scale(1.03); }
  &:disabled { opacity: .55; cursor: not-allowed; }
`;

const ErrorMessage = styled.div`
  background: #fee; border: 1px solid #fcc; border-radius: 8px;
  color: #c33; font-size: 16px; margin: 10px 0; padding: 12px; text-align: center;
`;
const SuccessMessage = styled.div`
  background: #efe; border: 1px solid #cfc; border-radius: 8px;
  color: #363; font-size: 16px; margin: 10px 0; padding: 12px; text-align: center;
`;

// 子元件：二擇一
function PairSelector({ title, left, right, value, onChange }) {
  return (
    <Group role="group" aria-label={title}>
      <DimLabel>{left.desc}</DimLabel>
      <Center><DimTitle>{title}</DimTitle></Center>
      <DimLabel style={{ textAlign: "right" }}>{right.desc}</DimLabel>

      <Pill aria-pressed={value === left.letter} $active={value === left.letter} onClick={() => onChange(left.letter)}>
        {left.letter}
      </Pill>
      <div />
      <Pill aria-pressed={value === right.letter} $active={value === right.letter} onClick={() => onChange(right.letter)}>
        {right.letter}
      </Pill>
    </Group>
  );
}

// 主元件
export default function TestStep1() {
  const navigate = useNavigate();

  const [EorI, setEorI] = useState("");
  const [NorS, setNorS] = useState("");
  const [TorF, setTorF] = useState("");
  const [PorJ, setPorJ] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const allPicked = EorI && NorS && TorF && PorJ;
  const mbti = `${EorI}${NorS}${TorF}${PorJ}`.toUpperCase();
  const encoded = [
    EorI === "E" ? 1 : 0,
    NorS === "N" ? 1 : 0,
    TorF === "T" ? 1 : 0,
    PorJ === "P" ? 1 : 0,
  ];

  const handleNext = async () => {
    setError(""); setSuccess("");

    if (!allPicked) {
      setError("請完成四個維度的選擇（外向/內向、直覺/實感、思考/情感、知覺/判斷）。");
      return;
    }

    setLoading(true);
    try {
      // 與你 Step5 保持一致：本地也存一份
      localStorage.setItem("step1MBTI", JSON.stringify(encoded));

      // ✅ 多形容錯：字串 → 物件 → 扁平
      await saveAssessmentMBTI(mbti, encoded);

      setSuccess("MBTI 資料已成功儲存！");
      setTimeout(() => navigate("/test/step2"), 800);
    } catch (e) {
      setError(`儲存失敗：${e.message}`);
      console.warn("RAW server error:", e.raw);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Header>
        <Logo onClick={() => navigate("/Home")}>
          <img src={logoIcon} alt="logo" style={{ height: 68, marginRight: 8 }} />
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

      <Content>
        <Inner>
          <StepIndicatorBox>
            <StepIndicator currentStep={1} />
          </StepIndicatorBox>

          <Card>
            <Title>step1 mbti 人格特質</Title>
            <Subtitle>請在每個維度中選擇最符合自己的傾向</Subtitle>

            <Grid>
              <PairSelector
                title="外向 vs 內向"
                left={{ letter: "E", desc: "外向 Extraversion" }}
                right={{ letter: "I", desc: "內向 Introversion" }}
                value={EorI}
                onChange={setEorI}
              />
              <PairSelector
                title="直覺 vs 實感"
                left={{ letter: "N", desc: "直覺 iNtuition" }}
                right={{ letter: "S", desc: "實感 Sensing" }}
                value={NorS}
                onChange={setNorS}
              />
              <PairSelector
                title="思考 vs 情感"
                left={{ letter: "T", desc: "思考 Thinking" }}
                right={{ letter: "F", desc: "情感 Feeling" }}
                value={TorF}
                onChange={setTorF}
              />
              <PairSelector
                title="知覺 vs 判斷"
                left={{ letter: "P", desc: "知覺 Perceiving" }}
                right={{ letter: "J", desc: "判斷 Judging" }}
                value={PorJ}
                onChange={setPorJ}
              />
            </Grid>

            <Hint>目前選擇：<b>{allPicked ? mbti : "—"}</b></Hint>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <ButtonRow>
              <Button onClick={() => window.open("https://www.16personalities.com/tw", "_blank")} disabled={loading}>
                前往 MBTI 測驗
              </Button>
              <Button onClick={handleNext} disabled={loading || !allPicked}>
                {loading ? "處理中..." : "填完，下一步！"}
              </Button>
            </ButtonRow>
          </Card>
        </Inner>
      </Content>
    </Page>
  );
}
