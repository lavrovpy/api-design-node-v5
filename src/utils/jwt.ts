import {jwtVerify, SignJWT} from 'jose'
import { createSecretKey } from 'crypto'
import env from './../../env.ts'

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

const makeSecretKey = () => {
  const secret = env.JWT_SECRET
  const secretKey = createSecretKey(secret, 'utf8')
  return secretKey
}

export const generateToken = async (payload: JwtPayload) => {
  const secretKey = makeSecretKey()
  const signedToken = await new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN || '1h')
    .sign(secretKey)

  return signedToken
}

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const secretKey = makeSecretKey()
  const { payload } = await jwtVerify(token, secretKey)
  return payload as unknown as JwtPayload
}
