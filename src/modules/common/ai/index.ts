import Replicate from 'replicate'

let replicate: Replicate = null

const getReplicateAIInstance = () => {
  if (!replicate) {
    replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })
  }
  return replicate
}

export default getReplicateAIInstance
