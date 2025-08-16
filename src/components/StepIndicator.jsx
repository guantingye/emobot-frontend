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
`;

const OuterCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InnerCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => (props.filled ? "#06B217" : "#fff")};
  border: 2px solid ${props => (props.filled ? "#06B217" : "#ccc")};
  animation: ${props => (props.filled ? popIn : "none")} 0.4s ease-out;
`;

const Line = styled.div`
  width: 50px;
  height: 2px;
  margin-top: 24px; /* 往下移 */
  border-top: 2px dotted #ccc;
  margin: 0 16px;
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
