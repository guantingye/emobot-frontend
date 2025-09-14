// src/components/MoodTrail.jsx
import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

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
  display: flex;
  justify-content: space-between;
  padding: 16px 48px; /* 向內縮，避免裁切 */
  position: fixed;
  top: 0;
  left: 0;
  z-index: 20;
`;


const Btn = styled.button`
  border: 0;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  color: #fff;
`;

const BackBtn = styled(Btn)`
  background: #2b3993;
`;

const DownloadBtn = styled(Btn)`
  background: #4caf50;
`;

const GridPanel = styled.div`
  flex: 1;
  margin: 100px auto 40px auto;
  width: 85%;
  height: 80%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr; /* 兩列 */
  gap: 32px;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e7e7ef;
  border-radius: 20px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: bold;
  color: #000;
  padding: 20px;
`;

/* 左上：情緒頻率圖 */
const LeftTop = styled(Card)`
  grid-column: 1;
  grid-row: 1;
`;

/* 左下：情緒強度圖 */
const LeftBottom = styled(Card)`
  grid-column: 1;
  grid-row: 2;
`;

/* 右上：議題雷達圖 → 高度 3 份 */
const RightTop = styled(Card)`
  grid-column: 2;
  grid-row: 1;
  height: 135%; /* 3:2 比例，上大 */
  align-self: start;
`;

/* 右下：高風險提示 → 高度 2 份 */
const RightBottom = styled(Card)`
  grid-column: 2;
  grid-row: 2;
  height: 40%; /* 3:2 比例，下小 */
  align-self: end;
  font-size: 18px;
  line-height: 1.6;
  text-align: center;
`;

export default function MoodTrail() {
  const nav = useNavigate();

  const handleDownload = () => {
    alert("下載圖片功能待實作");
  };

  return (
    <Wrap>
      {/* 固定在最上方的按鈕 */}
      <Header>
        <BackBtn onClick={() => nav(-1)}>返回</BackBtn>
        <DownloadBtn onClick={handleDownload}>下載圖片</DownloadBtn>
      </Header>

      {/* 中間的面板 */}
      <GridPanel>
        <LeftTop>情緒頻率圖</LeftTop>
        <RightTop>議題雷達圖</RightTop>
        <LeftBottom>情緒強度圖</LeftBottom>
        <RightBottom>⚠️ 高風險提示語</RightBottom>
      </GridPanel>
    </Wrap>
  );
}
