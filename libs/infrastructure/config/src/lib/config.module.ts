import { Global, Module } from '@nestjs/common';
import { validateEnv } from './env.validation';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { APP_CONFIG } from './config.constants';
import { buildConfig } from './app-config';


@Global()
@Module({
	imports: [
		NestConfigModule.forRoot({
			isGlobal: true,
			// First file wins; real environment variables (Docker, CI) always win over files.
			envFilePath: ['.env'],
			validate: validateEnv, // fail fast, before anything else boots
			cache: true,
		}),
	],
	controllers: [],
	providers: [
		{
			provide: APP_CONFIG,
			useFactory: () => Object.freeze(buildConfig(validateEnv(process.env))),
		},
	],
	exports: [APP_CONFIG],
})
export class ConfigModule { }
