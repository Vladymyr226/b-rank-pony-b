import cron from 'node-cron'
import { botService } from '../../bot/bot.service'

const job = cron.schedule('* * * * *', botService.cronJobReminder)

export default job
