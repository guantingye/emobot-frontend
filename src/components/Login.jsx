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
  margin-bottom: 30px;
  text-align: left;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  font-size: 16px;
  color: #333;
  font-family: "Gilroy-Medium";
  display: block;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid ${props => props.hasError ? '#e74c3c' : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-family: "Poppins";
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2b3993;
    background: white;
    box-shadow: 0 0 0 3px rgba(43, 57, 147, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const HelperText = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 6px;
  font-family: "Gilroy-Medium";
`;

const ErrorText = styled.div`
  font-size: 14px;
  color: #e74c3c;
  margin-top: 6px;
  font-family: "Gilroy-Medium";
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
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(43, 57, 147, 0.3);

  &:hover {
    background: linear-gradient(135deg, #2b3993, #1e2a6b);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(43, 57, 147, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &.success {
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
  }

  &.error {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
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

  // Enter 鍵提交
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSignIn();
    }
  };

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
          <Label htmlFor="pid">受試者ID</Label>
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