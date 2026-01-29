/**
 * Validate Brazilian CPF (Cadastro de Pessoas Físicas)
 * CPF format: 11 digits
 */
export function validateCPF(cpf: string): boolean {
  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '');

  // Check if has 11 digits
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Check if all digits are the same (invalid CPFs like 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let checkDigit1 = 11 - (sum % 11);
  if (checkDigit1 >= 10) checkDigit1 = 0;

  if (checkDigit1 !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let checkDigit2 = 11 - (sum % 11);
  if (checkDigit2 >= 10) checkDigit2 = 0;

  if (checkDigit2 !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }

  return true;
}

/**
 * Validate Brazilian CNPJ (Cadastro Nacional da Pessoa Jurídica)
 * CNPJ format: 14 digits
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove non-numeric characters
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  // Check if has 14 digits
  if (cleanCNPJ.length !== 14) {
    return false;
  }

  // Check if all digits are the same (invalid CNPJs)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }

  // Validate first check digit
  let length = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, length);
  const digits = cleanCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }

  // Validate second check digit
  length = length + 1;
  numbers = cleanCNPJ.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    return false;
  }

  return true;
}

/**
 * Clean document (remove formatting)
 */
export function cleanDocument(document: string): string {
  return document.replace(/\D/g, '');
}

/**
 * Validate CPF or CNPJ based on length
 */
export function validateDocument(document: string): boolean {
  const clean = cleanDocument(document);

  if (clean.length === 11) {
    return validateCPF(clean);
  } else if (clean.length === 14) {
    return validateCNPJ(clean);
  }

  return false;
}
