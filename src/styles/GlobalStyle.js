// src/styles/GlobalStyle.js
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  img, video { max-width: 100%; height: auto; }

  /* 流體字級（避免小螢幕字太大/太小） */
  h1 { font-size: clamp(24px, 3.2vw, 46px); }
  h2 { font-size: clamp(20px, 2.6vw, 36px); }
  p, li, span, button, input { font-size: clamp(14px, 1.7vw, 18px); }

  /* Header / Nav 的通用縮排 */
  header { height: 70px; }
  @media (max-width: 1024px) {
    header { height: 64px; }
    nav { gap: 20px !important; font-size: 18px !important; }
  }
  @media (max-width: 640px) {
    /* 小螢幕避免擠爆：沒有做漢堡選單，先隱藏 Nav 讓內容可視 */
    nav { display: none !important; }
  }

  /* 滾動條美化（不影響功能） */
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,.15); border-radius: 999px; }
`;
