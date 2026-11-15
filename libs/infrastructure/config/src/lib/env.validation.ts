import { plainToInstance, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min, validateSync } from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Type(() => Number) @IsInt() @Min(1) @Max(65535)
  PORT = 3000;

  @IsString() @IsNotEmpty()
  POSTGRES_HOST = 'localhost';

  @Type(() => Number) @IsInt() @Min(1) @Max(65535)
  POSTGRES_PORT = 5432;

  @IsString() @IsNotEmpty()
  POSTGRES_DB!: string;

  @IsString() @IsNotEmpty()
  POSTGRES_USER!: string;

  @IsString() @IsNotEmpty()
  POSTGRES_PASSWORD!: string;

  @IsString() @IsNotEmpty()
  REDIS_HOST = 'localhost';

  @Type(() => Number) @IsInt() @Min(1) @Max(65535)
  REDIS_PORT = 6379;

  @IsString() @IsNotEmpty()
  REDIS_PASSWORD!: string;
}

export type Env = EnvironmentVariables;

export function validateEnv(raw: Record<string, unknown>): Env {
  const env = plainToInstance(EnvironmentVariables, raw, { exposeDefaultValues: true });
  const errors = validateSync(env, { skipMissingProperties: false });
  if (errors.length > 0) {
    const lines = errors.map(
      (e) => `  - ${e.property}: ${Object.values(e.constraints ?? {}).join('; ')}`,
    );
    throw new Error(`Invalid environment variables:\n${lines.join('\n')}`);
  }
  return env;
}