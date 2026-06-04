import argon2 from 'argon2';
import config from '../config';

export class HashUtil {
  static async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  }

  static async verifyPassword(
    hashedPassword: string,
    password: string
  ): Promise<boolean> {
    return await argon2.verify(hashedPassword, password);
  }
}