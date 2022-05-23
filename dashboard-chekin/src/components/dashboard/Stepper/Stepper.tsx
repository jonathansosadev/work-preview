import React from 'react';
import {Dot, StepPoint, ThreeDotsWrapper, Wrapper} from './styled';

type StepperProps = {
  totalSteps: number;
  activeStep: number;
  visible?: boolean;
  className?: string;
};
function Stepper({totalSteps, activeStep, visible = true, className}: StepperProps) {
  const ThreeDots = React.useCallback(
    () => (
      <ThreeDotsWrapper>
        <Dot />
        <Dot />
        <Dot />
      </ThreeDotsWrapper>
    ),
    [],
  );

  const Steps = React.useMemo(() => {
    return new Array(totalSteps).fill('').map((_, stepNumber) => {
      const currentStep = ++stepNumber;
      const isActive = currentStep === activeStep;
      const isLastStep = currentStep === totalSteps;
      return (
        <React.Fragment key={currentStep}>
          <StepPoint active={isActive}>{currentStep}</StepPoint>
          {!isLastStep && <ThreeDots />}
        </React.Fragment>
      );
    });
  }, [ThreeDots, activeStep, totalSteps]);

  if (!visible) return null;
  return <Wrapper className={className}>{Steps}</Wrapper>;
}

export {Stepper};
