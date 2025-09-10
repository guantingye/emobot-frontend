// src/components/MoodTrail.jsx
import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Wrap = styled.div`
  min-height: 100dvh;
  background: #f6f7fb;
  font-family: "Noto Sans TC", sans-serif;
  padding: 24px;
`;

const Card = styled.div`
  max-width: 880px;
  margin: 40px auto;
  background: #fff;
  border: 1px solid #e7e7ef;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.06);
  padding: 28px;
`;

const Title = styled.h1`
  font-size: 28px;
  margin: 0 0 12px 0;
  color: #2b3993;
  font-weight: 800;
`;

const P = styled.p`
  font-size: 18px;
  color: #333;
  line-height: 1.8;
`;

const Back = styled.button`
  margin-top: 20px;
  border: 0;
  padding: 10px 16px;
  border-radius: 999px;
  background: #2b3993;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
`;

export default function MoodTrail() {
  const nav = useNavigate();
  return (
    <Wrap>
      <Card>
        <Title>心情足跡</Title>
        <P>（示範頁）這裡之後換成你要的內容。</P>
        <Back onClick={() => nav(-1)}>返回</Back>
      </Card>
    </Wrap>
  );
}
