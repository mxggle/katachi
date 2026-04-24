type ChoiceAction = 'submit' | 'replay' | 'none';

interface ChoiceInteractionInput {
  choice: string;
  correctAnswer: string;
  showFeedback: boolean;
}

interface ChoiceInteraction {
  action: ChoiceAction;
  disabled: boolean;
}

export function getChoiceInteraction({
  choice,
  correctAnswer,
  showFeedback,
}: ChoiceInteractionInput): ChoiceInteraction {
  if (!showFeedback) {
    return { action: 'submit', disabled: false };
  }

  if (choice === correctAnswer) {
    return { action: 'replay', disabled: false };
  }

  return { action: 'none', disabled: true };
}
