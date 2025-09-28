// src/components/AvatarAnimation.jsx - 修復 styled-components 警告
import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

// ================= 動畫樣式定義 =================

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 20px;
  overflow: hidden;
  animation: ${fadeIn} 0.8s ease-out;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${props => `translate(${props.$headX || 0}px, ${props.$headY || 0}px)`};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    width: 250px;
    height: 250px;
  }
  
  @media (max-width: 480px) {
    width: 200px;
    height: 200px;
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: ${props => props.$isAnimating ? pulse : 'none'} 2s ease-in-out infinite;
`;

const MouthOverlay = styled.div`
  position: absolute;
  bottom: 25%;
  left: 50%;
  transform: translateX(-50%);
  width: ${props => 20 + (props.$openness * 30)}px;
  height: ${props => 8 + (props.$openness * 12)}px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  opacity: ${props => props.$openness > 0.1 ? 0.8 : 0};
  transition: all 0.1s ease-out;
  z-index: 10;
  
  @media (max-width: 768px) {
    width: ${props => 16 + (props.$openness * 24)}px;
    height: ${props => 6 + (props.$openness * 10)}px;
  }
  
  @media (max-width: 480px) {
    width: ${props => 14 + (props.$openness * 20)}px;
    height: ${props => 5 + (props.$openness * 8)}px;
  }
`;

const EyeOverlay = styled.div`
  position: absolute;
  top: 35%;
  width: 100%;
  height: 8px;
  background: ${props => props.$isBlinking ? 'rgba(0, 0, 0, 0.4)' : 'transparent'};
  opacity: ${props => props.$isBlinking ? 1 : 0};
  transition: opacity 0.1s ease-out;
  z-index: 10;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    width: 25px;
    height: 8px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 50%;
  }
  
  &::before {
    left: 30%;
  }
  
  &::after {
    right: 30%;
  }
  
  @media (max-width: 768px) {
    &::before, &::after {
      width: 20px;
      height: 6px;
    }
  }
  
  @media (max-width: 480px) {
    &::before, &::after {
      width: 16px;
      height: 5px;
    }
  }
`;

const AudioVisualizer = styled.div`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
  height: 20px;
  align-items: flex-end;
  opacity: ${props => props.$isPlaying ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const AudioBar = styled.div`
  width: 3px;
  background: linear-gradient(to top, #7AC2DD, #5A8CF2);
  border-radius: 2px;
  height: ${props => 4 + (props.$intensity * 16)}px;
  animation: ${props => props.$isPlaying ? pulse : 'none'} ${props => 0.5 + (props.$index * 0.1)}s ease-in-out infinite alternate;
`;

const StatusText = styled.div`
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  color: #666;
  text-align: center;
  opacity: ${props => props.$show ? 1 : 0};
  transition: opacity 0.3s ease;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    font-size: 12px;
    bottom: -35px;
  }
`;

const FallbackContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 20px;
`;

const FallbackText = styled.p`
  color: #666;
  font-size: 16px;
  margin-top: 16px;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

// ================= React 組件 =================

const AvatarAnimation = ({ 
  avatarUrl, 
  animationData, 
  audioUrl, 
  isPlaying: externalIsPlaying = false,
  onAnimationEnd,
  showControls = false 
}) => {
  // 狀態管理
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [headPosition, setHeadPosition] = useState({ x: 0, y: 0 });
  const [audioIntensity, setAudioIntensity] = useState(0);
  const [status, setStatus] = useState('');
  
  // Refs
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const timeUpdateRef = useRef(null);
  
  // 清理動畫
  const cleanupAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (timeUpdateRef.current) {
      clearInterval(timeUpdateRef.current);
      timeUpdateRef.current = null;
    }
  }, []);
  
  // 更新動畫狀態
  const updateAnimationState = useCallback((time) => {
    if (!animationData) return;
    
    // 更新嘴部動畫
    if (animationData.mouth_animation) {
      const mouthFrame = animationData.mouth_animation
        .filter(frame => frame.time <= time)
        .pop();
      if (mouthFrame) {
        setMouthOpenness(mouthFrame.mouth_openness || 0);
      }
    }
    
    // 更新眨眼動畫
    if (animationData.blink_animation) {
      const blinkFrame = animationData.blink_animation
        .filter(frame => frame.time <= time)
        .pop();
      if (blinkFrame) {
        setIsBlinking(blinkFrame.eye_state === 'closed' || blinkFrame.eye_state === 'closing');
      }
    }
    
    // 更新頭部動作
    if (animationData.head_animation) {
      const headFrame = animationData.head_animation
        .filter(frame => frame.time <= time)
        .pop();
      if (headFrame) {
        setHeadPosition({
          x: headFrame.head_x || 0,
          y: headFrame.head_y || 0
        });
      }
    }
  }, [animationData]);
  
  // 開始播放動畫
  const startAnimation = useCallback(async () => {
    if (!animationData) {
      setStatus('動畫數據無效');
      return;
    }
    
    setIsPlaying(true);
    setStatus('正在播放動畫...');
    setCurrentTime(0);
    
    const duration = animationData.total_duration * 1000; // 轉換為毫秒
    const startTime = Date.now();
    
    // 播放音頻
    if (audioRef.current && audioUrl) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setStatus('');
      } catch (e) {
        console.warn('音頻播放失敗:', e);
        setStatus('靜音模式');
      }
    } else {
      setStatus('靜音模式');
    }
    
    // 動畫循環
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      const currentTime = (elapsed / 1000);
      
      setCurrentTime(currentTime);
      updateAnimationState(currentTime);
      
      // 模擬音頻波形
      if (isPlaying) {
        const intensity = Math.sin(elapsed * 0.01) * 0.5 + 0.5;
        setAudioIntensity(intensity);
      }
      
      if (progress < 1 && isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // 動畫結束
        stopAnimation();
        if (onAnimationEnd) onAnimationEnd();
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [animationData, audioUrl, isPlaying, updateAnimationState, onAnimationEnd]);
  
  // 停止動畫
  const stopAnimation = useCallback(() => {
    setIsPlaying(false);
    setStatus('');
    cleanupAnimation();
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // 重置動畫狀態
    setMouthOpenness(0);
    setIsBlinking(false);
    setHeadPosition({ x: 0, y: 0 });
    setAudioIntensity(0);
    setCurrentTime(0);
  }, [cleanupAnimation]);
  
  // 外部控制播放狀態
  useEffect(() => {
    if (externalIsPlaying && !isPlaying && animationData) {
      startAnimation();
    } else if (!externalIsPlaying && isPlaying) {
      stopAnimation();
    }
  }, [externalIsPlaying, isPlaying, animationData, startAnimation, stopAnimation]);
  
  // 自動播放邏輯
  useEffect(() => {
    if (animationData && audioUrl) {
      // 延遲一點再開始播放，確保組件完全準備好
      const timer = setTimeout(() => {
        startAnimation();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [animationData, audioUrl, startAnimation]);
  
  // 清理
  useEffect(() => {
    return () => {
      cleanupAnimation();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [cleanupAnimation]);
  
  // 錯誤處理
  if (!avatarUrl) {
    return (
      <Container>
        <FallbackContainer>
          <div style={{ fontSize: '48px', color: '#ccc' }}>🤖</div>
          <FallbackText>未選擇機器人頭像</FallbackText>
        </FallbackContainer>
      </Container>
    );
  }
  
  return (
    <Container>
      <AvatarWrapper 
        $headX={headPosition.x} 
        $headY={headPosition.y}
      >
        <AvatarImage 
          src={avatarUrl} 
          alt="機器人頭像"
          $isAnimating={isPlaying}
          onError={(e) => {
            console.error('頭像圖片載入失敗:', e);
            setStatus('圖片載入失敗');
          }}
        />
        
        <MouthOverlay $openness={mouthOpenness} />
        <EyeOverlay $isBlinking={isBlinking} />
        
        <AudioVisualizer $isPlaying={isPlaying && audioIntensity > 0}>
          {[0, 1, 2, 3, 4].map(i => (
            <AudioBar 
              key={i}
              $index={i}
              $intensity={audioIntensity * (0.5 + Math.sin((currentTime + i) * 2) * 0.5)}
              $isPlaying={isPlaying}
            />
          ))}
        </AudioVisualizer>
        
        <StatusText $show={status.length > 0}>
          {status}
        </StatusText>
      </AvatarWrapper>
      
      {/* 隱藏的音頻元素 */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          onEnded={stopAnimation}
          onError={(e) => {
            console.warn('音頻播放錯誤:', e);
            setStatus('音頻播放失敗');
          }}
          style={{ display: 'none' }}
        />
      )}
      
      {/* 開發模式下的控制按鈕 */}
      {showControls && (
        <div style={{ 
          position: 'absolute', 
          bottom: '10px', 
          right: '10px',
          display: 'flex',
          gap: '8px'
        }}>
          <button onClick={isPlaying ? stopAnimation : startAnimation}>
            {isPlaying ? '停止' : '播放'}
          </button>
        </div>
      )}
    </Container>
  );
};

export default AvatarAnimation;