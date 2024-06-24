import { Router } from 'express'
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourse,
} from '../cabinet/controllers/course.controller'
import {
  createLesson,
  deleteLesson,
  getLessonById,
  getLessons,
  updateLesson,
} from '../cabinet/controllers/lesson.controller'
import { createTag, deleteTag, getTags, updateTag } from '../cabinet/controllers/tag.controller'

export function createCabinetRouter() {
  const router = Router({ mergeParams: true })

  router.post('/course', createCourse)
  router.get('/courses', getCourses)
  router.get('/course/:id', getCourseById)
  router.put('/course', updateCourse)
  router.delete('/course', deleteCourse)

  router.post('/lesson', createLesson)
  router.get('/lessons', getLessons)
  router.get('/lesson/:id', getLessonById)
  router.put('/lesson', updateLesson)
  router.delete('/lesson', deleteLesson)

  router.post('/tag', createTag)
  router.get('/tags', getTags)
  router.put('/tag', updateTag)
  router.delete('/tag', deleteTag)

  return router
}
