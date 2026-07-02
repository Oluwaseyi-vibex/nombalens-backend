export declare const isValidPin: (pin: string) => boolean;
export declare const hashPin: (pin: string) => Promise<string>;
export declare const verifyPin: (pin: string, storedHash: string) => Promise<boolean>;
export declare const hashToken: (token: string) => string;
//# sourceMappingURL=password.d.ts.map