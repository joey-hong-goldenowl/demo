import { Auth0Category } from 'redux/reducer/sign-in-reducer'
import {
  strNumberToStrDecimalNumber,
  validateDecimalNumber,
  validateNumber,
  getAuth0Category,
} from 'utils/text'

describe('strNumberToStrDecimalNumber', () => {
  it('Number < 10', () => {
    expect(strNumberToStrDecimalNumber('2')).toBe('0.02')
  })

  it('Number < 100', () => {
    expect(strNumberToStrDecimalNumber('40')).toBe('0.40')
  })

  it('Number < 1000', () => {
    expect(strNumberToStrDecimalNumber('705')).toBe('7.05')
  })

  it('Number with dot (.)', () => {
    expect(strNumberToStrDecimalNumber('7.')).toBe('0.07')
  })

  it('Number with special character (!)', () => {
    expect(strNumberToStrDecimalNumber('7!')).toBe('0.07')
  })

  it('Number with space', () => {
    expect(strNumberToStrDecimalNumber('7 ')).toBe('0.07')
  })
})

describe('validateDecimalNumber', () => {
  it('String is number (with dot)', () => {
    expect(validateDecimalNumber('7.0')).toBe(true)
  })

  it('String is number (without dot)', () => {
    expect(validateDecimalNumber('7')).toBe(true)
  })

  it('String is not a number', () => {
    expect(validateDecimalNumber('a')).toBe(false)
  })

  it('String is a number with special character (not dot)', () => {
    expect(validateDecimalNumber('7#')).toBe(false)
  })
})

describe('validateNumber', () => {
  it('String is a number', () => {
    expect(validateNumber('82')).toBe(true)
  })

  it('String is a number (with dot)', () => {
    expect(validateNumber('82.')).toBe(false)
  })

  it('String is a number with special character (not dot)', () => {
    expect(validateNumber('82!')).toBe(false)
  })

  it('String is not a number', () => {
    expect(validateNumber('a')).toBe(false)
  })
})

describe('getAuth0Category', () => {
  it('Google Auth0 string', () => {
    expect(getAuth0Category('google-oauth2|XXXXXX')).toBe(Auth0Category.GOOGLE)
  })

  it('Apple Auth0 string', () => {
    expect(getAuth0Category('apple|XXXXXX')).toBe(Auth0Category.APPLE)
  })
})
