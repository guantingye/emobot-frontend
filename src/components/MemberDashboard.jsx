import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import radarChart from "../assets/radar.png";
import avatar from "../assets/avatar.png";
import avatarMen from "../assets/avatar_men.png";
import userIcon from "../assets/profile.png";
import logoIcon from "../assets/logofig.png";
import { apiMe } from "../api/client";

/* =========================
   原有樣式（保持不變或僅微調）
   ========================= */

const Container = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: #f1f1f1;
  font-family: "Noto Sans TC", sans-serif;
  overflow: hidden;
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

const MainContentWrapper = styled.div`
  margin-top: 70px;
  height: calc(100dvh - 70px);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 12px;
`;

const ContentScaler = styled.div`
  transform-origin: top center;
  width: 100%;
  max-width: 1200px;
  transform: ${({ $scale }) => `scale(${$scale})`};
`;

const UserInfo = styled.div`
  width: 80%;
  margin-bottom: 20px;
  transition: transform 0.5s ease;
`;

const UserName = styled.p`
  font-size: 38px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;

  span {
    color: #2b3993;
  }
`;

const UserID = styled.p`
  font-size: 30px;
  font-weight: bold;
  color: #666;
  opacity: 0.8;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 16px;
`;

const ProfileCard = styled.div`
  width: 431px;
  height: 640px;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  border: 2.58px solid #d0d0d0;
  border-radius: 25px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(43, 57, 147, 0.15);
  }
`;

const ProfileImage = styled.img`
  width: 350px;
  height: 350px;
  margin-top: 20px;
  border-radius: 50%;
  background: #666;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.5s ease, box-shadow 0.5s ease;

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
  }
`;

const ProfileName = styled.div`
  margin-top: 50px;
  font-size: 50px;
  font-weight: bold;
  color: #333;
  transition: color 0.3s ease;
`;

const ProfileType = styled.div`
  font-size: 40px;
  color: #2b3993;
  margin-top: 10px;
  padding: 8px 20px;
  border-radius: 50px;
  background: rgba(43, 57, 147, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(43, 57, 147, 0.2);
    transform: scale(1.05);
  }
`;

const FlippableImage = styled(ProfileImage)`
  backface-visibility: hidden;
  transform: ${(p) => (p.$flip ? "rotateY(180deg)" : "rotateY(0deg)")};
  transition: transform 0.6s ease, box-shadow 0.5s ease;
`;

const FlipButton = styled.button`
  margin-top: 10px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 999px;
  border: 1px solid #d0d0d0;
  background: #fff;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
  &:hover {
    transform: translateY(-1px);
    background: #f6f7ff;
  }
  &:active {
    transform: translateY(0);
  }
`;

const AICard = styled.div`
  width: 591px;
  height: 572px;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  border: 2.58px solid #d0d0d0;
  border-radius: 25px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(43, 57, 147, 0.15);
  }
`;

const AIDescription = styled.p`
  font-size: 30px;
  margin-bottom: 45px;
  font-weight: bold;
  color: #333;
  text-align: center;

  span {
    color: #2b3993;
    position: relative;
  }
`;

const RadarImage = styled.img`
  width: 100%;
  max-width: 490px;
  display: block;
  transition: transform 0.5s ease;

  &:hover {
    transform: scale(1.03);
  }
`;

/* 右側直欄：包含白色卡片 + 其正下方按鈕 */
const RightColumn = styled.div`
  width: 591px;           /* 與 AICard 同寬，讓按鈕正好對齊卡片 */
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/* 卡片正下方的按鈕列（不在卡片裡） */
const ButtonsUnderCard = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 36px;
  flex-wrap: wrap;
  margin-top: 26px;
`;

const ActionButton = styled.button`
  width: 249px;
  height: 65px;
  font-size: 28px;
  font-weight: bold;
  color: white;
  border-radius: 170px;
  border: none;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  background: ${(props) => props.bgColor};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.08);
    filter: brightness(1.1);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.96);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${(props) => (props.show ? 1 : 0)};
  visibility: ${(props) => (props.show ? "visible" : "hidden")};
  transition: all 0.3s ease;
`;

const ModalContent = styled.div`
  width: 510px;
  background: white;
  border-radius: 25px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  transform: ${(props) => (props.show ? "scale(1)" : "scale(0.9)")};
  transition: all 0.3s ease;
`;

const ModalTitle = styled.h2`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 25px;
  line-height: 1.4;
`;

const ModalDescription = styled.p`
  font-size: 20px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
`;

const ModalWarning = styled.p`
  font-size: 18px;
  color: #888;
  line-height: 1.6;
  margin-bottom: 35px;
`;

const ModalButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
`;

const ModalButton = styled.button`
  width: 140px;
  height: 50px;
  border-radius: 25px;
  border: none;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const CancelButton = styled(ModalButton)`
  background: #666;
  color: white;

  &:hover {
    background: #555;
  }
`;

const ConfirmButton = styled(ModalButton)`
  background: #cc4141;
  color: white;

  &:hover {
    background: #bb3535;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
`;

const LoadingText = styled.div`
  font-size: 18px;
  color: #666;
  text-align: center;
  margin: 20px 0;
`;

const ErrorText = styled.div`
  font-size: 16px;
  color: #cc4141;
  text-align: center;
  margin: 10px 0;
`;

/* =========================
   純 SVG 雷達圖（升級版）
   - 以 scores 的 0~1 值作圖
   - 在四個象限顯示動態分數（0~100）
   - 加上 25/50/75% 的環形參考線與簡單填色
   ========================= */
   const RadarChartSVG = ({ scores }) => {
    if (!scores) return null;
  
    const size = 490;
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.36;         // 半徑
    const levels = [0.25, 0.5, 0.75];
    const labelOffset = 58;
  
    const clamp01 = (v) => Math.max(0, Math.min(1, Number(v) || 0));
  
    // 軸：依你四型順序
    const axes = [
      { key: "insight",   ang: -90, label: "洞察型AI" },
      { key: "empathy",   ang:   0, label: "同理型AI" },
      { key: "solution",  ang:  90, label: "解決型AI" },
      { key: "cognitive", ang: 180, label: "認知型AI" },
    ];
  
    const toXY = (angDeg, radius) => {
      const a = (angDeg * Math.PI) / 180;
      return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
    };
  
    // 多邊形（scores 0~1）
    const polyPoints = axes
      .map(({ key, ang }) => {
        const v = clamp01(scores[key]);
        const [x, y] = toXY(ang, r * v);
        return `${x},${y}`;
      })
      .join(" ");
  
    return (
      <svg width="100%" height="auto" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="個人化雷達圖">
        {/* 輕微底色四象限（不喧賓奪主） */}
        {axes.map(({ ang }, i) => {
          const [x1, y1] = toXY(ang, 0);
          const [x2, y2] = toXY(ang, r);
          const next = axes[(i + 1) % axes.length].ang;
          const [x3, y3] = toXY(next, r);
          return (
            <polygon
              key={`quad-${i}`}
              points={`${cx},${cy} ${x2},${y2} ${x3},${y3}`}
              fill={i % 2 === 0 ? "rgba(43,57,147,0.05)" : "rgba(0,0,0,0.02)"}
              stroke="none"
            />
          );
        })}
  
        {/* 參考環（25/50/75%） */}
        {levels.map((lv, i) => {
          const rr = r * lv;
          const pts = axes.map(({ ang }) => {
            const [x, y] = toXY(ang, rr);
            return `${x},${y}`;
          }).join(" ");
          return (
            <g key={`lvl-${i}`}>
              <polygon points={pts} fill="none" stroke="#cfcfd6" strokeDasharray="6 6" />
              {/* 只在右上角標一個數字避免雜亂 */}
              {i === 1 && (
                <text x={cx + rr + 10} y={cy - 6} fontSize="12" fill="#777">50%</text>
              )}
            </g>
          );
        })}
  
        {/* 軸線 */}
        {axes.map(({ ang }, i) => {
          const [x, y] = toXY(ang, r);
          return <line key={`axis-${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke="#bfbfd0" />;
        })}
  
        {/* 填色區與邊界 */}
        <polygon points={polyPoints} fill="rgba(43,57,147,0.20)" stroke="#2b3993" strokeWidth="2.2" />
  
        {/* 頂點小圓點 + 分數標籤（0~100） */}
        {axes.map(({ key, ang }, i) => {
          const v01 = clamp01(scores[key]);
          const [vx, vy] = toXY(ang, r * v01);
          const [lx, ly] = toXY(ang, r + labelOffset - 16);
          const v100 = Math.round(v01 * 100);
          return (
            <g key={`pt-${i}`}>
              <circle cx={vx} cy={vy} r="5" fill="#2b3993" />
              {/* 軸標籤 */}
              <text x={lx} y={ly} fontSize="16" textAnchor="middle" dominantBaseline="central" fill="#333">
                {axes[i].label}
              </text>
              {/* 動態分數小膠囊 */}
              <rect
                x={lx - 24} y={ly + 12} rx="10" ry="10" width="48" height="22"
                fill="white" stroke="#2b3993" strokeWidth="1"
              />
              <text x={lx} y={ly + 23} fontSize="13" textAnchor="middle" dominantBaseline="central" fill="#2b3993">
                {v100}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [useAltAvatar, setUseAltAvatar] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const wrapperRef = useRef(null);
  const scalerRef = useRef(null);
  const [scale, setScale] = useState(0.96);

  const recomputeScale = () => {
    const wrapper = wrapperRef.current;
    const scaler = scalerRef.current;
    if (!wrapper || !scaler) return;

    const available = wrapper.clientHeight - 12 * 2;
    const contentHeight = scaler.scrollHeight;
    const bias = 0.92;

    if (contentHeight > available) {
      const next = Math.max(0.78, (available / contentHeight) * bias);
      setScale(next);
    } else {
      setScale(bias);
    }
  };

  useEffect(() => {
    const onResize = () => recomputeScale();
    window.addEventListener("resize", onResize);
    const t = setTimeout(recomputeScale, 0);
    const ro = new ResizeObserver(() => recomputeScale());
    if (scalerRef.current) ro.observe(scalerRef.current);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
      ro.disconnect();
    };
  }, []);

  const handleFlipAvatar = () => {
    setIsFlipping(true);
    setTimeout(() => setUseAltAvatar((v) => !v), 300);
    setTimeout(() => setIsFlipping(false), 650);
  };

  const [nickname, setNickname] = useState("使用者");
  const [pid, setPid] = useState("----");
  const [mbtiRaw, setMbtiRaw] = useState("—");
  const [chosenBotName, setChosenBotName] = useState("—");
  const [scores, setScores] = useState(null);

  const typeNameMap = {
    empathy: "同理型AI",
    insight: "洞察型AI",
    solution: "解決型AI",
    cognitive: "認知型AI",
  };

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });

    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        const profileData = await apiMe();
        if (!profileData.ok) throw new Error(profileData.message || "Failed to load profile");

        if (profileData.user) {
          const user = profileData.user;
          if (user.nickname) setNickname(user.nickname);
          if (user.pid) setPid(user.pid);
        }

        if (profileData.latest_assessment?.mbti?.raw) {
          setMbtiRaw(profileData.latest_assessment.mbti.raw);
        } else {
          try {
            const cachedMBTI = localStorage.getItem("step1MBTI");
            if (cachedMBTI) {
              const mbtiArray = JSON.parse(cachedMBTI);
              if (Array.isArray(mbtiArray) && mbtiArray.length === 4) {
                const mbtiString = mbtiArray
                  .map((v, i) => (v === 1 ? ["E", "N", "T", "P"][i] : ["I", "S", "F", "J"][i]))
                  .join("");
                setMbtiRaw(mbtiString);
              }
            }
          } catch {}
        }

        let botTypeFound = false;
        if (profileData.latest_recommendation?.selected_bot) {
          const botType = profileData.latest_recommendation.selected_bot;
          if (typeNameMap[botType]) {
            setChosenBotName(typeNameMap[botType]);
            botTypeFound = true;
          }
        }
        if (!botTypeFound && profileData.user?.selected_bot) {
          const botType = profileData.user.selected_bot;
          if (typeNameMap[botType]) {
            setChosenBotName(typeNameMap[botType]);
            botTypeFound = true;
          }
        }
        if (!botTypeFound) {
          const selectedBotType = localStorage.getItem("selectedBotType");
          const selectedBotName = localStorage.getItem("selectedBotName");
          if (selectedBotType && typeNameMap[selectedBotType]) {
            setChosenBotName(typeNameMap[selectedBotType]);
          } else if (selectedBotName) {
            setChosenBotName(selectedBotName.replace(" AI", "AI"));
          }
        }

        if (profileData.latest_recommendation?.scores) {
          setScores(profileData.latest_recommendation.scores);
          try {
            localStorage.setItem("match.recommend", JSON.stringify(profileData.latest_recommendation));
          } catch {}
        } else {
          try {
            const cached = localStorage.getItem("match.recommend");
            if (cached) {
              const obj = JSON.parse(cached);
              if (obj && obj.scores) setScores(obj.scores);
            }
          } catch {}
        }
      } catch (error) {
        setError(`載入用戶資料失敗: ${error.message}`);
        try {
          const userJson = localStorage.getItem("user");
          if (userJson) {
            const u = JSON.parse(userJson);
            if (u?.nickname) setNickname(u.nickname);
            if (u?.pid) setPid(u.pid);
          }
          const cachedMBTI = localStorage.getItem("step1MBTI");
          if (cachedMBTI) {
            const mbtiArray = JSON.parse(cachedMBTI);
            if (Array.isArray(mbtiArray) && mbtiArray.length === 4) {
              const mbtiString = mbtiArray
                .map((v, i) => (v === 1 ? ["E", "N", "T", "P"][i] : ["I", "S", "F", "J"][i]))
                .join("");
              setMbtiRaw(mbtiString);
            }
          }
          const selectedBotType = localStorage.getItem("selectedBotType");
          const selectedBotName = localStorage.getItem("selectedBotName");
          if (selectedBotType && typeNameMap[selectedBotType]) {
            setChosenBotName(typeNameMap[selectedBotType]);
          } else if (selectedBotName) {
            setChosenBotName(selectedBotName.replace(" AI", "AI"));
          }
          const cached = localStorage.getItem("match.recommend");
          if (cached) {
            const obj = JSON.parse(cached);
            if (obj?.scores) setScores(obj.scores);
          }
          setError(null);
        } catch {}
      } finally {
        setLoading(false);
        setTimeout(() => recomputeScale(), 0);
      }
    };

    loadUserData();
  }, []);

  const handleRetestClick = () => setShowModal(true);
  const handleCancelModal = () => setShowModal(false);

  const handleConfirmRetest = () => {
    setShowModal(false);
    localStorage.removeItem("step1MBTI");
    localStorage.removeItem("step2Answers");
    localStorage.removeItem("step3Answers");
    localStorage.removeItem("step4Answers");
    localStorage.removeItem("match.recommend");
    localStorage.removeItem("selectedBotId");
    localStorage.removeItem("selectedBotImage");
    localStorage.removeItem("selectedBotName");
    localStorage.removeItem("selectedBotType");
    setScores(null);
    navigate("/test/step1");
  };

  if (loading) {
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
              <div onClick={() => navigate("/Home", { state: { scrollTo: "about" } })}>關於我們</div>
            </Nav>
            <AvatarImg src={userIcon} alt="user avatar" onClick={() => navigate("/profile")} />
          </RightSection>
        </Header>
        <MainContentWrapper ref={wrapperRef}>
          <LoadingWrapper>
            <LoadingText>正在載入用戶資料...</LoadingText>
          </LoadingWrapper>
        </MainContentWrapper>
      </Container>
    );
  }

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
            <div onClick={() => navigate("/Home", { state: { scrollTo: "about" } })}>關於我們</div>
          </Nav>
          <AvatarImg src={userIcon} alt="user avatar" onClick={() => navigate("/profile")} />
        </RightSection>
      </Header>

      <MainContentWrapper ref={wrapperRef}>
        <ContentScaler ref={scalerRef} $scale={scale}>
          <UserInfo data-aos="fade-right">
            <UserName>
              歡迎回來，<span>{nickname}</span>✧
            </UserName>
            <UserID>ID: {pid}</UserID>
            {error && <ErrorText>{error}</ErrorText>}
          </UserInfo>

          <CardContainer>
            <ProfileCard data-aos="fade-up" data-aos-delay="100">
              <FlippableImage src={useAltAvatar ? avatarMen : avatar} alt="avatar" $flip={isFlipping} />
              <FlipButton onClick={handleFlipAvatar}>切換性別</FlipButton>
              <ProfileName>{nickname}</ProfileName>
              <ProfileType>{mbtiRaw}</ProfileType>
            </ProfileCard>

            {/* 右側直欄：白色卡片 + 正下方按鈕 */}
            <RightColumn>
              <AICard data-aos="fade-up" data-aos-delay="200">
                <AIDescription>
                  你目前選擇的AI夥伴是：<span>{chosenBotName}</span>
                </AIDescription>
                {scores ? <RadarChartSVG scores={scores} /> : <RadarImage src={radarChart} alt="radar chart" />}
              </AICard>

              <ButtonsUnderCard>
                <ActionButton
                  bgColor="linear-gradient(to right, #1f1713, #3a2a25)"
                  onClick={handleRetestClick}
                >
                  重新測驗
                </ActionButton>
                <ActionButton
                  bgColor="linear-gradient(to right, #a53333, #cc4141)"
                  onClick={() => navigate("/mood")}
                >
                  開始聊天
                </ActionButton>
              </ButtonsUnderCard>
            </RightColumn>
          </CardContainer>
        </ContentScaler>
      </MainContentWrapper>

      <ModalOverlay show={showModal} onClick={handleCancelModal}>
        <ModalContent show={showModal} onClick={(e) => e.stopPropagation()}>
          <ModalTitle>想重新配對一位懂你的 AI 夥伴嗎？</ModalTitle>
          <ModalDescription>
            點選後，我們會刪除目前心理測驗資料與所有聊天記錄，<br />
            重新為你媒合最適合的對話夥伴。
          </ModalDescription>
          <ModalWarning>請確認你已準備好，重新踏上這段溫柔的探索旅程 💫</ModalWarning>
          <ModalButtonGroup>
            <CancelButton onClick={handleCancelModal}>取消</CancelButton>
            <ConfirmButton onClick={handleConfirmRetest}>確定重新測驗</ConfirmButton>
          </ModalButtonGroup>
        </ModalContent>
      </ModalOverlay>
    </Container>
  );
};

export default MemberDashboard;
