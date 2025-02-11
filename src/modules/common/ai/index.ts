import OpenAI from 'openai'

let openai: OpenAI = null

const getOpenAIInstance = () => {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_KEY })
  }
  return openai
}

export default getOpenAIInstance
