// src/components/MoodTrail.jsx
import React, { useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import html2canvas from "html2canvas";

const Wrap = styled.div`
  width: 100vw;
  height: 100vh;
  background: #f6f7fb;
  font-family: "Noto Sans TC", sans-serif;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 40;

  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(43, 57, 147, 0.08);
  box-shadow: 0 4px 18px rgba(43, 57, 147, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px;

  @media (max-width: 768px) {
    padding: 12px 20px;
  }

  @media (max-width: 480px) {
    padding: 10px 16px;
  }
`;

const BtnGroup = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 0;
  padding: 14px 20px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  color: #fff;
  font-size: 16px;
  line-height: 1;
  box-shadow: 0 6px 16px rgba(43, 57, 147, 0.18);
  transform: translateY(0);
  transition: transform 0.12s ease, box-shadow 0.2s ease, opacity 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(43, 57, 147, 0.22);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(43, 57, 147, 0.16);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 12px 18px;
    font-size: 15px;
    gap: 8px;
  }

  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 14px;
    gap: 6px;
  }
`;

const BackBtn = styled(Btn)`
  background: #2b3993;
`;

const DownloadBtn = styled(Btn)`
  background: #4caf50;
  margin-right: 55px;

  @media (max-width: 768px) {
    margin-right: 0;
  }
`;

const PageTitle = styled.div`
  font-weight: 800;
  font-size: 20px;
  color: #2b2f43;
  letter-spacing: 0.2px;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    display: none;
  }
`;

const Content = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  overflow: auto;
`;

const GridPanel = styled.div`
  margin: 96px auto 40px auto;
  width: min(1200px, 88vw);
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: minmax(260px, 1.5fr) minmax(160px, 0.5fr);
  gap: 28px;

  @media (max-width: 1024px) {
    width: 92vw;
    gap: 24px;
    margin: 90px auto 32px auto;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    gap: 20px;
  }

  @media (max-width: 768px) {
    width: 94vw;
    gap: 18px;
    margin: 80px auto 28px auto;
  }

  @media (max-width: 480px) {
    width: 96vw;
    gap: 16px;
    margin: 70px auto 24px auto;
  }
`;

const Card = styled.div`
  position: relative;
  background: #fff;
  border: 1px solid #e7e7ef;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;

  @media (max-width: 768px) {
    padding: 18px;
    border-radius: 18px;
    min-height: 200px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 16px;
    min-height: 180px;
  }
`;

const SectionTitle = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 800;
  color: #2b3993;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e6e9f5;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 8px rgba(43,57,147,0.08);
  letter-spacing: 0.3px;
  user-select: none;

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 5px 9px;
    top: 12px;
    left: 12px;
  }

  @media (max-width: 480px) {
    font-size: 11.5px;
    padding: 5px 8px;
    top: 10px;
    left: 10px;
  }
`;

const Placeholder = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1b1f33;
  opacity: 0.85;
  text-align: center;
  padding: 0 10px;

  @media (max-width: 768px) {
    font-size: 16px;
  }

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const LeftTop = styled(Card)`
  grid-column: 1;
  grid-row: 1;

  @media (max-width: 900px) {
    grid-column: 1;
    grid-row: auto;
  }
`;

const LeftBottom = styled(Card)`
  grid-column: 1;
  grid-row: 2 / 4;
  min-height: 160px;

  @media (max-width: 900px) {
    grid-column: 1;
    grid-row: auto;
    min-height: 200px;
  }
`;

const RightTop = styled(Card)`
  grid-column: 2;
  grid-row: 1 / 3;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 900px) {
    grid-column: 1;
    grid-row: auto;
    min-height: 280px;
  }
`;

const RightBottom = styled(Card)`
  grid-column: 2;
  grid-row: 3;
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 900px) {
    grid-column: 1;
    grid-row: auto;
    min-height: 140px;
  }
`;

export default function MoodTrail() {
  const nav = useNavigate();
  const panelRef = useRef(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    if (!panelRef.current || isDownloading) return;

    try {
      setIsDownloading(true);

      const element = panelRef.current;
      const padding = 40;

      const canvas = await html2canvas(element, {
        backgroundColor: "#f6f7fb",
        scale: 2,
        useCORS: true,
        logging: false,
        width: element.offsetWidth + padding * 2,
        height: element.offsetHeight + padding * 2,
        x: -padding,
        y: -padding,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "心情足跡圖.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, "image/png");

    } catch (error) {
      console.error("下載圖片時發生錯誤:", error);
      alert("下載圖片失敗，請稍後再試");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Wrap>
      <Header>
        <BtnGroup>
          <BackBtn onClick={() => nav(-1)}>
            <FiArrowLeft size={18} /> 返回
          </BackBtn>
        </BtnGroup>

        <PageTitle>心情足跡・MoodTrail</PageTitle>

        <BtnGroup>
          <DownloadBtn onClick={handleDownload} disabled={isDownloading}>
            <FiDownload size={18} /> {isDownloading ? "下載中..." : "下載圖片"}
          </DownloadBtn>
        </BtnGroup>
      </Header>

      <Content>
        <GridPanel ref={panelRef}>
          <LeftTop>
            <SectionTitle>情緒頻率圖</SectionTitle>
            <Placeholder>（此處渲染你的情緒頻率圖表）</Placeholder>
          </LeftTop>

          <LeftBottom>
            <SectionTitle>情緒強度圖</SectionTitle>
            <Placeholder>（此處渲染你的情緒強度圖表）</Placeholder>
          </LeftBottom>

          <RightTop>
            <SectionTitle>議題雷達圖</SectionTitle>
            <Placeholder>（此處渲染你的議題雷達圖）</Placeholder>
          </RightTop>

          <RightBottom>
            <SectionTitle>高風險提示語</SectionTitle>
            <Placeholder>⚠️ 依 AI 摘要生成的提醒敘述</Placeholder>
          </RightBottom>
        </GridPanel>
      </Content>
    </Wrap>
  );
}