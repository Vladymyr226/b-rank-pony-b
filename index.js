import TelegramBot from 'node-telegram-bot-api'
import Calendar from 'telegram-inline-calendar'
import config from 'config'
import { Configuration, OpenAIApi } from 'openai'
import express from 'express'
import fs from 'fs'

const TOKEN = '7125472368:AAG-I3gg-ctP86N5FGBEovFDybIsB_wJOIk'
const PORT = process.env.PORT || 4000

const configuration = new Configuration({
  apiKey: config.get('OPENAI_KEY'),
})
const openai = new OpenAIApi(configuration)

const bot = new TelegramBot(TOKEN)
bot.setWebHook(`https://your-vercel-app-url.vercel.app/webhook`)

const app = express()
app.use(express.json())

const calendar = new Calendar(bot, {
  date_format: 'DD-MM-YYYY о HH:mm',
  language: 'en',
  start_week_day: 1,
  time_selector_mod: true,
  time_range: '08:00-20:00',
  time_step: '40m',
  custom_start_msg: 'Будь ласка, оберіть зручну для вас дату та час 🙂',
})

const options = {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Дізнатися інформацію про послуги закладу', callback_data: '1' }],
      [{ text: 'Замовити зворотній дзвінок', callback_data: '2', request_contact: true }],
      [{ text: 'Записатися онлайн до фахівця закладу', callback_data: '3' }],
      [
        {
          text: 'Згенерувати стильну зачіску за моїм фото',
          callback_data: '4',
        },
      ],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Оберіть дію:', options)
})
bot.onText('Чина', (msg) => {
  bot.sendMessage(msg.chat.id, 'Саундтрек, санчізес, сюда-а')
})

bot.on('callback_query', (query) => {
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
      }
    )
  }

  if (data === '2') {
    bot.sendMessage(
      chatId,
      'Надішліть ваш контакт, натиснувши кнопку "Поділитися моїм контактом"',
      {
        reply_markup: {
          keyboard: [[{ text: 'Поділитися моїм контактом', request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    )
  }

  if (data === '3') {
    calendar.startNavCalendar(query.message)
  }

  if (query.message.message_id == calendar.chats.get(query.message.chat.id)) {
    const res = calendar.clickButtonCalendar(query)

    if (res !== -1) {
      bot.sendMessage(query.message.chat.id, '✅ Ви успішно здійснили запис до фахівця: ' + res)
    }
  }

  if (data === '4') {
    bot.sendMessage(chatId, 'Будь ласка, надішліть своє фото для генерації стильної зачіски.')
  }
})

bot.on('contact', (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, `Добре, очікуйте, майстер з вами зв'яжеться найближчим часом!`)
  bot.sendMessage(msg.chat.id, 'Оберіть дію:', options)
})

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id
  const photoId = msg.photo[0].file_id

  const photoInfo = await bot.getFile(photoId)
  const photoUrl = `https://api.telegram.org/file/bot${TOKEN}/${photoInfo.file_path}`

  const prompt = 'show more haircut options for this person'

  try {
    const response = await openai.createImageEdit(
      fs.createReadStream('./img/Volodya.jpeg'),
      fs.createReadStream('./img/Volodya.jpeg'),
      'show more haircut options for this person',
      1,
      '1024x1024'
    )
    const imageUrl = response.data[0].url

    console.log(imageUrl)

    bot.sendMessage(msg.chat.id, 'Оберіть дію:', options)
  } catch (error) {
    console.error('Error:', error)
    bot.sendMessage(chatId, 'Під час обробки запиту сталася помилка. Спробуйте ще раз.')
  }
})

app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
