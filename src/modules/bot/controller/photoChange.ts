import { Message } from 'node-telegram-bot-api'
import { optionsOfCustomer } from '../bot.config'
import Replicate from 'replicate'
import getBotInstance from '../../common/bot'

const bot = getBotInstance()
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export const photoChangeBot = async (msg: Message) => {
  const chatId = msg.chat.id
  const photoId = msg.photo[msg.photo.length - 1].file_id // Используем наибольшее разрешение

  const photoInfo = await bot.getFile(photoId)
  const photoUrl = `https://api.telegram.org/file/bot${process.env.TG_BOT_TOKEN}/${photoInfo.file_path}`

  const prompt = 'make her hair shorter and with bangs'

  console.log(22222222, msg.photo, photoInfo, photoUrl)

  try {
    // const response2 = await axios({
    //   url: photoUrl,
    //   method: 'GET',
    //   responseType: 'arraybuffer', // Ensure response is treated as an array buffer
    // })

    // const response = await openAI.images.generate({
    //   model: 'dall-e-3',
    //   // image: photoUrl,
    //   prompt: prompt,
    //   n: 1,
    //   size: '1024x1024',
    // })
    // const image_url = response.data[0].url

    const output = await replicate.run(
      'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
      {
        input: {
          image: photoUrl,
          width: 768,
          height: 768,
          prompt,
          refine: 'expert_ensemble_refiner',
          scheduler: 'K_EULER',
          lora_scale: 0.6,
          num_outputs: 1,
          guidance_scale: 7.5,
          apply_watermark: false,
          high_noise_frac: 0.8,
          negative_prompt: '',
          prompt_strength: 0.8,
          num_inference_steps: 25,
        },
      },
    )
    console.log(output)

    await bot.sendPhoto(chatId, output[0])

    return bot.sendMessage(msg.chat.id, 'Оберіть дію:', optionsOfCustomer(1))
  } catch (error) {
    console.error('Error:', error)
    return bot.sendMessage(chatId, 'Під час обробки запиту сталася помилка. Спробуйте ще раз.')
  }
}
