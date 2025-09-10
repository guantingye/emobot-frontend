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

// 全頁滾動的容器（保留原框架視覺）
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
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  position: fixed;
  top: 0; 
  left: 0;
  box-shadow: 0 4px 20px rgba(43, 57, 147, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  z-index: 10;
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
  }
`;

const Content = styled.main`
  padding-top: 90px;
  padding-bottom: 40px;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    padding-top: 80px;
    padding-bottom: 20px;
  }

  @media (max-width: 480px) {
    padding-top: 75px;
    padding-bottom: 16px;
  }
`;

const Inner = styled.div`
  width: 100%;
  max-width: 960px;
  padding: 0 16px;

  @media (max-width: 480px) {
    padding: 0 12px;
  }
`;

const StepIndicatorBox = styled.div` 
  margin-bottom: 20px; 

  @media (max-width: 768px) {
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

const Card = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border: 2px solid rgba(43, 57, 147, 0.1);
  border-radius: 20px;
  padding: 36px;
  text-align: center;
  animation: ${fadeIn} .8s ease;
  box-shadow: 0 8px 32px rgba(43, 57, 147, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);

  @media (max-width: 860px) { 
    padding: 24px 20px; 
    border-radius: 16px; 
  }

  @media (max-width: 480px) {
    padding: 20px 16px;
    border-radius: 12px;
    margin: 0 4px;
  }
`;

const Title = styled.h2`
  font-size: 32px; 
  font-weight: 800; 
  margin-bottom: 6px;
  background: linear-gradient(135deg, #2b3993 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(43, 57, 147, 0.1);

  @media (max-width: 860px) { 
    font-size: 24px; 
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const Subtitle = styled.p`
  font-size: 18px; 
  color: #555; 
  margin-bottom: 24px;

  @media (max-width: 860px) { 
    font-size: 16px; 
  }

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  max-width: 720px;
  margin: 0 auto 24px;

  @media (max-width: 768px) {
    gap: 20px;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    gap: 16px;
  }
`;

// 重新設計的 MBTI 維度容器
const DimensionContainer = styled.div`
  border: 1.5px solid rgba(43, 57, 147, 0.15);
  border-radius: 16px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(43, 57, 147, 0.05);

  &:hover {
    border-color: rgba(43, 57, 147, 0.3);
    box-shadow: 0 4px 16px rgba(43, 57, 147, 0.1);
    transform: translateY(-2px);
  }

  @media (max-width: 640px) { 
    padding: 20px 16px;
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
    border-radius: 12px;
  }
`;

const DimensionTitle = styled.h3`
  font-size: 20px;
  font-weight: 800;
  color: #2b3993;
  text-align: center;
  margin-bottom: 20px;

  @media (max-width: 640px) {
    font-size: 18px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 12px;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;

  @media (max-width: 640px) {
    width: 100%;
    max-width: 200px;
  }
`;

const OptionButton = styled.button`
  appearance: none;
  border: 2px solid ${p => (p.$active ? "#2b3993" : "#d7d7d7")};
  background: ${p => (p.$active ? "linear-gradient(135deg, #2b3993 0%, #667eea 100%)" : "white")};
  color: ${p => (p.$active ? "white" : "#222")};
  font-size: 24px;
  font-weight: 800;
  border-radius: 999px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all .3s ease;
  box-shadow: ${p => (p.$active ? "0 4px 16px rgba(43,57,147,.25)" : "0 2px 8px rgba(0,0,0,.05)")};
  min-width: 80px;
  min-height: 60px;
  margin-bottom: 12px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${p => (p.$active ? "0 6px 20px rgba(43,57,147,.35)" : "0 4px 12px rgba(0,0,0,.1)")};
  }
  
  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    font-size: 20px;
    padding: 14px 18px;
    min-width: 70px;
    min-height: 50px;
    width: 100%;
    max-width: 120px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    padding: 12px 16px;
    min-width: 60px;
    min-height: 45px;
    max-width: 100px;
  }
`;

const OptionLabel = styled.div`
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 1.3;
  max-width: 120px;

  @media (max-width: 640px) {
    font-size: 13px;
    max-width: 100px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    max-width: 90px;
  }
`;

const VersusText = styled.div`
  font-size: 18px;
  color: #888;
  font-weight: 600;
  align-self: center;
  margin-top: 20px;

  @media (max-width: 640px) {
    margin-top: 0;
    margin: 8px 0;
    font-size: 16px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const Hint = styled.p` 
  font-size: 16px; 
  color: #777; 
  margin-top: 8px; 
  margin-bottom: 24px; 

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

const ButtonRow = styled.div` 
  display: flex; 
  justify-content: center; 
  gap: 20px; 
  flex-wrap: wrap; 

  @media (max-width: 480px) {
    gap: 12px;
    flex-direction: column;
    align-items: center;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, rgba(30,31,19,0.9) 0%, rgba(43,57,147,0.9) 100%);
  color: white; 
  font-size: 18px; 
  padding: 12px 26px;
  border: 3px solid rgba(43, 57, 147, 0.2); 
  border-radius: 999px;
  cursor: pointer; 
  transition: all .3s ease;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(43, 57, 147, 0.2);
  min-height: 48px;
  
  &:hover { 
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(43, 57, 147, 0.3);
  }
  
  &:disabled { 
    opacity: .55; 
    cursor: not-allowed; 
    transform: none;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    padding: 12px 24px;
    width: 100%;
    max-width: 200px;
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #fee 0%, #fdd 100%); 
  border: 1px solid #fcc; 
  border-radius: 8px;
  color: #c33; 
  font-size: 16px; 
  margin: 10px 0; 
  padding: 12px; 
  text-align: center;

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 10px;
  }
`;

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #efe 0%, #dfd 100%); 
  border: 1px solid #cfc; 
  border-radius: 8px;
  color: #363; 
  font-size: 16px; 
  margin: 10px 0; 
  padding: 12px; 
  text-align: center;

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 10px;
  }
`;

// 子元件：二擇一選項
function DimensionSelector({ title, left, right, value, onChange }) {
  return (
    <DimensionContainer role="group" aria-label={title}>
      <DimensionTitle>{title}</DimensionTitle>
      <OptionsContainer>
        <OptionGroup>
          <OptionButton 
            aria-pressed={value === left.letter} 
            $active={value === left.letter} 
            onClick={() => onChange(left.letter)}
          >
            {left.letter}
          </OptionButton>
          <OptionLabel>{left.desc}</OptionLabel>
        </OptionGroup>
        
        <VersusText>vs</VersusText>
        
        <OptionGroup>
          <OptionButton 
            aria-pressed={value === right.letter} 
            $active={value === right.letter} 
            onClick={() => onChange(right.letter)}
          >
            {right.letter}
          </OptionButton>
          <OptionLabel>{right.desc}</OptionLabel>
        </OptionGroup>
      </OptionsContainer>
    </DimensionContainer>
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
  const [error, setError] = useState("");
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
    setError(""); 
    setSuccess("");

    if (!allPicked) {
      setError("請完成四個維度的選擇（外向/內向、直覺/實感、思考/情感、知覺/判斷）。");
      return;
    }
  
    setLoading(true);
    try {
      console.log("Saving MBTI data:", { mbti, encoded });
      
      // 本地也存一份（與 Step5 保持一致）
      localStorage.setItem("step1MBTI", JSON.stringify(encoded));

      // 修正：直接傳送 MBTI 字串和編碼陣列
      await saveAssessmentMBTI(mbti, encoded);

      setSuccess("MBTI 資料已成功儲存！");
      setTimeout(() => navigate("/test/step2"), 800);
    } catch (e) {
      console.error("MBTI save error:", e);
      setError(`儲存失敗：${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
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

      <Content>
        <Inner>
          <StepIndicatorBox>
            <StepIndicator currentStep={1} />
          </StepIndicatorBox>

          <Card>
            <Title>Step1 MBTI 人格特質</Title>
            <Subtitle>請在每個維度中選擇最符合自己的傾向</Subtitle>

            <Grid>
              <DimensionSelector
                title="外向 vs 內向"
                left={{ letter: "E", desc: "Extraversion" }}
                right={{ letter: "I", desc: "Introversion" }}
                value={EorI}
                onChange={setEorI}
              />
              <DimensionSelector
                title="直覺 vs 實感"
                left={{ letter: "N", desc: "iNtuition" }}
                right={{ letter: "S", desc: "Sensing" }}
                value={NorS}
                onChange={setNorS}
              />
              <DimensionSelector
                title="思考 vs 情感"
                left={{ letter: "T", desc: "Thinking" }}
                right={{ letter: "F", desc: "Feeling" }}
                value={TorF}
                onChange={setTorF}
              />
              <DimensionSelector
                title="知覺 vs 判斷"
                left={{ letter: "P", desc: "Perceiving" }}
                right={{ letter: "J", desc: "Judging" }}
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