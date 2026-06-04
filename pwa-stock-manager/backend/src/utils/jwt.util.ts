import jwt from 'jsonwebtoken';
import config from '../config';
import { JWTPayload, AuthTokens } from '../types';

export class JWTUtil {
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.ACCESS_TOKEN_EXPIRY,
    });
  }

  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.REFRESH_TOKEN_EXPIRY,
    });
  }

  static generateTokens(payload: JWTPayload): AuthTokens {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, config.JWT_SECRET) as JWTPayload;
  }

  static verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as JWTPayload;
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }
}