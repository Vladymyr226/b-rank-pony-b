import validator from 'validator'

export const isValidName = (name: string) => {
  const namePattern = /^[A-Za-zА-Яа-яІіЇїЄєҐґ'`-]{2,}$/
  return namePattern.test(name)
}

export const isValidPhoneNumber = (phoneNumber: string) => {
  return validator.isMobilePhone(phoneNumber, 'uk-UA')
}

export const isValidTime = (time: string) => {
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/
  return timePattern.test(time)
}

export const isValidDuration = (duration: string) => {
  const durationPattern = /^\d+$/
  const durationNumber = parseInt(duration, 10)
  return durationPattern.test(duration) && durationNumber > 0
}
