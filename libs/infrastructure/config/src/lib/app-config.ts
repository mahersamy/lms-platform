import type { Env } from './env.validation';

export interface AppConfig {
  readonly app: {
    readonly env: Env['NODE_ENV'];
    readonly isProduction: boolean;
    readonly port: number;
    readonly globalPrefix: string;
  };
  readonly database: { readonly url: string };
  readonly redis: {
    readonly host: string;
    readonly port: number;
    readonly password: string;
    readonly url: string;
  };
}

export function buildConfig(env: Env): AppConfig {
  const enc = encodeURIComponent;
  return {
    app: {
      env: env.NODE_ENV,
      isProduction: env.NODE_ENV === 'production',
      port: env.PORT,
      globalPrefix: 'api',
    },
    database: {
      url: `postgresql://${enc(env.POSTGRES_USER)}:${enc(env.POSTGRES_PASSWORD)}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
    },
    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      url: `redis://:${enc(env.REDIS_PASSWORD)}@${env.REDIS_HOST}:${env.REDIS_PORT}`,
    },
  };
}