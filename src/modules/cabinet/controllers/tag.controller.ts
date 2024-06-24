import { Request, Response } from 'express'
import db from '../../../common/db/knexKonfig'
import { CREATED, DELETED, UPDATED } from '../../../common/middleware/error.middleware'

export async function createTag(req, res: Response) {
  const { title } = req.query

  try {
    const newItem = await db('tags').insert({ name_of_tag: title }).returning('*')
    console.log(newItem)

    return res.status(201).json({ message: CREATED, tagId: newItem[0].id })
  } catch (error) {
    console.error('Error in tag.controller.ts', error)
    return res.status(400).json({ message: error })
  }
}

export async function getTags(req: Request, res: Response) {
  try {
    const getTags = await db.select('*').from('tags')

    return res.status(200).json({ getTags })
  } catch (error) {
    console.error('Error in tag.controller.ts', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export async function updateTag(req: Request, res: Response) {
  const { title } = req.query
  const { id } = req.query

  try {
    await db.table('tags').update({ name_of_tag: title }).where('id', id)

    return res.status(200).json({ message: UPDATED })
  } catch (error) {
    console.error('Error in tag.controller.ts', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export async function deleteTag(req: Request, res: Response) {
  const { id } = req.query

  try {
    await db('tags').where({ id }).del()

    return res.status(200).json({ message: DELETED })
  } catch (error) {
    console.error('Error in tag.controller.ts', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
