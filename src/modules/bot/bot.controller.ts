import { tgCalendar, options } from './bot.config'
import getBotInstance from '../common/bot'
import { getLogger } from '../../common/logging'
import { botRepository } from './bot.repository'

const log = getLogger()
const bot = getBotInstance()

const startCommandBot = async (msg) => {
  const { id, username, first_name, last_name } = msg.from
  const isUserByTgID = await botRepository.getUserByTgID(msg.from.id)

  if (!isUserByTgID.length) {
    await botRepository.insertUser({
      user_tg_id: id,
      username,
      first_name,
      last_name,
    })
    bot.sendMessage(msg.chat.id, 'Вітаю ' + first_name + ' ' + last_name)
  }
  bot.sendMessage(msg.chat.id, 'Оберіть дію:', options)
}

const callbackQueryBot = (query) => {
  const chatId = query.message.chat.id
  const data = query.data

  if (data === '1') {
    bot.sendMessage(
      chatId,
      `
1. "Блискучий Блиск" - манікюр + покриття гель-лаком - *350 грн*

2. "Дивовижний Вигляд" - професійний макіяж на вечірку - *500 грн*

3. "Відновлення Волосся" - процедура глибокого зволоження волосся - *600 грн*

4. "Релаксаційна Розкіш" - масаж обличчя та шиї - *400 грн*

5. "Розкішні Ресниці" - нарощування вій (класичне) - *700 грн*

6. "Чарівна Зміна" - стрижка + укладка - *800 грн*
`,
      {
        parse_mode: 'Markdown',
      },
    )
  }

  if (data === '2') {
    bot.sendMessage(chatId, 'Надішліть ваш контакт, натиснувши кнопку "Поділитися моїм контактом"', {
      reply_markup: {
        keyboard: [[{ text: 'Поділитися моїм контактом', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
  }

  if (data === '3') {
    tgCalendar(bot).startNavCalendar(query.message)
  }

  const calendarTimeResponse = tgCalendar(bot).clickButtonCalendar(query)

  if (calendarTimeResponse !== -1) {
    bot.sendMessage(query.message.chat.id, '✅ Ви успішно здійснили запис до фахівця: ' + calendarTimeResponse)
  }

  if (data === '4') {
    bot.sendMessage(chatId, 'Будь ласка, надішліть своє фото для генерації стильної зачіски.')
  }
}

const pollingErrorBot = (error) => {
  log.error(error)
}

const contactTelBot = (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, `Добре, очікуйте, майстер з вами зв'яжеться найближчим часом!`)
  bot.sendMessage(msg.chat.id, 'Оберіть дію:', options)
}

const photoChangeBot = async (msg) => {
  const chatId = msg.chat.id
  const photoId = msg.photo[0].file_id

  const photoInfo = await bot.getFile(photoId)
  const photoUrl = `https://api.telegram.org/file/bot${process.env.TG_BOT_TOKEN}/${photoInfo.file_path}`

  const prompt = 'show more haircut options for this person'

  // model: 'dall-e-2',
  // image: fs.createReadStream(photoUrl),
  // prompt,
  // n: 1,
  // size: '1024x1024',

  try {
    // const response = await openai.createImageEdit(
    //   fs.createReadStream('./img/Volodya.jpeg'),
    //   fs.createReadStream('./img/Volodya.jpeg'),
    //   // prompt,
    //   'show more haircut options for this person',
    //
    //   // fs.createReadStream(photoUrl),
    //
    //   // fs.createReadStream('mask.png'),
    //
    //   1,
    //   '1024x1024',
    // );
    // image_url = response.data[0].url;

    // console.log(image_url);

    // await bot.sendPhoto(chatId, image_url)

    bot.sendMessage(msg.chat.id, 'Оберіть дію:', options)
  } catch (error) {
    console.error('Error:', error)
    bot.sendMessage(chatId, 'Під час обробки запиту сталася помилка. Спробуйте ще раз.')
  }
}

export const BotController = {
  startCommandBot,
  callbackQueryBot,
  pollingErrorBot,
  contactTelBot,
  photoChangeBot,
}
