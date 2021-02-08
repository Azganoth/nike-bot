import { colorize } from './helpers';
import type { Color } from './helpers';

const isDevelopmentEnvironment =
  process.env.NODE_ENV === 'development' || process.env.TS_NODE_DEV === 'true';

function timestamp() {
  return colorize(new Date().toLocaleTimeString('pt-BR'), 'gray');
}

export function composeMessage(text: string, header?: string, color: Color = 'white') {
  let message = '';

  if (header !== undefined) {
    message += `[${colorize(header, color)}] `;
  }

  message += `${timestamp()} ${text.includes('\n') ? `\n${text}` : text}`;

  return message;
}

export default abstract class Logger {
  static log(message: string, header?: string, color?: Color) {
    console.log(composeMessage(message, header, color));
  }

  static info(message: string) {
    console.log(composeMessage(message, 'INFO', 'green'));
  }

  static warn(message: string) {
    console.log(composeMessage(message, 'WARN', 'yellow'));
  }

  static error(message: string) {
    console.log(composeMessage(message, 'ERROR', 'red'));
  }

  static debug(message: string) {
    if (isDevelopmentEnvironment) {
      console.log(composeMessage(message, 'DEBUG', 'magenta'));
    }
  }
}
