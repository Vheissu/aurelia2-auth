import { FetchConfig } from './auth-fetch-config';
import { defaultAuthConfigOptions, IAuthConfigOptions } from './base-config';
import { AuthService } from './auth-service';
import { AuthorizeHook } from './authorize-hook';
import { AuthFilterValueConverter } from './auth-filter';
import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';

export const DefaultComponents: IRegistry[] = [
    AuthFilterValueConverter as unknown as IRegistry,
    AuthService as unknown as IRegistry,
    AuthorizeHook as unknown as IRegistry,
    FetchConfig as unknown as IRegistry
];

export const IAuthOptions = DI.createInterface<IAuthConfigOptions>('IAuthOptions');

function instantiateAuthConfiguration(optionsCallback: (options: IAuthConfigOptions) => void) {
    return {
        optionsCallback,
        register(container: IContainer): IContainer {
            optionsCallback(defaultAuthConfigOptions);
    
            return container.register(Registration.instance(IAuthOptions, defaultAuthConfigOptions), DefaultComponents);
        },
        customize(callback?: (options: IAuthConfigOptions) => void) {
            return instantiateAuthConfiguration(callback ?? optionsCallback);
        }
    }
}

export const AureliaAuthConfiguration = instantiateAuthConfiguration(() => {});