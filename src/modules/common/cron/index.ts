import cron from 'node-cron'
import { botService } from '../../bot/bot.service'

const job = cron.schedule('0 * * * *', botService.cronJobReminder)

export default job
