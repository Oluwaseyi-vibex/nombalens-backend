import type { AuthTokensResponse, LoginInput, MerchantProfile, RegisterInput } from "./auth.types.js";
export declare const register: (input: RegisterInput) => Promise<AuthTokensResponse>;
export declare const login: (input: LoginInput) => Promise<AuthTokensResponse>;
export declare const refresh: (refreshToken: string) => Promise<AuthTokensResponse>;
export declare const logout: (refreshToken: string) => Promise<void>;
export declare const getProfile: (merchantId: string) => Promise<MerchantProfile>;
//# sourceMappingURL=auth.service.d.ts.map