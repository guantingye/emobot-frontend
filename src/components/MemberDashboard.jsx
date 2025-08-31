import React, { useEffect, useState } from "react";
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

// ====== 原有樣式（保持不變）======

// 外層容器
const Container = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: #f1f1f1;
  font-family: "Noto Sans TC", sans-serif;
  overflow: hidden;

// 固定 Header - 與主頁保持一致
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

// 主內容區塊
const MainContentWrapper = styled.div`
  margin-top: 70px;
  height: calc(100dvh - 70px); 
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 12px;      
`;

// 內容縮放容器
const ContentScaler = styled.div`
  transform-origin: top center;
  width: 100%;
  max-width: 1200px;
`;

// 使用者資訊
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

// 卡片容器
const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 40px;
`;

// 頭像卡片
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

// 讓頭像支援翻轉（沿用既有樣式，僅覆寫 transform）
const FlippableImage = styled(ProfileImage)`
  backface-visibility: hidden;
  transform: ${(p) => (p.$flip ? "rotateY(180deg)" : "rotateY(0deg)")};
  transition: transform 0.6s ease, box-shadow 0.5s ease;
`;

// 小按鈕：置於頭像下方（不使用絕對定位，以免影響版面）
const FlipButton = styled.button`
  margin-top: 10px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 700;
  border-radius: 999px;
  border: 1px solid #d0d0d0;
  background: #fff;
  cursor: pointer;
  transition: transform .2s ease, background .2s ease;
  &:hover { transform: translateY(-1px); background: #f6f7ff; }
  &:active { transform: translateY(0); }
`;

// AI卡片
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
    
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 2px;
      background: #2b3993;
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
  }
  
  &:hover span::after {
    transform: scaleX(1);
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

// 按鈕列
const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 36px;
  flex-wrap: wrap;
  margin-top: 70px;
`;

// 按鈕樣式
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

// 確認對話框樣式
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
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const ModalContent = styled.div`
  width: 510px;
  background: white;
  border-radius: 25px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  transform: ${props => props.show ? 'scale(1)' : 'scale(0.9)'};
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

// 載入狀態顯示
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

// 錯誤狀態顯示
const ErrorText = styled.div`
  font-size: 16px;
  color: #cc4141;
  text-align: center;
  margin: 10px 0;
`;

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [useAltAvatar, setUseAltAvatar] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleFlipAvatar = () => {
    setIsFlipping(true);
    setTimeout(() => setUseAltAvatar((v) => !v), 300);  // 翻到一半換圖
    setTimeout(() => setIsFlipping(false), 650);        // 完成動畫
  };

  // 動態資料
  const [nickname, setNickname] = useState("使用者");
  const [pid, setPid] = useState("----");
  const [mbtiRaw, setMbtiRaw] = useState("—");
  const [chosenBotName, setChosenBotName] = useState("—");

  const typeNameMap = {
    empathy: "同理型AI",
    insight: "洞察型AI",
    solution: "解決型AI",
    cognitive: "認知型AI",
  };

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });

    // 從後端載入用戶完整資料
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Loading user profile data...");
        
        const profileData = await apiMe();
        console.log("Profile data received:", profileData);

        if (!profileData.ok) {
          throw new Error(profileData.message || "Failed to load profile");
        }

        // 更新基本用戶資料
        if (profileData.user) {
          const user = profileData.user;
          if (user.nickname) {
            setNickname(user.nickname);
          }
          if (user.pid) {
            setPid(user.pid);
          }
        }

        // 更新 MBTI 資料（從最新評估）
        if (profileData.latest_assessment?.mbti?.raw) {
          setMbtiRaw(profileData.latest_assessment.mbti.raw);
          console.log("Set MBTI from backend:", profileData.latest_assessment.mbti.raw);
        } else {
          // 如果後端沒有 MBTI，嘗試從 localStorage 讀取
          try {
            const cachedMBTI = localStorage.getItem("step1MBTI");
            if (cachedMBTI) {
              const mbtiArray = JSON.parse(cachedMBTI);
              if (Array.isArray(mbtiArray) && mbtiArray.length === 4) {
                const mbtiString = mbtiArray.map((v, i) => 
                  v === 1 ? ["E", "N", "T", "P"][i] : ["I", "S", "F", "J"][i]
                ).join("");
                setMbtiRaw(mbtiString);
                console.log("Set MBTI from localStorage:", mbtiString);
              }
            }
          } catch (e) {
            console.warn("Error parsing cached MBTI:", e);
          }
        }

        // 更新選擇的機器人（從最新推薦或用戶設定）
        let botTypeFound = false;
        
        // 首先檢查最新推薦中的選擇
        if (profileData.latest_recommendation?.selected_bot) {
          const botType = profileData.latest_recommendation.selected_bot;
          if (typeNameMap[botType]) {
            setChosenBotName(typeNameMap[botType]);
            console.log("Set bot from recommendation:", typeNameMap[botType]);
            botTypeFound = true;
          }
        }
        
        // 如果推薦中沒有，檢查用戶直接設定的選擇
        if (!botTypeFound && profileData.user?.selected_bot) {
          const botType = profileData.user.selected_bot;
          if (typeNameMap[botType]) {
            setChosenBotName(typeNameMap[botType]);
            console.log("Set bot from user setting:", typeNameMap[botType]);
            botTypeFound = true;
          }
        }
        
        // 如果後端都沒有，從 localStorage 讀取
        if (!botTypeFound) {
          const selectedBotType = localStorage.getItem("selectedBotType");
          const selectedBotName = localStorage.getItem("selectedBotName");
          
          if (selectedBotType && typeNameMap[selectedBotType]) {
            setChosenBotName(typeNameMap[selectedBotType]);
            console.log("Set bot from localStorage type:", typeNameMap[selectedBotType]);
          } else if (selectedBotName) {
            setChosenBotName(selectedBotName.replace(" AI", "AI"));
            console.log("Set bot from localStorage name:", selectedBotName);
          }
        }

      } catch (error) {
        console.error("Failed to load user data:", error);
        setError(`載入用戶資料失敗: ${error.message}`);
        
        // 如果後端載入失敗，使用 localStorage 作為 fallback
        try {
          console.log("Using localStorage fallback...");
          
          const userJson = localStorage.getItem("user");
          if (userJson) {
            const u = JSON.parse(userJson);
            if (u?.nickname) setNickname(u.nickname);
            if (u?.pid) setPid(u.pid);
          }
          
          // 從 localStorage 載入 MBTI
          const cachedMBTI = localStorage.getItem("step1MBTI");
          if (cachedMBTI) {
            const mbtiArray = JSON.parse(cachedMBTI);
            if (Array.isArray(mbtiArray) && mbtiArray.length === 4) {
              const mbtiString = mbtiArray.map((v, i) => 
                v === 1 ? ["E", "N", "T", "P"][i] : ["I", "S", "F", "J"][i]
              ).join("");
              setMbtiRaw(mbtiString);
            }
          }

          // 從 localStorage 載入選擇的機器人
          const selectedBotType = localStorage.getItem("selectedBotType");
          const selectedBotName = localStorage.getItem("selectedBotName");
          
          if (selectedBotType && typeNameMap[selectedBotType]) {
            setChosenBotName(typeNameMap[selectedBotType]);
          } else if (selectedBotName) {
            setChosenBotName(selectedBotName.replace(" AI", "AI"));
          }
          
          // 清除錯誤狀態，因為 fallback 成功
          setError(null);
        } catch (e) {
          console.warn("Failed to load from localStorage:", e);
          setError("無法載入用戶資料，請嘗試重新登入");
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleRetestClick = () => setShowModal(true);
  const handleCancelModal = () => setShowModal(false);
  
  const handleConfirmRetest = () => {
    setShowModal(false);
    // 清除相關的 localStorage 資料
    localStorage.removeItem("step1MBTI");
    localStorage.removeItem("step2Answers");
    localStorage.removeItem("step3Answers");
    localStorage.removeItem("step4Answers");
    localStorage.removeItem("match.recommend");
    localStorage.removeItem("selectedBotId");
    localStorage.removeItem("selectedBotImage");
    localStorage.removeItem("selectedBotName");
    localStorage.removeItem("selectedBotType");
    
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
              <div onClick={() => navigate("/Home", { state: { scrollTo: "about" } })}>
                關於我們
              </div>
            </Nav>
            <AvatarImg src={userIcon} alt="user avatar" onClick={() => navigate("/profile")} />
          </RightSection>
        </Header>
        <MainContentWrapper>
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
            <div onClick={() => navigate("/Home", { state: { scrollTo: "about" } })}>
              關於我們
            </div>
          </Nav>
          <AvatarImg src={userIcon} alt="user avatar" onClick={() => navigate("/profile")} />
        </RightSection>
      </Header>

      <MainContentWrapper>
        <ContentScaler>
          <UserInfo data-aos="fade-right">
            <UserName>
              歡迎回來，<span>{nickname}</span>✧
            </UserName>
            <UserID>ID: {pid}</UserID>
            {error && <ErrorText>{error}</ErrorText>}
          </UserInfo>

          <CardContainer>
            <ProfileCard data-aos="fade-up" data-aos-delay="100">
              <FlippableImage
                src={useAltAvatar ? avatarMen : avatar}
                alt="avatar"
                $flip={isFlipping}
              />
              <FlipButton onClick={handleFlipAvatar}>切換性別</FlipButton>
              <ProfileName>{nickname}</ProfileName>
              <ProfileType>{mbtiRaw}</ProfileType>
            </ProfileCard>

            <AICard data-aos="fade-up" data-aos-delay="200">
              <AIDescription>
                你目前選擇的AI夥伴是：<span>{chosenBotName}</span>
              </AIDescription>
              <RadarImage src={radarChart} alt="radar chart" />
              <ButtonGroup>
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
              </ButtonGroup>
            </AICard>
          </CardContainer>
        </ContentScaler>
      </MainContentWrapper>

      {/* 確認對話框 */}
      <ModalOverlay show={showModal} onClick={handleCancelModal}>
        <ModalContent show={showModal} onClick={(e) => e.stopPropagation()}>
          <ModalTitle>想重新配對一位懂你的 AI 夥伴嗎？</ModalTitle>
          <ModalDescription>
            點選後，我們會刪除目前心理測驗資料與所有聊天記錄，<br/>
            重新為你媒合最適合的對話夥伴。
          </ModalDescription>
          <ModalWarning>
            請確認你已準備好，重新踏上這段溫柔的探索旅程 💫
          </ModalWarning>
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