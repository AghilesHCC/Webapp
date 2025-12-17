export function transformSnakeToCamel<T extends Record<string, any>>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformSnakeToCamel(item)) as any;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const transformed: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      transformed[camelKey] = transformSnakeToCamel(obj[key]);
    }
  }

  return transformed as T;
}

export function transformCamelToSnake<T extends Record<string, any>>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformCamelToSnake(item)) as any;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const transformed: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      transformed[snakeKey] = transformCamelToSnake(obj[key]);
    }
  }

  return transformed as T;
}
