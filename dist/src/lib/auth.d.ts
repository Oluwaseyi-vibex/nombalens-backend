export interface AuthUser {
    merchantId: string;
}
export interface JwtPayload {
    merchantId?: string;
    id?: string;
    sub?: string;
    type?: "access" | "refresh";
    jti?: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare const signAccessToken: (merchantId: string) => string;
export declare const signRefreshToken: (merchantId: string, tokenId: string) => string;
export declare const signMerchantToken: (merchantId: string, expiresIn?: string | number) => string;
export declare const createTokenPair: (merchantId: string, refreshTokenId: string) => TokenPair;
export declare const verifyAccessToken: (token: string) => AuthUser;
export declare const verifyRefreshToken: (token: string) => {
    merchantId: string;
    tokenId: string;
};
export declare const verifyToken: (token: string) => AuthUser;
export declare const createRefreshTokenId: () => string;
export declare const getRefreshTokenExpiry: () => Date;
//# sourceMappingURL=auth.d.ts.map