import { Module, Global, DynamicModule, Provider } from '@nestjs/common';
import { PpurioService } from './ppurio.service';
import {
  PpurioModuleOptions,
  PpurioModuleAsyncOptions,
  PpurioModuleOptionsFactory,
} from './ppurio.interfaces';

@Global()
@Module({})
export class PpurioModule {
  static forRoot(options: PpurioModuleOptions): DynamicModule {
    return {
      module: PpurioModule,
      providers: [
        {
          provide: 'PPURIO_OPTIONS',
          useValue: options,
        },
        {
          provide: 'PPURIO_USER_ID',
          useValue: options.userId,
        },
        PpurioService,
      ],
      exports: [PpurioService],
    };
  }

  static forRootAsync(options: PpurioModuleAsyncOptions): DynamicModule {
    return {
      module: PpurioModule,
      imports: options.imports,
      providers: [...this.createAsyncProviders(options), PpurioService],
      exports: [PpurioService],
    };
  }

  private static createAsyncProviders(
    options: PpurioModuleAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: 'PPURIO_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: 'PPURIO_USER_ID',
          useFactory: (ppurioOptions: PpurioModuleOptions) =>
            ppurioOptions.userId,
          inject: ['PPURIO_OPTIONS'],
        },
      ];
    }

    if (options.useClass) {
      return [
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
        {
          provide: 'PPURIO_USER_ID',
          useFactory: async (factory: PpurioModuleOptionsFactory) => {
            const ppurioOptions = await factory.createPpurioOptions();
            return ppurioOptions.userId;
          },
          inject: [options.useClass],
        },
      ];
    }

    throw new Error('Invalid PpurioModuleAsyncOptions configuration');
  }
}
