/**
 * トークン関連の型定義
 */

/**
 * サーバーアクセス権限のマップ
 */
export type TokenServerAccess = Record<string, boolean>;

/**
 * OAuth 2.1 Resource Indicators (RFC 8707)
 * Used to restrict token scope to specific resource servers
 */
export interface TokenResourceIndicator {
  /** Resource server URI this token is valid for */
  resource: string;
  /** Scopes granted for this resource */
  scopes?: string[];
}

/**
 * トークンのインターフェース
 */
export interface Token {
  id: string; // トークンの一意のID
  clientId: string; // 関連付けられたクライアントID
  issuedAt: number; // トークン発行時のUNIXタイムスタンプ
  serverAccess: TokenServerAccess; // サーバーごとのアクセス権（true=許可、false=拒否）
  expiresAt?: number; // トークンの有効期限（UNIXタイムスタンプ）
  /** RFC 8707 resource indicators - restricts token to specific resources */
  resourceIndicators?: TokenResourceIndicator[];
}

/**
 * トークン生成時のオプション
 */
export interface TokenGenerateOptions {
  clientId: string; // クライアントID
  serverAccess: TokenServerAccess; // アクセスを許可するサーバIDマップ
  expiresIn?: number; // トークンの有効期間（秒）、デフォルトは24時間
}

/**
 * トークン検証の結果
 */
export interface TokenValidationResult {
  isValid: boolean; // トークンが存在するかどうか
  clientId?: string; // 有効な場合のクライアントID
  error?: string; // エラーメッセージ（存在しない場合）
}
