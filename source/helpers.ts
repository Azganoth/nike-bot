const colors = {
  black: 30,
  white: 37,
  red: 31,
  yellow: 33,
  green: 32,
  cyan: 36,
  blue: 34,
  magenta: 33,
  gray: 90,
};

export type Color =
  | 'black'
  | 'white'
  | 'red'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'magenta'
  | 'gray';

export function colorize(text: string, color: Color) {
  return process.stdout.isTTY ? `\u001B[${colors[color]}m${text}\u001B[39m` : text;
}
