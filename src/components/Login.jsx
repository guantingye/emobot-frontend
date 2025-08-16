import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import loginBackground from "../assets/Login_background.png";
import userIcon from "../assets/profile.png";
import { FaFacebook, FaInstagram, FaChrome } from "react-icons/fa";
import guestIcon from "../assets/guesticon.png";
import logoIcon from "../assets/logofig.png";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-image: url(${loginBackground});
  background-size: cover;
  background-position: center;
  font-family: "Noto Sans TC", sans-serif;
  position: relative;
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
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 35px;
  font-weight: bold;
  color: #2b3993;
  display: flex;
  align-items: center;
`;

const Nav = styled.nav`
  display: flex;
  gap: 40px;
  font-size: 26px;
  font-weight: bold;
  color: black;
  div {
    cursor: pointer;
    transition: color 0.3s ease;
    &:hover {
      color: #2b3993;
    }
  }
`;

const AvatarImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.1);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  margin-right: 40px;
`;

const LoginCard = styled.div`
  width: 400px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 40px;
  position: absolute;
  top: 50%;
  right: 80px;
  transform: translateY(-50%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h2`
  font-size: 42px;
  font-family: "Gilroy-Bold";
  color: #333;
  margin-bottom: 24px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #333;
  font-family: "Gilroy-Medium";
`;

const Input = styled.input`
  width: 90%;
  padding: 14px 16px;
  margin-top: 6px;
  margin-bottom: 20px;
  border: none;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-family: "Poppins";
`;

const SignInButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #435f94;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: "Gilroy-Bold";
  font-size: 16px;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.3s ease;

  &:hover {
    background-color: #2b3993;
  }
`;

const ForgotPassword = styled.div`
  text-align: right;
  font-size: 14px;
  color: #333;
  margin-bottom: 20px;
  cursor: pointer;
`;

const Divider = styled.div`
  text-align: center;
  margin: 20px 0 10px;
  font-size: 14px;
  color: #333;
`;

const ThirdPartyRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const IconButton = styled.button`
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 50%;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const BottomRow = styled.div`
  margin-top: 10px;
  font-size: 14px;
  display: flex;
  justify-content: center;
  gap: 6px;
`;

const LinkSpan = styled.span`
  color: #ae4700;
  font-family: "Gilroy-ExtraBold";
  cursor: pointer;
`;

const GuestMode = styled.div`
  position: absolute;
  bottom: 20px;
  right: 35px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  color: #6a6175;
  cursor: pointer;

  img {
    width: 38px;
    height: 38px;
    margin-bottom: 6px;
    transition: transform 0.3s ease;
  }

  &:hover {
    color: #2b3993;

    img {
      transform: scale(1.1);
    }
  }
`;


export default function Login() {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <Logo>
          <img src={logoIcon} alt="logo" style={{ height: "68px", marginRight: "8px" }} />
          Emobot+
        </Logo>
        <RightSection>
          <Nav>
            <div onClick={() => navigate("/Home")}>主頁</div>
            <div onClick={() => navigate("/Home#robots")}>機器人介紹</div>
            <div onClick={() => navigate("/mood")}>聊天</div>
            <div onClick={() => navigate("/about-us")}>關於我們</div>
          </Nav>
          <AvatarImg src={userIcon} alt="user" />
        </RightSection>
      </Header>

      <LoginCard>
        <Title>Login</Title>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="username@gmail.com" />
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Password" />
        <ForgotPassword>Forgot Password?</ForgotPassword>
        <SignInButton>Sign in</SignInButton>

        <Divider>Or Continue With</Divider>
        <ThirdPartyRow>
          <IconButton><FaFacebook /></IconButton>
          <IconButton><FaInstagram /></IconButton>
          <IconButton><FaChrome /></IconButton>
        </ThirdPartyRow>

        <BottomRow>
          <span>Don’t have an account yet?</span>
          <LinkSpan onClick={() => navigate("/register")}>Register for free</LinkSpan>
        </BottomRow>
      </LoginCard>

      <GuestMode onClick={() => navigate("/mood")}>
        <img src={guestIcon} alt="guest icon" />
        <div>Guest Mode</div>
      </GuestMode>
    </Container>
  );
}

