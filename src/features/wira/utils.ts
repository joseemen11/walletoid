export function parseDdMmYyyyToDate(value: string): Date | null {
  const [dayString, monthString, yearString] = value.split('/');
  const day = Number(dayString);
  const month = Number(monthString);
  const year = Number(yearString);

  if (!day || !month || !year) {
    return null;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function stringToBase64Url(inputString: string): string {
  // Convert bytes to base64url string
  const encoded = Buffer.from(inputString, 'utf8').toString('base64');
  
  return encoded;
};
  