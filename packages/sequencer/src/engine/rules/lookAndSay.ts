import type { SequenceRule } from './types';

function nextLookAndSay(current: number): number {
    const s = String(current);
    let result = '';
    let count = 1;

    for (let i = 0; i < s.length; i++) {
        if (s[i] === s[i + 1]) {
            count++;
        } else {
            result += String(count) + s.charAt(i);
            count = 1;
        }
    }

    return Number(result);
}

export const lookAndSayRule = {
    id: 'look-and-say',
    name: 'Look and Say',
    description: '1, 11, 21, 1211, 111221... each term describes the previous.',
    maxSteps: 15,
    getNext: ({ index, current }) => {
        if (index === 1) {
            return 1;
        }

        return nextLookAndSay(current);
    },
} as const satisfies SequenceRule;
