import Calendar from 'telegram-inline-calendar'
import TelegramBot from 'node-telegram-bot-api'

export const tgCalendar = (bot: TelegramBot) => {
  return new Calendar(bot, {
    date_format: 'DD-MM-YYYY о HH:mm',
    language: 'en',
    start_week_day: 1,
    time_selector_mod: true,
    time_range: '08:00-20:00',
    time_step: '40m',
    custom_start_msg: 'Будь ласка, оберіть зручну для вас дату та час 🙂',
  })
}

export const optionsOfCustomer = {
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

export const optionsOfAdmin = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "I'm an Admin", callback_data: '5' }],
      [{ text: 'Додати нову послугу', callback_data: '6' }],
      [{ text: 'Додати нового співробітника', callback_data: '7' }],
      [{ text: 'Показати всіх співробітників', callback_data: '8' }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
}
