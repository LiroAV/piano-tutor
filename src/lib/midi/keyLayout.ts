// Shared piano key layout constants — must stay in sync with PianoKeyboard.tsx

export const FIRST_NOTE = 21; // A0
export const LAST_NOTE = 108; // C8
export const WHITE_W = 36;
export const BLACK_W = 22;
export const WHITE_H = 140;

const _whiteIndex = new Map<number, number>();
const _leftWhite = new Map<number, number>();

let _wi = 0;
for (let n = FIRST_NOTE; n <= LAST_NOTE; n++) {
  if ([1, 3, 6, 8, 10].includes(n % 12)) {
    _leftWhite.set(n, _wi - 1);
  } else {
    _whiteIndex.set(n, _wi);
    _wi++;
  }
}

export const TOTAL_WHITE = _wi;
export const KEYBOARD_WIDTH = TOTAL_WHITE * WHITE_W;

export function keyLeft(midi: number): number {
  if (_leftWhite.has(midi)) return (_leftWhite.get(midi)! + 1) * WHITE_W - BLACK_W / 2;
  return _whiteIndex.get(midi)! * WHITE_W;
}

export function keyWidth(midi: number): number {
  return _leftWhite.has(midi) ? BLACK_W : WHITE_W - 1;
}

export function isBlackKey(midi: number): boolean {
  return _leftWhite.has(midi);
}
