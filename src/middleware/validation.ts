import type { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'

export const validateBody = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try{
      const validatedData = schema.parse(req.body)
      // Reassign validated data to ensure type coercion and default values from schema are applied
      req.body = validatedData
      next()
    } catch(e) {
      if(e instanceof ZodError){
        return res.status(400).json({
          error: 'validation failed',
          details: e.issues.map((err) => {
            return {
              field: err.path.join('.'),
              message: err.message,
            }
          })
        })
      }
      next(e)
    }
  }
}
