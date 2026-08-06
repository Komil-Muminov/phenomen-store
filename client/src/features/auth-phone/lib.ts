export const cleanPhoneDigits = (raw: string): string => raw.replace(/\D/g, '');

export const formatPhoneMask = (raw: string): string => {
  let digits = cleanPhoneDigits(raw);

  if (digits.length === 0) {
    return '';
  }

  if (digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  } else if (!digits.startsWith('7')) {
    digits = `7${digits}`;
  }

  digits = digits.slice(0, 11);

  let result = '+7';

  if (digits.length > 1) {
    result += ` (${digits.slice(1, 4)}`;
  }
  if (digits.length >= 4) {
    result += `) ${digits.slice(4, 7)}`;
  }
  if (digits.length >= 7) {
    result += `-${digits.slice(7, 9)}`;
  }
  if (digits.length >= 9) {
    result += `-${digits.slice(9, 11)}`;
  }

  return result;
};

export const formatPhoneDisplay = (phone: string): string => {
  const digits = cleanPhoneDigits(phone);

  if (digits.length !== 11) {
    return phone;
  }

  return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
};
