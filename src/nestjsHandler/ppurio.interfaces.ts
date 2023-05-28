import { Type } from '@nestjs/common';
export interface PpurioModuleOptions {
  userId: string;
}

export interface PpurioModuleAsyncOptions {
  imports?: any[];
  useFactory?: (
    ...args: any[]
  ) => Promise<PpurioModuleOptions> | PpurioModuleOptions;
  useClass?: Type<PpurioModuleOptionsFactory>;
  inject?: any;
}

export interface PpurioModuleOptionsFactory {
  createPpurioOptions(): Promise<PpurioModuleOptions> | PpurioModuleOptions;
}
