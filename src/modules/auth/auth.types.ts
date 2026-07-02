export interface SetPinInput {
  phone: string;
  pin: string;
}

export interface RegisterInput {
  businessName: string;
  phone: string;
  subAccountId: string;
  pin: string;
}

export interface LoginInput {
  phone: string;
  pin: string;
}

export interface RefreshInput {
  refreshToken: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  merchant: MerchantProfile;
}

export interface MerchantProfile {
  id: string;
  businessName: string;
  phone: string;
  subAccountId: string;
  accountNumber: string | null;
  accountName: string | null;
  bankName: string | null;
  createdAt: Date;
}
