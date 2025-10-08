// frontend/src/components/Login.jsx - 完整版本(加入冷啟動提示)

import React from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { apiJoin } from "../api/client";
import logoIcon from "../assets/logo_icon.png";
import userIcon from "../assets/user_icon.png";

// ============================================================================
// Keyframes 動畫
// ============================================================================

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ============================================================================
// Styled Components
// ============================================================================

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 70%
    );
    animation: rotate 30s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    &::before {
      display: none;
    }
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 48px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    padding: 16px 24px;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-family: "Gilroy-Bold";
  color: #2b3993;
  cursor: pointer;
  transition: transform 0.3s ease;

  img {
    width: 48px;
    height: 48px;
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: scale(1.05);

    img {
      transform: rotate(10deg);
    }
  }

  @media (max-width: 768px) {
    font-size: 22px;

    img {
      width: 36px;
      height: 36px;
    }
  }

  @media (max-width: 480px) {
    font-size: 20px;

    img {
      width: 32px;
      height: 32px;
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;

  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 32px;

  div {
    cursor: pointer;
    color: #333;
    font-family: "Gilroy-Medium";
    font-size: 16px;
    transition: all 0.3s ease;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: #2b3993;
      transition: width 0.3s ease;
    }

    &:hover {
      color: #2b3993;

      &::after {
        width: 100%;
      }
    }
  }

  @media (max-width: 768px) {
    gap: 16px;

    div {
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

const AvatarImg = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid rgba(43, 57, 147, 0.2);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 16px rgba(43, 57, 147, 0.3);
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
  }
`;

const LoginCard = styled.div`
  width: 420px;
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
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: 1024px) {
    right: 40px;
    width: 320px;
  }

  @media (max-width: 768px) {
    position: relative;
    top: auto;
    right: auto;
    transform: none;
    width: 90%;
    max-width: 320px;
    margin: 100px auto 0;
    padding: 24px 16px;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    width: 95%;
    margin: 80px auto 0;
    padding: 16px 12px;
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

  &:disabled {
    background: rgba(245, 245, 245, 0.9);
    cursor: not-allowed;
    opacity: 0.7;
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
  animation: ${slideDown} 0.3s ease-out;

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

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2b3993, #1e2a6b);
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(43, 57, 147, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.7;

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
  padding: ${props => props.show ? '12px' : '0'};
  border-radius: 8px;
  transition: all 0.3s ease;
  animation: ${props => props.show ? slideDown : 'none'} 0.3s ease-out;
  line-height: 1.5;

  &.success {
    color: #27ae60;
    background: rgba(46, 204, 113, 0.1);
    border: 1px solid rgba(46, 204, 113, 0.2);
  }

  &.error {
    color: #e74c3c;
    background: rgba(231, 76, 60, 0.1);
    border: 1px solid rgba(231, 76, 60, 0.2);
    white-space: pre-line;
  }

  &.warning {
    color: #f39c12;
    background: rgba(243, 156, 18, 0.1);
    border: 1px solid rgba(243, 156, 18, 0.2);
  }

  @media (max-width: 480px) {
    font-size: 13px;
    margin-top: 10px;
  }
`;

// ============================================================================
// Main Component
// ============================================================================

export default function Login() {
  const navigate = useNavigate();
  const [nickname, setNickname] = React.useState("");
  const [pid, setPid] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState({ type: "", message: "" });
  const [coldStartTimer, setColdStartTimer] = React.useState(null);

  // 清理計時器
  React.useEffect(() => {
    return () => {
      if (coldStartTimer) {
        clearTimeout(coldStartTimer);
      }
    };
  }, [coldStartTimer]);

  // 即時驗證函數
  const validatePid = (value) => {
    const trimmedValue = value.trim().toUpperCase();
    if (!trimmedValue) return "";
    if (!/^\d{3}[A-Z]{1}$/.test(trimmedValue)) {
      return "受試者ID 格式需為三位數字+一位英文大寫字母(例:123A)";
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
    setStatus({ type: "", message: "" });
    
    if (errors.nickname) {
      setErrors(prev => ({ ...prev, nickname: validateNickname(value) }));
    }
  };

  const handlePidChange = (e) => {
    const value = e.target.value.toUpperCase();
    setPid(value);
    setStatus({ type: "", message: "" });
    
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
    setStatus({ type: "", message: "" });

    // ⭐ 冷啟動提示計時器 - 3秒後顯示
    const timer = setTimeout(() => {
      setStatus({
        type: 'warning',
        message: '⏳ 第一次登入需要較長時間(約30秒),正在喚醒伺服器,感謝您的耐心等候...'
      });
    }, 3000);

    setColdStartTimer(timer);
    
    try {
      const code = pid.trim().toUpperCase();
      const result = await apiJoin(code, nickname.trim());
      
      // 登入成功,清除計時器
      clearTimeout(timer);
      setColdStartTimer(null);
      
      // 儲存登入資訊
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      
      setStatus({ type: "success", message: "登入成功!正在跳轉..." });
      
      setTimeout(() => {
        // 根據用戶狀態決定跳轉路徑
        if (result.user.selected_bot) {
          navigate("/dashboard");
        } else {
          navigate("/test");
        }
      }, 1000);
    } catch (e) {
      // 錯誤時也要清除計時器
      clearTimeout(timer);
      setColdStartTimer(null);
      console.error("Login error:", e);
      
      // 針對不同錯誤類型提供更明確的訊息
      let errorMessage = "登入失敗,請稍後再試";
      
      if (e.message.includes("未被授權") || e.message.includes("403")) {
        errorMessage = "此 PID 未被授權使用系統,請聯繫管理員確認您的參與資格";
      } else if (e.message.includes("網路") || e.message.includes("連線")) {
        errorMessage = "網路連線問題,請檢查網路連接後重試";
      } else if (e.message.includes("伺服器")) {
        errorMessage = "伺服器暫時無法使用,請稍後再試或聯繫技術支援";
      } else if (e.message.includes("格式")) {
        errorMessage = "PID 格式不正確,請確認格式為:手機末三碼+英文姓氏開頭一碼";
      } else if (e.message.includes("此 PID 未被授權")) {
        errorMessage = "您輸入的 PID 未被授權使用本系統。請確認:\n1. PID 格式正確(例:123A)\n2. 已獲得研究人員的使用許可\n3. 如有疑問請聯繫研究團隊";
      }
      
      setStatus({ type: "error", message: errorMessage });
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
        <Logo onClick={() => navigate("/Home")}>
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
            disabled={loading}
          />
          {errors.nickname ? (
            <ErrorText>{errors.nickname}</ErrorText>
          ) : (
            <HelperText>請輸入2-20個字元的暱稱</HelperText>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="pid">受試者ID (PID)</Label>
          <Input
            id="pid"
            type="text"
            placeholder="例: 123A"
            value={pid}
            onChange={handlePidChange}
            onKeyPress={handleKeyPress}
            hasError={!!errors.pid}
            maxLength="4"
            disabled={loading}
          />
          {errors.pid ? (
            <ErrorText>{errors.pid}</ErrorText>
          ) : (
            <HelperText>格式: 3碼數字 + 1碼英文大寫(例: 123A)</HelperText>
          )}
        </FormGroup>

        <SignInButton 
          onClick={handleSignIn} 
          disabled={loading}
          className={status.type}
        >
          {loading ? "登入中..." : "Sign in"}
        </SignInButton>

        <StatusMessage 
          className={status.type} 
          show={!!status.message}
        >
          {status.message}
        </StatusMessage>
      </LoginCard>
    </Container>
  );
}