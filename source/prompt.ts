import readline from 'readline';

import { composeMessage } from './logger';
import { colorize } from './helpers';

export async function ask(
  message: string,
  options: {
    defaultAnswer?: string;
    validate?: (value: string) => boolean | string;
  } = {}
) {
  const { defaultAnswer = '', validate } = options;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  for (;;) {
    const answer = await new Promise<string>((_resolve) => {
      rl.question(composeMessage(`${message} `, 'QUESTION', 'blue'), (_answer) => {
        _resolve(_answer || defaultAnswer);
      });
    });

    const isValid = validate?.(answer);

    if (isValid === false || typeof isValid === 'string') {
      console.log(colorize(isValid || 'Valor inválido!', 'red'));
    } else {
      rl.close();
      return answer;
    }
  }
}

export async function confirm(
  message: string,
  options: {
    defaultAnswer?: boolean;
  } = {}
) {
  const { defaultAnswer = true } = options;

  const answer = await ask(`${message} ${colorize('(s/n)', 'gray')}`, {
    defaultAnswer: defaultAnswer ? 's' : 'n',
    validate: (value) => value === 's' || value === 'n' || 'Responda com "s" ou "n".',
  });

  return answer.trim() === 's';
}
