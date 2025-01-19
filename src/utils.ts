export const timeFormat = new Intl.DateTimeFormat("fr-CH", {
  dateStyle: undefined,
  timeStyle: "medium",
});

export function logger(...args: string[]) {
  console.log(`${new Date().toISOString()}`, ...args);
}
