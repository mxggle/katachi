import { describe, expect, it } from 'vitest';
import { getChoiceInteraction } from './practiceChoiceInteraction';

describe('getChoiceInteraction', () => {
  it('submits choices before feedback is shown', () => {
    expect(
      getChoiceInteraction({
        choice: '食べます',
        correctAnswer: '食べます',
        showFeedback: false,
      })
    ).toEqual({ action: 'submit', disabled: false });
  });

  it('lets the correct answer replay audio after feedback is shown', () => {
    expect(
      getChoiceInteraction({
        choice: '食べます',
        correctAnswer: '食べます',
        showFeedback: true,
      })
    ).toEqual({ action: 'replay', disabled: false });
  });

  it('disables incorrect choices after feedback is shown', () => {
    expect(
      getChoiceInteraction({
        choice: '食べない',
        correctAnswer: '食べます',
        showFeedback: true,
      })
    ).toEqual({ action: 'none', disabled: true });
  });
});
