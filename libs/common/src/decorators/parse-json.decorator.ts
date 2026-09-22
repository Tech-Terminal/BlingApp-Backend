import { Transform } from 'class-transformer';

export function ParseJson() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return {};
      }
    }
    return value;
  });
}
