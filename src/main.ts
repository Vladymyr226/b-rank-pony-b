import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { createAuthRouter } from './modules/auth/routes/users'
import cors from 'cors'
import { Router } from 'express'
import { createPaymentRouter } from './modules/payment/routes/payment'
import { errorHandlerMiddleware } from './middleware/error.middleware'
import './configs/dotenv.config'
import { createCabinetRouter } from './modules/routes/routes'
import TelegramBot from 'node-telegram-bot-api';
import Calendar from 'telegram-inline-calendar';
import OpenAIApi from 'openai';
import { configureHealthCheckRouter } from "./modules/common/routes/healthcheck.routes";
import { getLogger } from "./middleware/logging";

const openai = new OpenAIApi({
  apiKey: process.env.OPENAI_KEY,
});

const bot = new TelegramBot(process.env.TG_BOT_TOKEN, {
  polling: true,
});

const calendar = new Calendar(bot, {
  date_format: 'DD-MM-YYYY о HH:mm',
  language: 'en',
  start_week_day: 1,
  time_selector_mod: true,
  time_range: '08:00-20:00',
  time_step: '40m',
  custom_start_msg: 'Будь ласка, оберіть зручну для вас дату та час 🙂',
});

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
};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Оберіть дію:', options);
});
bot.onText('Чина', (msg) => {
  bot.sendMessage(msg.chat.id, 'Саундтрек, санчізес, сюда-а');
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

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
    );
  }

  if (data === '2') {
    bot.sendMessage(chatId, 'Надішліть ваш контакт, натиснувши кнопку "Поділитися моїм контактом"', {
      reply_markup: {
        keyboard: [[{ text: 'Поділитися моїм контактом', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }

  if (data === '3') {
    calendar.startNavCalendar(query.message);
  }

  if (query.message.message_id == calendar.chats.get(query.message.chat.id)) {
    // res = calendar.clickButtonCalendar(query);

    // if (res !== -1) {
    //   bot.sendMessage(query.message.chat.id, '✅ Ви успішно здійснили запис до фахівця: ' + res);
    // }
  }

  if (data === '4') {
    bot.sendMessage(chatId, 'Будь ласка, надішліть своє фото для генерації стильної зачіски.');
  }
});

// bot.on('callback_query', (query) => {})

bot.on('polling_error', (error) => {
  console.log(error);
});

bot.on('contact', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Добре, очікуйте, майстер з вами зв'яжеться найближчим часом!`);
  bot.sendMessage(msg.chat.id, 'Оберіть дію:', options);
});

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const photoId = msg.photo[0].file_id;

  const photoInfo = await bot.getFile(photoId);
  const photoUrl = `https://api.telegram.org/file/bot${process.env.TG_BOT_TOKEN}/${photoInfo.file_path}`;

  const prompt = 'show more haircut options for this person';

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

    bot.sendMessage(msg.chat.id, 'Оберіть дію:', options);
  } catch (error) {
    console.error('Error:', error);
    bot.sendMessage(chatId, 'Під час обробки запиту сталася помилка. Спробуйте ще раз.');
  }
});

const { PORT } = process.env;
const app = express()
const log = getLogger();
log.info('Starting application');


app.use(express.json())

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

function addApiRoutes() {
  const router = Router({ mergeParams: true })

  router.use('/auth', createAuthRouter())
  router.use('/cabinet', createCabinetRouter())
  router.use('/payment', createPaymentRouter())

  return router
}

app.use('/api', addApiRoutes())

configureHealthCheckRouter(app);

app.use(errorHandlerMiddleware)

let port = parseInt(PORT, 10);

if (!port) {
  log.warn({}, 'Port is not defined, using default');
  port = 5000;
}

app.listen(process.env.PORT, () => {
  log.info(
    {
      port: PORT,
    },
    'listening...',
  );})

export default app
