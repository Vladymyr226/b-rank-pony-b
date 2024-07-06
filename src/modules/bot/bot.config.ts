import Calendar from 'telegram-inline-calendar'
import TelegramBot from 'node-telegram-bot-api'
import moment from 'moment-timezone'

export const tgCalendar = (bot: TelegramBot, from: string, to: string, duration: number, busyTimes: Array<string>) => {
  const now = moment().tz('Europe/Kiev').startOf('day')
  const oneMonthLater = moment().add(2, 'months')

  const calendar = new Calendar(bot, {
    date_format: 'DD-MM-YYYY HH:mm',
    language: 'en',
    start_week_day: 1,
    time_selector_mod: true,
    time_range: from + '-' + to,
    time_step: duration + 'm',
    custom_start_msg: 'Будь ласка, оберіть зручну для вас дату та час 🙂',
    bot_api: 'node-telegram-bot-api',
    close_calendar: true,
    lock_datetime: true,
    lock_date: true,
    start_date: now,
    stop_date: oneMonthLater,
  })
  calendar.lock_datetime_array = busyTimes

  return calendar
}

export const optionsOfCustomer = (salon_id: number) => ({
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Мої записи', callback_data: '9' }],
      [{ text: salon_id ? 'Дізнатися інформацію про послуги закладу' : '', callback_data: '1' }],
      [{ text: salon_id ? 'Замовити зворотній дзвінок' : '', callback_data: '2', request_contact: true }],
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
})

export const optionsOfAdmin = {
  reply_markup: {
    inline_keyboard: [
      [{ text: 'Записи закладу', callback_data: '10' }],
      [{ text: 'Наші послуги', callback_data: '5' }],
      [{ text: 'Додати нову послугу', callback_data: '6' }],
      [{ text: 'Додати нового співробітника', callback_data: '7' }],
      [{ text: 'Показати всіх співробітників', callback_data: '8' }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
}
