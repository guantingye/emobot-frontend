import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import AOS from "aos";
import "aos/dist/aos.css";
import radarChart from "../assets/radar.png";
import avatar from "../assets/avatar.png";
import userIcon from "../assets/profile.png";
import logoIcon from "../assets/logofig.png";

// 外層容器
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: #f1f1f1;
  font-family: "Noto Sans TC", sans-serif;
  overflow: hidden;
`;

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
  margin-top: 80px;
  height: calc(100vh - 80px);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
`;

// 內容縮放容器
const ContentScaler = styled.div`
  transform: scale(0.76);
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
  width: 105%;
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

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Initialize AOS
    AOS.init({ 
      duration: 800, 
      once: true,
      offset: 100
    });
  }, []);  

  const handleRetestClick = () => {
    setShowModal(true);
  };

  const handleCancelModal = () => {
    setShowModal(false);
  };

  const handleConfirmRetest = () => {
    setShowModal(false);
    navigate("/test");
  };

  return (
    <Container>
      <Header>
        <Logo onClick={() => navigate("Home/")}>
          <img src={logoIcon} alt="logo" style={{ height: "68px", marginRight: "8px" }} />
          Emobot+
        </Logo>
        <RightSection>
          <Nav>
            <div onClick={() => navigate("/Home")}>主頁</div>
            <div onClick={() => navigate("/about")}>機器人介紹</div>
            <div onClick={() => navigate("/mood")}>聊天</div>
            <div onClick={() => navigate("/about-us")}>關於我們</div>
          </Nav>
          <AvatarImg src={userIcon} alt="user avatar" onClick={() => navigate("/profile")} />
        </RightSection>
      </Header>

      <MainContentWrapper>
        <ContentScaler>
          <UserInfo data-aos="fade-right">
            <UserName>歡迎回來，<span>Amanda</span>✧</UserName>
            <UserID>ID: 00001234</UserID>
          </UserInfo>

          <CardContainer>
            <ProfileCard data-aos="fade-up" data-aos-delay="100">
              <ProfileImage src={avatar} alt="avatar" />
              <ProfileName>Amanda</ProfileName>
              <ProfileType>ENFP</ProfileType>
            </ProfileCard>

            <AICard data-aos="fade-up" data-aos-delay="200">
              <AIDescription>
                你目前選擇的AI夥伴是：<span>解決型AI</span>
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
            點選後，我們會刪除目前的資料，<br/>
            重新為你媒合最適合的對話夥伴。
          </ModalDescription>
          <ModalWarning>
            請確認你已準備好，重新踏上這段溫柔的探索旅程 💫
          </ModalWarning>
          <ModalButtonGroup>
            <CancelButton onClick={handleCancelModal}>
              取消
            </CancelButton>
            <ConfirmButton onClick={handleConfirmRetest}>
              確定重新測驗
            </ConfirmButton>
          </ModalButtonGroup>
        </ModalContent>
      </ModalOverlay>
    </Container>
  );
};

export default MemberDashboard;