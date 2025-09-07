import React from "react";
import styled, { keyframes } from "styled-components";

// 動畫效果
const popIn = keyframes`
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const StepBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 50px 0;
  padding: 0 20px;

  @media (max-width: 768px) {
    margin: 30px 0;
    padding: 0 16px;
  }

  @media (max-width: 480px) {
    margin: 20px 0;
    padding: 0 12px;
  }
`;

const StepContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const StepLabel = styled.div`
  font-size: 16px;
  margin-bottom: 12px;
  color: ${props => (props.active ? "#000" : "#666")};
  font-weight: ${props => (props.active ? "bold" : "normal")};

  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 8px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 6px;
  }
`;

const OuterCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
  }
`;

const InnerCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => (props.filled ? "#06B217" : "#fff")};
  border: 2px solid ${props => (props.filled ? "#06B217" : "#ccc")};
  animation: ${props => (props.filled ? popIn : "none")} 0.4s ease-out;

  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 480px) {
    width: 16px;
    height: 16px;
  }
`;

const Line = styled.div`
  width: 50px;
  height: 2px;
  margin-top: 24px;
  border-top: 2px dotted #ccc;
  margin: 0 16px;

  @media (max-width: 768px) {
    width: 40px;
    margin: 0 12px;
  }

  @media (max-width: 480px) {
    width: 30px;
    margin: 0 8px;
  }

  @media (max-width: 320px) {
    width: 20px;
    margin: 0 6px;
  }
`;

export default function StepIndicator({ currentStep }) {
  const steps = [1, 2, 3, 4, 5];

  return (
    <StepBar>
      {steps.map((step, index) => (
        <StepContainer key={step}>
          <StepItem>
            <StepLabel active={step <= currentStep}>Step {step}</StepLabel>
            <OuterCircle>
              <InnerCircle filled={step <= currentStep} />
            </OuterCircle>
          </StepItem>
          {index < steps.length - 1 && <Line />}
        </StepContainer>
      ))}
    </StepBar>
  );
}