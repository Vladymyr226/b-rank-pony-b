import { Message } from 'node-telegram-bot-api'
import { optionsOfCustomer } from '../bot.config'
import getBotInstance from '../../common/bot'
import getOpenAIInstance from '../../common/ai'
import { getLogger } from '../../../common/logging'
import { botRepository } from '../bot.repository'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { PassThrough, Readable } from 'node:stream'

const log = getLogger()
const bot = getBotInstance()
const openai = getOpenAIInstance()

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
    const response = await axios.get(photoUrl, { responseType: 'arraybuffer' })
    // Сохраняем временный файл
    // Преобразуем изображение в PNG с помощью sharp и сохраняем временный файл
    const tempFilePath = path.join(__dirname, 'temp_image.png')
    await sharp(response.data)
      .ensureAlpha()
      .png() // Конвертируем в PNG
      .toFile(tempFilePath) // Сохраняем файлУказываем конец потока

    // console.log(buffer)
    console.log(`Размер изображения: ${Buffer.byteLength(response.data)} байт`)

    const output = await openai.images.edit({
      model: 'dall-e-2',
      image: fs.createReadStream(tempFilePath),
      prompt,
      n: 2,
      size: '1024x1024',
    })
    // Удаляем временный файл
    fs.unlinkSync(tempFilePath)
    log.info('Running replicate,', 'user_tg_id =', msg.from.id, 'photoUrl:', photoUrl)
    const getReplicateEnable = await botRepository.getReplicateEnable(customer[0].id)

    // for (const outputElement of Object.values(output)) {
    //   await bot.sendPhoto(chatId, outputElement)
    // }
    await bot.sendPhoto(chatId, output.data[0].url)

    return bot.sendMessage(
      msg.chat.id,
      'Оберіть дію',
      optionsOfCustomer(customer[0].salon_id, { replicate_enable: !!getReplicateEnable.length }),
    )
  } catch (error) {
    log.error('Error:', error)
    return bot.sendMessage(chatId, 'Під час обробки запиту сталася помилка. Спробуйте ще раз.')
  }
}
