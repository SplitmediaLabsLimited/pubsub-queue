export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function safeJSONParse(val: string): any {
  try {
    return JSON.parse(val);
  } catch (err) {
    return val;
  }
}
