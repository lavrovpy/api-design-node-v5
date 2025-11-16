import type { Request, Response, NextFunction} from 'express'
import { verifyToken, type JwtPayload} from '../utils/jwt.ts'

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token){
      res.status(401).json({
        massage: 'Unauthorized'
      })
    }

    const payload = await verifyToken(token)
    req.user = payload
    next()
  } catch(e){
    return res.status(403).json({error: 'Forbidden'})
  }
}
