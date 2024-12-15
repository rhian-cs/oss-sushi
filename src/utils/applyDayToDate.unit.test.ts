import { applyDayToDate } from './applyDayToDate';

describe('applyDayToDate', () => {
  const realDate = global.Date; // Save the original Date object

  function stubDateWithTimezone(timezoneOffsetMinutes: number) {
    (global as any).Date = class extends realDate {
      // Override getTimezoneOffset to simulate the timezone
      getTimezoneOffset() {
        return -timezoneOffsetMinutes; // Return the mock offset (in minutes)
      }
    };
  }

  afterEach(() => {
    global.Date = realDate; // Restore the original Date object after each test
  });

  const dayToApply = {
    dateString: '2023-04-01',
    day: 1,
    month: 4,
    timestamp: 1734134400000,
    year: 2023,
  };

  describe('when timezone is UTC', () => {
    describe('when date is present', () => {
      const date = new Date('2020-12-25T16:30:00.000Z');

      it('applies date in local timezone and does not touch hours', () => {
        const result = applyDayToDate(date, dayToApply);

        expect(result).toEqual(new Date('2023-04-01T16:30:00.000Z'));
        expect(result).toEqual(new Date('2023-04-01T16:30:00.000-00:00'));
      });
    });

    describe('when date is absent', () => {
      it('applies date in local timezone and zeroes hours out', () => {
        const result = applyDayToDate(null, dayToApply);

        expect(result).toEqual(new Date('2023-04-01T00:00:00.000Z'));
        expect(result).toEqual(new Date('2023-04-01T00:00:00.000-00:00'));
      });
    });
  });

  describe('when timezone is west of UTC', () => {
    beforeEach(() => {
      stubDateWithTimezone(-3 * 60);
    });

    describe('when date is present', () => {
      const date = new Date('2020-12-25T16:30:00.000Z');

      it('applies date in local timezone and does not touch hours', () => {
        const result = applyDayToDate(date, dayToApply);

        expect(result).toEqual(new Date('2023-04-01T16:30:00.000Z'));
        expect(result).toEqual(new Date('2023-04-01T13:30:00.000-03:00'));
      });
    });

    describe('when date is absent', () => {
      it('applies date in local timezone and zeroes hours out', () => {
        const result = applyDayToDate(null, dayToApply);

        expect(result).toEqual(new Date('2023-04-01T03:00:00.000Z'));
        expect(result).toEqual(new Date('2023-04-01T00:00:00.000-03:00'));
      });
    });
  });

  describe('when timezone is east of UTC', () => {
    beforeEach(() => {
      stubDateWithTimezone(+8 * 60);
    });

    describe('when date is present', () => {
      const date = new Date('2020-12-25T16:30:00.000Z');

      it('applies date in local timezone and does not touch hours', () => {
        const result = applyDayToDate(date, dayToApply);

        expect(result).toEqual(new Date('2023-04-01T16:30:00.000Z'));
        expect(result).toEqual(new Date('2023-04-02T00:30:00.000+08:00'));
      });
    });

    describe('when date is absent', () => {
      it('applies date in local timezone and zeroes hours out', () => {
        const result = applyDayToDate(null, dayToApply);

        expect(result).toEqual(new Date('2023-03-31T16:00:00.000Z'));
        expect(result).toEqual(new Date('2023-04-01T00:00:00.000+08:00'));
      });
    });
  });
});
