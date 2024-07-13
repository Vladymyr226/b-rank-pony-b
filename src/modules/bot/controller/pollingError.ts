import { getLogger } from '../../../common/logging'

const log = getLogger()

export const pollingErrorBot = (error) => {
  log.error(error)
}
