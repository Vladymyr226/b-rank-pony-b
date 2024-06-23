import { paymentRedirect } from '../controllers/payment.redirect.controller'
import { paymentStatusBy } from '../controllers/paymentStatusBy.controller'
import { savePaymentObj } from '../controllers/savePaymentObj.controller'
import { subscriptionHandler } from '../controllers/subscription.controller'
import { Router } from 'express'

export function createPaymentRouter() {
  const router = Router({ mergeParams: true })

  router.post('/fondy', subscriptionHandler)
  router.post('/save', savePaymentObj)
  router.post('/redirect', paymentRedirect)
  router.post('/status-by', paymentStatusBy)

  return router
}
