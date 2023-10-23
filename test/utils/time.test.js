import { formatTime, secondsToFullHourString } from 'utils/time'

describe('formatTime', () => {
  describe('withHour is true', () => {
    it('returns 00:00:10', () => {
      expect(formatTime(10 * 1000, true)).toBe('00:00:10')
    })

    it('returns 00:10:00', () => {
      expect(formatTime(600 * 1000, true)).toBe('00:10:00')
    })

    it('returns 01:00:00', () => {
      expect(formatTime(3600 * 1000, true)).toBe('01:00:00')
    })

    it('returns 01:30:00', () => {
      expect(formatTime(5400 * 1000, true)).toBe('01:30:00')
    })

    it('returns 01:30:20', () => {
      expect(formatTime(5420 * 1000, true)).toBe('01:30:20')
    })

    it('returns 01:00:20', () => {
      expect(formatTime(3620 * 1000, true)).toBe('01:00:20')
    })

    it('returns 00:01:20', () => {
      expect(formatTime(80 * 1000, true)).toBe('00:01:20')
    })

    it('returns 02:00:20', () => {
      expect(formatTime(7220 * 1000, true)).toBe('02:00:20')
    })

    it('returns 00:01:00', () => {
      expect(formatTime(60 * 1000, true)).toBe('00:01:00')
    })

    it('returns 00:01:01', () => {
      expect(formatTime(61 * 1000, true)).toBe('00:01:01')
    })
  })

  describe('withHour is false', () => {
    it('returns 00:10', () => {
      expect(formatTime(10 * 1000)).toBe('00:10')
    })

    it('returns 10:00', () => {
      expect(formatTime(600 * 1000)).toBe('10:00')
    })

    it('returns 00:00', () => {
      expect(formatTime(3600 * 1000)).toBe('60:00')
    })

    it('returns 90:00', () => {
      expect(formatTime(5400 * 1000)).toBe('90:00')
    })

    it('returns 90:20', () => {
      expect(formatTime(5420 * 1000)).toBe('90:20')
    })

    it('returns 60:20', () => {
      expect(formatTime(3620 * 1000)).toBe('60:20')
    })

    it('returns 01:20', () => {
      expect(formatTime(80 * 1000)).toBe('01:20')
    })

    it('returns 120:20', () => {
      expect(formatTime(7220 * 1000)).toBe('120:20')
    })

    it('returns 01:00', () => {
      expect(formatTime(60 * 1000)).toBe('01:00')
    })

    it('returns 01:01', () => {
      expect(formatTime(61 * 1000)).toBe('01:01')
    })
  })
})

describe('secondsToFullHourString', () => {
  it('returns 1 hour', () => {
    expect(secondsToFullHourString(3600)).toBe('1 hour')
  })

  it('returns 2 hours', () => {
    expect(secondsToFullHourString(3600 * 2)).toBe('2 hours')
  })

  it('returns 10 hours', () => {
    expect(secondsToFullHourString(3600 * 10)).toBe('10 hours')
  })

  it('returns 1 minute', () => {
    expect(secondsToFullHourString(60)).toBe('1 minute')
  })

  it('returns 2 minutes', () => {
    expect(secondsToFullHourString(60 * 2)).toBe('2 minutes')
  })

  it('returns 10 minutes', () => {
    expect(secondsToFullHourString(60 * 10)).toBe('10 minutes')
  })

  it('returns 1 second', () => {
    expect(secondsToFullHourString(1)).toBe('1 second')
  })

  it('returns 2 seconds', () => {
    expect(secondsToFullHourString(2)).toBe('2 seconds')
  })

  it('returns 10 seconds', () => {
    expect(secondsToFullHourString(10)).toBe('10 seconds')
  })

  it('returns 1 minute 10 seconds', () => {
    expect(secondsToFullHourString(70)).toBe('1 minute 10 seconds')
  })

  it('returns 1 minute 1 second', () => {
    expect(secondsToFullHourString(61)).toBe('1 minute 1 second')
  })

  it('returns 3 minutes 10 seconds', () => {
    expect(secondsToFullHourString(60 * 3 + 10)).toBe('3 minutes 10 seconds')
  })

  it('returns 3 minutes 1 second', () => {
    expect(secondsToFullHourString(60 * 3 + 1)).toBe('3 minutes 1 second')
  })

  it('returns 1 hour 10 seconds', () => {
    expect(secondsToFullHourString(3600 * 1 + 10)).toBe('1 hour 10 seconds')
  })

  it('returns 1 hour 1 second', () => {
    expect(secondsToFullHourString(3600 * 1 + 1)).toBe('1 hour 1 second')
  })

  it('returns 2 hours 10 seconds', () => {
    expect(secondsToFullHourString(3600 * 2 + 10)).toBe('2 hours 10 seconds')
  })

  it('returns 2 hours 1 second', () => {
    expect(secondsToFullHourString(3600 * 2 + 1)).toBe('2 hours 1 second')
  })

  it('returns 1 hour 2 minutes', () => {
    expect(secondsToFullHourString(3600 * 1 + 60 * 2)).toBe('1 hour 2 minutes')
  })

  it('returns 1 hour 1 minute', () => {
    expect(secondsToFullHourString(3600 * 1 + 60 * 1)).toBe('1 hour 1 minute')
  })

  it('returns 2 hours 2 minutes', () => {
    expect(secondsToFullHourString(3600 * 2 + 60 * 2)).toBe('2 hours 2 minutes')
  })

  it('returns 2 hours 1 minute', () => {
    expect(secondsToFullHourString(3600 * 2 + 60 * 1)).toBe('2 hours 1 minute')
  })

  it('returns 1 hour 1 minute 1 second', () => {
    expect(secondsToFullHourString(3600 * 1 + 60 * 1 + 1)).toBe(
      '1 hour 1 minute 1 second',
    )
  })

  it('returns 1 hour 1 minute 2 seconds', () => {
    expect(secondsToFullHourString(3600 * 1 + 60 * 1 + 2)).toBe(
      '1 hour 1 minute 2 seconds',
    )
  })

  it('returns 1 hour 2 minutes 1 second', () => {
    expect(secondsToFullHourString(3600 * 1 + 60 * 2 + 1)).toBe(
      '1 hour 2 minutes 1 second',
    )
  })

  it('returns 1 hour 2 minutes 2 seconds', () => {
    expect(secondsToFullHourString(3600 * 1 + 60 * 2 + 2)).toBe(
      '1 hour 2 minutes 2 seconds',
    )
  })

  it('returns 2 hours 1 minute 1 second', () => {
    expect(secondsToFullHourString(3600 * 2 + 60 * 1 + 1)).toBe(
      '2 hours 1 minute 1 second',
    )
  })

  it('returns 2 hours 2 minutes 1 second', () => {
    expect(secondsToFullHourString(3600 * 2 + 60 * 2 + 1)).toBe(
      '2 hours 2 minutes 1 second',
    )
  })

  it('returns 2 hours 1 minute 2 seconds', () => {
    expect(secondsToFullHourString(3600 * 2 + 60 * 1 + 2)).toBe(
      '2 hours 1 minute 2 seconds',
    )
  })

  it('returns 2 hours 2 minutes 2 seconds', () => {
    expect(secondsToFullHourString(3600 * 2 + 60 * 2 + 2)).toBe(
      '2 hours 2 minutes 2 seconds',
    )
  })

  it('returns 2 hours 59 minutes', () => {
    expect(secondsToFullHourString(3600 * 2 + 60 * 59)).toBe(
      '2 hours 59 minutes',
    )
  })

  it('returns 3 hours 1 minute', () => {
    expect(secondsToFullHourString(3600 * 2 + 60 * 61)).toBe('3 hours 1 minute')
  })

  it('returns 19 hours 30 minutes 19 seconds', () => {
    expect(secondsToFullHourString(3600 * 19 + 60 * 30 + 19)).toBe(
      '19 hours 30 minutes 19 seconds',
    )
  })
})
