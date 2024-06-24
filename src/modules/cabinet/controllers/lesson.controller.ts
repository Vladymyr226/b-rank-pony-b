import { Request, Response } from 'express'
import db from '../../../db/knexKonfig'
import { CREATED, DELETED, UPDATED } from '../../../middleware/error.middleware'

export async function createLesson(req, res: Response) {
  const json = req.body

  try {
    const newItem = await db('lesson').insert({ data: json }).returning('*')
    console.log(newItem)

    return res.status(201).json({ message: CREATED, lessonId: newItem[0].id })
  } catch (error) {
    console.error('Error in lesson.controller.ts', error)
    return res.status(400).json({ message: error })
  }
}

export async function getLessons(req: Request, res: Response) {
  try {
    const getLessons = await db.select('*').from('lesson')

    return res.status(200).json({ getLessons })
  } catch (error) {
    console.error('Error in lesson.controller.ts', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export async function getLessonById(req: Request, res: Response) {
  const { id } = req.params

  try {
    const lesson = await db.select('*').from('lesson').where('id', id).first()

    if (lesson) {
      return res.status(200).json(lesson)
    } else {
      return res.status(404).json({ message: 'Lesson not found' })
    }
  } catch (error) {
    console.error('Error in lesson.controller.ts', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export async function updateLesson(req: Request, res: Response) {
  const newJson = req.body
  const { id } = req.query

  try {
    await db.table('lesson').update({ data: newJson }).where('id', id)

    return res.status(200).json({ message: UPDATED })
  } catch (error) {
    console.error('Error in lesson.controller.ts', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export async function deleteLesson(req: Request, res: Response) {
  const { id } = req.query

  try {
    await db('lesson').where({ id }).del()

    return res.status(200).json({ message: DELETED })
  } catch (error) {
    console.error('Error in lesson.controller.ts', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
