export const cleanPhoneDigits = (raw: string): string => raw.replace(/\D/g, '');

export const extractNationalDigits = (raw: string): string => {
  let digits = cleanPhoneDigits(raw);

  if (digits.startsWith('992')) {
    digits = digits.slice(3);
  }

  return digits.slice(0, 9);
};

export const formatPhoneMask = (raw: string): string => {
  const national = extractNationalDigits(raw);

  if (national.length === 0) {
    return '';
  }

  let formatted = '+992';

  if (national.length > 0) {
    formatted += ` ${national.slice(0, 3)}`;
  }
  if (national.length >= 3) {
    formatted += ` ${national.slice(3, 5)}`;
  }
  if (national.length >= 5) {
    formatted += ` ${national.slice(5, 7)}`;
  }
  if (national.length >= 7) {
    formatted += ` ${national.slice(7, 9)}`;
  }

  return formatted;
};

export const formatPhoneDisplay = (phone: string): string => {
  const digits = cleanPhoneDigits(phone);

  if (digits.startsWith('992') && digits.length === 12) {
    const nat = digits.slice(3);
    return `+992 ${nat.slice(0, 3)} ${nat.slice(3, 5)} ${nat.slice(5, 7)} ${nat.slice(7, 9)}`;
  }

  const national = extractNationalDigits(phone);

  if (national.length === 9) {
    return `+992 ${national.slice(0, 3)} ${national.slice(3, 5)} ${national.slice(5, 7)} ${national.slice(7, 9)}`;
  }

  return phone;
};
