import { pino, multistream } from 'pino';
import type { Config } from '@config/index.js';

export function createLogger(config: Config) {
  const streams: pino.StreamEntry[] = [
    {
      level: config.logLevel,
      stream: pino.destination({
        dest: config.logFilePath,
        sync: false,
        mkdir: true,
      }),
    },
  ];

  if (config.nodeEnv === 'development') {
    streams.push({
      level: config.logLevel,
      stream: pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: true,
        },
      }),
    });
  }

  const multistreamLogger = multistream(streams);
  
  return pino(
    {
      level: config.logLevel,
      formatters: {
        level: (label: string) => {
          return { level: label };
        },
      },
    },
    multistreamLogger
  );
}
