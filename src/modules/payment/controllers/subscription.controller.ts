import axios from 'axios'
import { Request, Response } from 'express'
import crypto from 'crypto'

const subscriptionHandler = async (req: Request, res: Response) => {
  const { id } = req.query

  console.log('userID---------> ', id)

  const orderBody = {
    order_id: Date.now().toString(),
    merchant_id: '1396424',
    order_desc: 'SHCHUS.CO',
    amount: 80000,
    currency: 'UAH',
    response_url: 'https://shchus-co-backend.vercel.app/api/payment/redirect',
    server_callback_url: 'https://shchus-co-backend.vercel.app/api/payment/save',
    merchant_data: id?.toString(),
    lifetime: 60,
    delayed: 'N',
  }

  const orderedKeys = Object.keys(orderBody).sort()
  const signatureRaw = orderedKeys.map((value) => orderBody[value]).join('|')

  console.log(signatureRaw)

  const fondyPassword = 'test'

  const signature = crypto.createHash('sha1')
  signature.update(`${fondyPassword}|${signatureRaw}`)

  await axios
    .post(`${process.env.PAYMENT_BASE_URL}`, {
      request: {
        ...orderBody,
        signature: signature.digest('hex'),
      },
    })
    .then(function (response) {
      console.log(response.data)
      return res.status(200).json({
        body: response.data.response,
      })
    })
    .catch(function (error) {
      console.log('Error in test-fondy-controller.ts', error)
    })
}

export { subscriptionHandler }
