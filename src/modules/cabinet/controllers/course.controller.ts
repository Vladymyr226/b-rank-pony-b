import { Request, Response } from 'express'
import db from '../../../db/knexKonfig'
import { CREATED, DELETED, UPDATED } from '../../../middleware/error.middleware'

export async function createCourse(req, res: Response) {
  const json = req.body
  const { isActive } = req.query

  try {
    const newItem = await db('course').insert({ data: json, is_active: isActive }).returning('*')
    console.log(newItem)

    return res.status(201).json({ message: CREATED })
  } catch (error) {
    console.error('Error in course.controller.ts', error)
    return res.status(400).json({ message: error })
  }
}

export async function getCourses(req: Request, res: Response) {
  try {
    const getCourses = await db.select('*').from('course')

    return res.status(200).json({ getCourses })
  } catch (error) {
    console.error('Error in course.controller.ts', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export async function getCourseById(req: Request, res: Response) {
  const { id } = req.params
  try {
    const course = await db.select('*').from('course').where('id', id).first()

    if (course) {
      return res.status(200).json(course)
    } else {
      return res.status(404).json({ message: 'Course not found' })
    }
  } catch (error) {
    console.error('Error in course.controller.ts', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export async function updateCourse(req: Request, res: Response) {
  const newJson = req.body
  const { id, isActive } = req.query

  try {
    await db.table('course').update({ data: newJson, is_active: isActive }).where('id', id)

    return res.status(200).json({ message: UPDATED })
  } catch (error) {
    console.error('Error in course.controller.ts', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export async function deleteCourse(req: Request, res: Response) {
  const { id } = req.query

  try {
    await db('course').where({ id }).del()

    return res.status(200).json({ message: DELETED })
  } catch (error) {
    console.error('Error in course.controller.ts', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
