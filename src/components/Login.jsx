import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import loginBackground from "../assets/Login_background.png";
import userIcon from "../assets/profile.png";
import logoIcon from "../assets/logofig.png";
import { apiJoin } from "../api/client";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-image: url(${loginBackground});
  background-size: cover;
  background-position: center;
  font-family: "Noto Sans TC", sans-serif;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    background-size: 120%;
    background-position: center 20%;
  }

  @media (max-width: 480px) {
    background-size: 140%;
    background-position: center 30%;
  }
`;

const Header = styled.header`
  width: 100%;
  height: 70px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  position: fixed;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 20px rgba(43, 57, 147, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(15px);
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

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  margin-right: 40px;

  @media (max-width: 768px) {
    gap: 16px;
    margin-right: 0;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const LoginCard = styled.div`
  width: 400px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  position: absolute;
  top: 50%;
  right: 80px;
  transform: translateY(-50%);
  box-shadow: 
    0 20px 60px rgba(43, 57, 147, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.4);

  @media (max-width: 1024px) {
    right: 40px;
    width: 360px;
  }

  @media (max-width: 768px) {
    position: relative;
    top: auto;
    right: auto;
    transform: none;
    width: 90%;
    max-width: 400px;
    margin: 100px auto 0;
    padding: 32px 24px;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    width: 95%;
    margin: 80px auto 0;
    padding: 24px 20px;
    border-radius: 16px;
  }
`;

const Title = styled.h2`
  font-size: 42px;
  font-family: "Gilroy-Bold";
  color: #333;
  margin-bottom: 30px;
  text-align: left;
  background: linear-gradient(135deg, #2b3993 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(43, 57, 147, 0.1);

  @media (max-width: 768px) {
    font-size: 32px;
    margin-bottom: 24px;
    text-align: center;
  }

  @media (max-width: 480px) {
    font-size: 28px;
    margin-bottom: 20px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    margin-bottom: 18px;
  }
`;

const Label = styled.label`
  font-size: 16px;
  color: #333;
  font-family: "Gilroy-Medium";
  display: block;
  margin-bottom: 8px;
  font-weight: 600;

  @media (max-width: 480px) {
    font-size: 15px;
    margin-bottom: 6px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid ${props => props.hasError ? '#e74c3c' : 'rgba(43, 57, 147, 0.15)'};
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-family: "Poppins";
  transition: all 0.3s ease;
  box-sizing: border-box;
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #2b3993;
    background: white;
    box-shadow: 0 0 0 4px rgba(43, 57, 147, 0.1), 0 4px 12px rgba(43, 57, 147, 0.15);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #999;
  }

  @media (max-width: 480px) {
    padding: 14px;
    font-size: 15px;
    border-radius: 10px;
  }
`;

const HelperText = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 6px;
  font-family: "Gilroy-Medium";
  line-height: 1.4;

  @media (max-width: 480px) {
    font-size: 13px;
    margin-top: 4px;
  }
`;

const ErrorText = styled.div`
  font-size: 14px;
  color: #e74c3c;
  margin-top: 6px;
  font-family: "Gilroy-Medium";
  line-height: 1.4;

  @media (max-width: 480px) {
    font-size: 13px;
    margin-top: 4px;
  }
`;

const SignInButton = styled.button`
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #435f94, #2b3993);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: "Gilroy-Bold";
  font-size: 18px;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.4s ease;
  box-shadow: 0 8px 25px rgba(43, 57, 147, 0.3);
  font-weight: 700;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    transition: left 0.6s ease;
  }

  &:hover {
    background: linear-gradient(135deg, #2b3993, #1e2a6b);
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(43, 57, 147, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;

    &::before {
      display: none;
    }
  }

  &.success {
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    box-shadow: 0 8px 25px rgba(46, 204, 113, 0.3);
  }

  &.error {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    box-shadow: 0 8px 25px rgba(231, 76, 60, 0.3);
  }

  @media (max-width: 480px) {
    padding: 16px;
    font-size: 16px;
    border-radius: 10px;
  }
`;

const StatusMessage = styled.div`
  text-align: center;
  margin-top: 12px;
  font-size: 14px;
  font-family: "Gilroy-Medium";
  min-height: 20px;
  transition: all 0.3s ease;

  &.success {
    color: #27ae60;
  }

  &.error {
    color: #e74c3c;
  }

  @media (max-width: 480px) {
    font-size: 13px;
    margin-top: 10px;
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const [nickname, setNickname] = React.useState("");
  const [pid, setPid] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState({ type: "", message: "" });

  // 即時驗證函數
  const validatePid = (value) => {
    const trimmedValue = value.trim().toUpperCase();
    if (!trimmedValue) return "";
    if (!/^\d{3}[A-Z]{1}$/.test(trimmedValue)) {
      return "受試者ID 格式需為三位數字＋一位英文大寫字母（例：123A）";
    }
    return "";
  };

  const validateNickname = (value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "請輸入暱稱";
    if (trimmedValue.length < 2) return "暱稱至少需要2個字元";
    if (trimmedValue.length > 20) return "暱稱不能超過20個字元";
    return "";
  };
  
  // 處理輸入變化
  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setNickname(value);
    setStatus({ type: "", message: "" }); // 清除狀態訊息
    
    // 清除對應的錯誤訊息
    if (errors.nickname) {
      setErrors(prev => ({ ...prev, nickname: validateNickname(value) }));
    }
  };

  const handlePidChange = (e) => {
    const value = e.target.value.toUpperCase();
    setPid(value);
    setStatus({ type: "", message: "" }); // 清除狀態訊息
    
    // 清除對應的錯誤訊息
    if (errors.pid) {
      setErrors(prev => ({ ...prev, pid: validatePid(value) }));
    }
  };

  const handleSignIn = async () => {
    // 驗證表單
    const nicknameError = validateNickname(nickname);
    const pidError = validatePid(pid);
    
    const newErrors = {
      nickname: nicknameError,
      pid: pidError
    };
    
    setErrors(newErrors);
    
    if (nicknameError || pidError) {
      return;
    }
  
    setLoading(true);
    
    try {
      const code = pid.trim().toUpperCase();
      const result = await apiJoin(code, nickname.trim());
      
      // 儲存登入資訊
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      
      setStatus({ type: "success", message: "登入成功！正在跳轉..." });
      
      setTimeout(() => {
        // 根據用戶狀態決定跳轉路徑
        if (result.user.selected_bot) {
          // 已選擇機器人 → 直接進入會員專區
          navigate("/dashboard");
        } else {
          // 未選擇機器人 → 進入心理測驗
          navigate("/test");
        }
      }, 1000);
    } catch (e) {
      console.error("Login error:", e);
      setStatus({ type: "error", message: e.message || "登入失敗，請稍後再試" });
    } finally {
      setLoading(false);
    }
  };

  // Enter鍵提交
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSignIn();
    }
  };

  return (
    <Container>
      <Header>
        <Logo>
          <img src={logoIcon} alt="logo" />
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
          <AvatarImg src={userIcon} alt="user" />
        </RightSection>
      </Header>

      <LoginCard>
        <Title>Login</Title>

        <FormGroup>
          <Label htmlFor="nickname">暱稱</Label>
          <Input
            id="nickname"
            type="text"
            placeholder="請輸入英文暱稱"
            value={nickname}
            onChange={handleNicknameChange}
            onKeyPress={handleKeyPress}
            hasError={!!errors.nickname}
            maxLength={20}
          />
          {errors.nickname ? (
            <ErrorText>{errors.nickname}</ErrorText>
          ) : (
            <HelperText>請輸入2-10個字元的英文暱稱</HelperText>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="pid">受試者PID</Label>
          <Input
            id="pid"
            type="text"
            placeholder="例如 123W"
            maxLength={4}
            value={pid}
            onChange={handlePidChange}
            onKeyPress={handleKeyPress}
            hasError={!!errors.pid}
          />
          {errors.pid ? (
            <ErrorText>{errors.pid}</ErrorText>
          ) : (
            <HelperText>格式：手機末三碼＋英文姓氏開頭一碼（例：123W）<br />
            ⚠️請務必與前測問卷所填相同，以便資料比對。</HelperText>
          )}
        </FormGroup>

        <SignInButton 
          onClick={handleSignIn} 
          disabled={loading}
          className={status.type}
        >
          {loading ? "登入中..." : status.type === "success" ? "登入成功 ✓" : "Log in"}
        </SignInButton>

        <StatusMessage className={status.type}>
          {status.message}
        </StatusMessage>

      </LoginCard>
    </Container>
  );
}