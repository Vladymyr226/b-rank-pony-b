import { Message } from 'node-telegram-bot-api'
import { optionsOfCustomer } from '../bot.config'
import getBotInstance from '../../common/bot'
import getReplicateAIInstance from '../../common/ai'
import { getLogger } from '../../../common/logging'
import { botRepository } from '../bot.repository'

const log = getLogger()
const bot = getBotInstance()
const replicate = getReplicateAIInstance()

export const photoChangeBot = async (msg: Message) => {
  const chatId = msg.chat.id
  const { id } = msg.from
  const customer = await botRepository.getCustomerByID({ user_tg_id: id })

  await bot.sendMessage(chatId, 'Обробка фото займе декілька секунд...')

  const photoId = msg.photo[msg.photo.length - 1].file_id
  const photoInfo = await bot.getFile(photoId)
  const photoUrl = `https://api.telegram.org/file/bot${process.env.TG_BOT_TOKEN}/${photoInfo.file_path}`

  const prompt = msg.caption || 'show a modern hairstyle, highly detailed, realistic, trendy, fashionable, high quality'

  try {
    const output = await replicate.run(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      process.env.REPLICATE_HASH_MODEL,
      {
        input: {
          image: photoUrl,
          width: 1080,
          height: 1920,
          prompt,
          refine: 'expert_ensemble_refiner',
          scheduler: 'K_EULER',
          lora_scale: 0.6,
          num_outputs: 4,
          guidance_scale: 10,
          apply_watermark: false,
          high_noise_frac: 0.8,
          negative_prompt: 'age and gender are different',
          prompt_strength: 0.9,
          num_inference_steps: 50,
        },
      },
    )

    log.info('Running replicate,', 'user_tg_id =', msg.from.id, 'photoUrl:', photoUrl)
    const getReplicateEnable = await botRepository.getReplicateEnable(customer[0].id)

    for (const outputElement of Object.values(output)) {
      await bot.sendPhoto(chatId, outputElement)
    }
    return bot.sendMessage(
      msg.chat.id,
      'Оберіть дію:',
      optionsOfCustomer(customer[0].salon_id, { replicate_enable: !!getReplicateEnable.length }),
    )
  } catch (error) {
    log.error('Error:', error)
    return bot.sendMessage(chatId, 'Під час обробки запиту сталася помилка. Спробуйте ще раз.')
  }
}
