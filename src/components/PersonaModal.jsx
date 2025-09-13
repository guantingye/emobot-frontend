import React, { useEffect } from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20, 24, 40, 0.45);
  backdrop-filter: blur(6px);
  display: ${(p) => (p.open ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  width: min(760px, 92vw);
  background: linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(247,250,255,0.98) 100%);
  border: 1px solid rgba(43, 57, 147, 0.12);
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(18, 28, 80, 0.28), 0 6px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  position: relative;
`;

const TopBar = styled.div`
  height: 6px;
  background: linear-gradient(135deg, ${(p) => p.$accentStart} 0%, ${(p) => p.$accentEnd} 100%);
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  padding: 24px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const AvatarWrap = styled.div`
  position: relative;
  display: grid;
  place-items: center;
`;

const Avatar = styled.img`
  width: 180px; height: 200px; object-fit: cover; border-radius: 16px;
  box-shadow: 0 14px 38px rgba(0,0,0,0.18);
  @media (max-width: 640px) { width: 140px; height: 160px; }
`;

const Aura = styled.div`
  position: absolute;
  width: 260px; height: 260px; border-radius: 50%;
  background: radial-gradient(circle, ${(p) => p.$accentStart} 0%, ${(p) => p.$accentEnd} 60%, transparent 70%);
  filter: blur(24px);
  opacity: .25;
  z-index: -1;

  @media (prefers-reduced-motion: no-preference) {
    animation: auraPulse 5s ease-in-out infinite;
  }

  @keyframes auraPulse {
    0%,100% { transform: scale(0.96); opacity: .22; filter: blur(24px); }
    50% { transform: scale(1.04); opacity: .32; filter: blur(18px); }
  }
`;

const Title = styled.h3` margin: 0 0 6px 0; font-size: 26px; color: #1b2748; `;
const Sub = styled.div` font-size: 14px; color: #6b7aa0; margin-bottom: 10px; `;

const Quote = styled.div`
  margin: 12px 0 18px 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(103,126,234,0.07);
  border: 1px solid rgba(103,126,234,0.18);
  color: #445;
  font-weight: 600;
`;

const Para = styled.p`
  font-size: 15px; line-height: 1.8; color: #2a334d; margin: 8px 0 0 0;
  white-space: pre-line;
`;

const Row = styled.div` display: grid; gap: 10px; margin-top: 12px; `;

const Actions = styled.div`
  display: flex; justify-content: flex-end; gap: 12px;
  padding: 16px 20px; border-top: 1px solid rgba(0,0,0,0.06);
  @media (max-width: 640px) { justify-content: center; flex-wrap: wrap; }
`;

const GhostBtn = styled.button`
  background: transparent; color: #445; border: 1px solid rgba(68,85,170,0.25);
  padding: 10px 16px; border-radius: 12px; cursor: pointer; font-weight: 700;
  &:hover { background: rgba(68,85,170,0.08); }
`;

const PrimaryBtn = styled.button`
  background: linear-gradient(135deg, ${(p) => p.$accentStart} 0%, ${(p) => p.$accentEnd} 100%);
  color: #fff; border: none; padding: 10px 18px; border-radius: 12px; cursor: pointer; font-weight: 800;
  box-shadow: 0 10px 28px rgba(0,0,0,0.12);
  &:hover { filter: brightness(0.98); transform: translateY(-1px); }
`;

export default function PersonaModal({
  open, onClose, onStart, persona, imageSrc, accentStart, accentEnd,
}) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !persona) return null;

  return (
    <Overlay open={open} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <Modal role="dialog" aria-modal="true" aria-label={`${persona.name} persona`}>
        <TopBar $accentStart={accentStart} $accentEnd={accentEnd} />
        <Content>
          <AvatarWrap>
            <Aura $accentStart={accentStart} $accentEnd={accentEnd} />
            <Avatar src={imageSrc} alt={persona.title} />
          </AvatarWrap>
          <div>
            <Title>{persona.name} · {persona.title}</Title>
            <Sub>{persona.tone}</Sub>
            <Quote>“{persona.quote}”</Quote>

            <Row>
              <strong>角色故事</strong>
              <Para>{persona.story}</Para>
            </Row>
            <Row>
              <strong>特別適合</strong>
              <Para>{persona.suitable}</Para>
            </Row>
          </div>
        </Content>
        <Actions>
          <GhostBtn onClick={onClose}>稍後再看</GhostBtn>
          <PrimaryBtn $accentStart={accentStart} $accentEnd={accentEnd}
            onClick={() => onStart?.(persona)}>
            開始與 {persona.name} 對話
          </PrimaryBtn>
        </Actions>
      </Modal>
    </Overlay>
  );
}
