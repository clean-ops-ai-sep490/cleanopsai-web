import { useState, useCallback } from "react";

interface UseMultiStepFormOptions {
  steps: readonly string[];
  initialStep: string;
  onComplete?: () => void;
}

interface UseMultiStepFormReturn {
  activeStep: string;
  currentStepIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (stepId: string) => void;
  reset: () => void;
}

export function useMultiStepForm({
  steps,
  initialStep,
  onComplete,
}: UseMultiStepFormOptions): UseMultiStepFormReturn {
  const [activeStep, setActiveStep] = useState(initialStep);

  const currentStepIndex = steps.indexOf(activeStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const goToStep = useCallback(
    (stepId: string) => {
      if (steps.includes(stepId)) {
        setActiveStep(stepId);
      }
    },
    [steps],
  );

  const goToNextStep = useCallback(() => {
    if (isLastStep) {
      onComplete?.();
      return;
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setActiveStep(steps[nextIndex]);
    }
  }, [currentStepIndex, isLastStep, steps, onComplete]);

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      if (prevIndex >= 0) {
        setActiveStep(steps[prevIndex]);
      }
    }
  }, [currentStepIndex, isFirstStep, steps]);

  const reset = useCallback(() => {
    setActiveStep(initialStep);
  }, [initialStep]);

  return {
    activeStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    reset,
  };
}
