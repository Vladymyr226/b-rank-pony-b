import { Request, Response } from 'express'

const paymentRedirect = async (req: Request, res: Response) => {
  if (req.body.order_status === 'approved') {
    res.redirect('https://www.shchus.co/gratitude')
  } else res.redirect('https://www.shchus.co/pricing')
}

export { paymentRedirect }
