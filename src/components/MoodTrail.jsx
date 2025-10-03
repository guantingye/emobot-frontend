// src/components/MoodTrail.jsx - 完整優化版
import React, { useRef, useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiDownload, FiRefreshCw } from "react-icons/fi";
import html2canvas from "html2canvas";
import { apiGetMoodAnalysis } from "../api/client";
import robotGif from "../assets/robot.gif";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Cell
} from 'recharts';

// ============================================================================
// 動畫
// ============================================================================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// ============================================================================
// Styled Components
// ============================================================================

const Wrap = styled.div`
  width: 100vw;
  height: 100vh;
  background: #f6f7fb;
  font-family: "Noto Sans TC", sans-serif;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Header = styled.div`
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 40;

  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(43, 57, 147, 0.08);
  box-shadow: 0 4px 18px rgba(43, 57, 147, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px;

  @media (max-width: 768px) {
    padding: 12px 16px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`;

const BtnGroup = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 0;
  padding: 14px 20px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  color: #fff;
  font-size: 16px;
  line-height: 1;
  box-shadow: 0 6px 16px rgba(43, 57, 147, 0.18);
  transform: translateY(0);
  transition: transform 0.12s ease, box-shadow 0.2s ease, opacity 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(43, 57, 147, 0.22);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(43, 57, 147, 0.16);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 12px 18px;
    font-size: 15px;
    gap: 8px;
  }

  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 14px;
    gap: 6px;
  }
`;

const BackBtn = styled(Btn)`
  background: #2b3993;
`;

const DownloadBtn = styled(Btn)`
  background: #4caf50;
  margin-right: 55px;

  @media (max-width: 768px) {
    margin-right: 0;
  }
`;

const PageTitle = styled.div`
  font-weight: 800;
  font-size: 20px;
  color: #2b2f43;
  letter-spacing: 0.2px;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const Content = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  overflow: auto;
  padding-bottom: 80px;
  
  @media (max-width: 900px) {
    padding-bottom: 100px;
  }
`;

const GridPanel = styled.div`
  margin: 96px auto 40px auto;
  width: min(1200px, 88vw);
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: minmax(260px, 1.5fr) minmax(160px, 0.5fr);
  gap: 28px;

  @media (max-width: 1024px) {
    width: 92vw;
    gap: 24px;
    margin: 90px auto 32px auto;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    gap: 20px;
  }

  @media (max-width: 768px) {
    width: 94vw;
    gap: 18px;
    margin: 80px auto 28px auto;
  }

  @media (max-width: 480px) {
    width: 96vw;
    gap: 16px;
    margin: 70px auto 24px auto;
  }
`;

const Card = styled.div`
  position: relative;
  background: #fff;
  border: 1px solid #e7e7ef;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;

  @media (max-width: 768px) {
    padding: 18px;
    border-radius: 18px;
    min-height: 200px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 16px;
    min-height: 180px;
  }
`;

const SectionTitle = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 800;
  color: #2b3993;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e6e9f5;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 8px rgba(43,57,147,0.08);
  letter-spacing: 0.3px;
  user-select: none;

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 5px 9px;
    top: 12px;
    left: 12px;
  }

  @media (max-width: 480px) {
    font-size: 11.5px;
    padding: 5px 8px;
    top: 10px;
    left: 10px;
  }
`;

const Placeholder = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #1b1f33;
  opacity: 0.85;
  text-align: center;
  padding: 0 10px;

  @media (max-width: 768px) {
    font-size: 16px;
  }

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const LeftTop = styled(Card)`
  grid-column: 1;
  grid-row: 1;

  @media (max-width: 900px) {
    grid-column: 1;
    grid-row: auto;
  }
`;

const LeftBottom = styled(Card)`
  grid-column: 1;
  grid-row: 2 / 4;
  min-height: 160px;

  @media (max-width: 900px) {
    grid-column: 1;
    grid-row: auto;
    min-height: 200px;
  }
`;

const RightTop = styled(Card)`
  grid-column: 2;
  grid-row: 1 / 3;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 900px) {
    grid-column: 1;
    grid-row: auto;
    min-height: 280px;
  }
`;

const RightBottom = styled(Card)`
  grid-column: 2;
  grid-row: 3;
  min-height: 110px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;

  @media (max-width: 900px) {
    grid-column: 1;
    grid-row: auto;
    min-height: 140px;
  }
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 45px 10px 10px 10px;
  
  @media (max-width: 768px) {
    padding: 40px 5px 5px 5px;
  }
`;

const CenteredWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 24px;
  padding: 40px 20px;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    gap: 20px;
    padding: 30px 16px;
  }
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(43, 57, 147, 0.1);
  border-top-color: #2b3993;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #2b3993;
  
  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const RobotGif = styled.img`
  width: 180px;
  height: 180px;
  object-fit: contain;
  animation: ${float} 3s ease-in-out infinite;
  
  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
  }
  
  @media (max-width: 480px) {
    width: 120px;
    height: 120px;
  }
`;

const ErrorText = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #2b3993;
  line-height: 1.6;
  text-align: center;
  max-width: 500px;
  
  @media (max-width: 768px) {
    font-size: 16px;
    max-width: 400px;
  }
  
  @media (max-width: 480px) {
    font-size: 15px;
    max-width: 320px;
  }
`;

const ErrorHint = styled.div`
  font-size: 15px;
  color: #666;
  text-align: center;
  line-height: 1.7;
  max-width: 450px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    max-width: 380px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
    max-width: 300px;
  }
`;

const SummaryContent = styled.div`
  font-size: 14px;
  line-height: 1.8;
  color: #444;
  white-space: pre-line;
  margin-top: 35px;
  text-align: left;
  width: 100%;
  max-height: calc(100% - 35px);
  overflow-y: auto;
  word-wrap: break-word;
  word-break: break-word;
  
  strong {
    color: #2b3993;
    font-weight: 700;
  }
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin-top: 30px;
  }
`;

const FloatingRefreshBtn = styled.button`
  position: fixed;
  right: 30px;
  bottom: 30px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  color: #fff;
  font-size: 14px;
  background: #5A8CF2;
  box-shadow: 0 6px 20px rgba(90, 140, 242, 0.35);
  transform: translateY(0);
  transition: all 0.2s ease;
  z-index: 30;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(90, 140, 242, 0.45);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 900px) {
    right: 50%;
    transform: translateX(50%);
    bottom: 20px;
    
    &:hover:not(:disabled) {
      transform: translateX(50%) translateY(-2px);
    }
    
    &:active:not(:disabled) {
      transform: translateX(50%) translateY(0);
    }
  }
  
  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 13px;
    gap: 6px;
  }
`;

// ============================================================================
// 自定義 Tooltip 組件
// ============================================================================

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.98)',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid #e6e9f5',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ 
          fontWeight: '700', 
          color: '#2b3993', 
          marginBottom: '6px',
          fontSize: '13px'
        }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ 
            color: entry.color, 
            fontSize: '12px',
            fontWeight: '600',
            margin: '3px 0'
          }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================================================
// 主組件
// ============================================================================

export default function MoodTrail() {
  const nav = useNavigate();
  const panelRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiGetMoodAnalysis(30);
      
      console.log('Analysis result:', result);
      
      if (result.ok && result.has_sufficient_data) {
        setAnalysisData(result.data);
      } else {
        setError({
          message: result.message || "對話次數不足",
          current: result.message_count || 0,
          required: result.required_count || 20
        });
      }
    } catch (err) {
      console.error("載入分析失敗:", err);
      setError({
        message: "載入失敗，請檢查網路連線後重試",
        current: 0,
        required: 20
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalysis();
  };

  const handleDownload = async () => {
    if (!panelRef.current || isDownloading || !analysisData) return;

    try {
      setIsDownloading(true);

      const element = panelRef.current;
      const padding = 40;

      const canvas = await html2canvas(element, {
        backgroundColor: "#f6f7fb",
        scale: 2,
        useCORS: true,
        logging: false,
        width: element.offsetWidth + padding * 2,
        height: element.offsetHeight + padding * 2,
        x: -padding,
        y: -padding,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          const timestamp = new Date().toISOString().split('T')[0];
          link.href = url;
          link.download = `心情足跡圖_${timestamp}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, "image/png");

    } catch (error) {
      console.error("下載圖片時發生錯誤:", error);
      alert("下載圖片失敗，請稍後再試");
    } finally {
      setIsDownloading(false);
    }
  };

  // ============================================================================
  // 準備圖表數據
  // ============================================================================

  // 情緒頻率圖 - 使用統一的專業色系
  const emotionFreqData = analysisData?.emotion_frequency 
    ? Object.entries(analysisData.emotion_frequency)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value], index) => {
          // 使用漸層藍色系，更專業
          const colors = ['#5A8CF2', '#6B9AED', '#7BA8E8', '#8BB6E3', '#9BC4DE', '#ABC2D9', '#BBD0D4'];
          return {
            name, 
            次數: value,
            color: colors[index % colors.length]
          };
        })
    : [];

  const emotionIntensityData = analysisData?.emotion_intensity
    ? Object.entries(analysisData.emotion_intensity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({
          name,
          強度: Math.round(value),
          color: analysisData.emotion_colors?.[name] || '#FF8FB1'
        }))
    : [];

  const topicRadarData = analysisData?.topic_radar
    ? Object.entries(analysisData.topic_radar).map(([subject, value]) => ({
        subject,
        分數: Math.round(value),
        fullMark: 100
      }))
    : [];

  // ============================================================================
  // 渲染：載入中
  // ============================================================================

  if (loading) {
    return (
      <Wrap>
        <Header>
          <BtnGroup>
            <BackBtn onClick={() => nav(-1)}>
              <FiArrowLeft size={18} /> 返回
            </BackBtn>
          </BtnGroup>
          <PageTitle>心情足跡·MoodTrail</PageTitle>
          <BtnGroup />
        </Header>
        <Content>
          <CenteredWrapper>
            <LoadingSpinner />
            <LoadingText>正在分析你的對話內容...</LoadingText>
          </CenteredWrapper>
        </Content>
      </Wrap>
    );
  }

  // ============================================================================
  // 渲染：錯誤或數據不足
  // ============================================================================

  if (error || !analysisData) {
    return (
      <Wrap>
        <Header>
          <BtnGroup>
            <BackBtn onClick={() => nav(-1)}>
              <FiArrowLeft size={18} /> 返回
            </BackBtn>
          </BtnGroup>
          <PageTitle>心情足跡·MoodTrail</PageTitle>
          <BtnGroup />
        </Header>
        <Content>
          <CenteredWrapper>
            <RobotGif src={robotGif} alt="robot" />
            <ErrorText>{error?.message || "尚無足夠的對話數據進行分析"}</ErrorText>
            {error?.current !== undefined && (
              <ErrorHint>
                目前對話次數: <strong>{error.current}</strong> / <strong>{error.required}</strong>
                <br />
                還需要 <strong>{error.required - error.current}</strong> 次對話才能進行完整分析
              </ErrorHint>
            )}
          </CenteredWrapper>
        </Content>
        <FloatingRefreshBtn onClick={handleRefresh} disabled={refreshing}>
          <FiRefreshCw size={16} /> {refreshing ? "更新中..." : "重新整理"}
        </FloatingRefreshBtn>
      </Wrap>
    );
  }

  // ============================================================================
  // 渲染：完整分析結果
  // ============================================================================

  return (
    <Wrap>
      <Header>
        <BtnGroup>
          <BackBtn onClick={() => nav(-1)}>
            <FiArrowLeft size={18} /> 返回
          </BackBtn>
        </BtnGroup>

        <PageTitle>心情足跡·MoodTrail</PageTitle>

        <BtnGroup>
          <DownloadBtn onClick={handleDownload} disabled={isDownloading}>
            <FiDownload size={18} /> {isDownloading ? "下載中..." : "下載圖片"}
          </DownloadBtn>
        </BtnGroup>
      </Header>

      <Content>
        <GridPanel ref={panelRef}>
          {/* 左上：情緒頻率圖 */}
          <LeftTop>
            <SectionTitle>情緒頻率圖</SectionTitle>
            <ChartWrapper>
              {emotionFreqData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={emotionFreqData} 
                    margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      style={{ fontSize: '12px', fontWeight: '600' }}
                      tick={{ fill: '#666' }}
                    />
                    <YAxis 
                      style={{ fontSize: '12px', fontWeight: '600' }}
                      tick={{ fill: '#666' }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="次數" radius={[10, 10, 0, 0]} maxBarSize={50}>
                      {emotionFreqData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Placeholder>尚無情緒數據</Placeholder>
              )}
            </ChartWrapper>
          </LeftTop>

          {/* 左下：情緒強度圖 */}
          <LeftBottom>
            <SectionTitle>情緒強度圖</SectionTitle>
            <ChartWrapper>
              {emotionIntensityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={emotionIntensityData} 
                    margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      style={{ fontSize: '12px', fontWeight: '600' }}
                      tick={{ fill: '#666' }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      style={{ fontSize: '12px', fontWeight: '600' }}
                      tick={{ fill: '#666' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="強度" 
                      stroke="#FF8FB1" 
                      strokeWidth={3} 
                      dot={{ r: 5, fill: '#FF8FB1' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Placeholder>尚無強度數據</Placeholder>
              )}
            </ChartWrapper>
          </LeftBottom>

          {/* 右上：議題雷達圖 */}
          <RightTop>
            <SectionTitle>議題雷達圖</SectionTitle>
            <ChartWrapper>
              {topicRadarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={topicRadarData}>
                    <PolarGrid 
                      stroke="#d0d0d0" 
                      strokeWidth={1.5}
                      strokeOpacity={0.6}
                    />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      style={{ 
                        fontSize: '12px', 
                        fontWeight: '700',
                        fill: '#2b3993'
                      }}
                    />
                    <PolarRadiusAxis 
                      domain={[0, 100]} 
                      style={{ fontSize: '11px', fontWeight: '600' }}
                      tick={{ fill: '#999' }}
                      axisLine={{ stroke: '#d0d0d0' }}
                    />
                    <Radar 
                      name="議題分數" 
                      dataKey="分數" 
                      stroke="#7A4DC8" 
                      fill="transparent"
                      strokeWidth={2.5}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <Placeholder>尚無議題數據</Placeholder>
              )}
            </ChartWrapper>
          </RightTop>

          {/* 右下：小提醒 */}
          <RightBottom>
            <SectionTitle>分析摘要</SectionTitle>
            <SummaryContent>
              {analysisData.summary || "持續對話可以幫助我更了解你的心理狀態"}
            </SummaryContent>
          </RightBottom>
        </GridPanel>
      </Content>

      {/* 浮動重新分析按鈕 */}
      <FloatingRefreshBtn onClick={handleRefresh} disabled={refreshing}>
        <FiRefreshCw size={16} /> {refreshing ? "更新中..." : "重新分析"}
      </FloatingRefreshBtn>
    </Wrap>
  );
}