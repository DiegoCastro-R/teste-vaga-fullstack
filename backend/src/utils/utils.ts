function parseToCents(value: number): number {
  return Math.round(value * 100);
}

function parseValueToBRL(value: number): string {
  return Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));
}

const parseToDateISO = (dateString: string): Date => {
  const year = parseInt(dateString.slice(0, 4), 10);
  const month = parseInt(dateString.slice(4, 6), 10) - 1; // Months are 0-indexed
  const day = parseInt(dateString.slice(6, 8), 10);
  return new Date(year, month, day);
};

//https://irias.com.br/blog/como-validar-cpf-cnpj-em-node-js/
function validateCpfCnpj(cpfCnpj) {
  if (cpfCnpj.length == 14) {
    let cpf = cpfCnpj.trim();

    cpf = cpf.replace(/\./g, '');
    cpf = cpf.replace('-', '');
    cpf = cpf.split('');

    let v1 = 0;
    let v2 = 0;
    let aux = false;

    for (let i = 1; cpf.length > i; i++) {
      if (cpf[i - 1] != cpf[i]) {
        aux = true;
      }
    }

    if (aux == false) {
      return false;
    }

    for (let i = 0, p = 10; cpf.length - 2 > i; i++, p--) {
      v1 += cpf[i] * p;
    }

    v1 = (v1 * 10) % 11;

    if (v1 == 10) {
      v1 = 0;
    }

    if (v1 != cpf[9]) {
      return false;
    }

    for (let i = 0, p = 11; cpf.length - 1 > i; i++, p--) {
      v2 += cpf[i] * p;
    }

    v2 = (v2 * 10) % 11;

    if (v2 == 10) {
      v2 = 0;
    }

    if (v2 != cpf[10]) {
      return false;
    } else {
      return true;
    }
  } else if (cpfCnpj.length == 18) {
    let cnpj = cpfCnpj.trim();

    cnpj = cnpj.replace(/\./g, '');
    cnpj = cnpj.replace('-', '');
    cnpj = cnpj.replace('/', '');
    cnpj = cnpj.split('');

    let v1 = 0;
    let v2 = 0;
    let aux = false;

    for (let i = 1; cnpj.length > i; i++) {
      if (cnpj[i - 1] != cnpj[i]) {
        aux = true;
      }
    }

    if (aux == false) {
      return false;
    }

    for (let i = 0, p1 = 5, p2 = 13; cnpj.length - 2 > i; i++, p1--, p2--) {
      if (p1 >= 2) {
        v1 += cnpj[i] * p1;
      } else {
        v1 += cnpj[i] * p2;
      }
    }

    v1 = v1 % 11;

    if (v1 < 2) {
      v1 = 0;
    } else {
      v1 = 11 - v1;
    }

    if (v1 != cnpj[12]) {
      return false;
    }

    for (let i = 0, p1 = 6, p2 = 14; cnpj.length - 1 > i; i++, p1--, p2--) {
      if (p1 >= 2) {
        v2 += cnpj[i] * p1;
      } else {
        v2 += cnpj[i] * p2;
      }
    }

    v2 = v2 % 11;

    if (v2 < 2) {
      v2 = 0;
    } else {
      v2 = 11 - v2;
    }

    if (v2 != cnpj[13]) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}

const validateData = (row) => {
  const vlTotalInt = Number(row.vlTotal);
  const vlPrestaInt = Number(row.vlPresta);
  const qtPrestacoes = Number(row.qtPrestacoes);
  const vlMoraInt = Number(row.vlMora);
  const vlPrestaMora = vlPrestaInt + vlMoraInt;
  const calculatedPresta = Math.floor(vlTotalInt / qtPrestacoes);
  const calculatedPrestaMora = calculatedPresta + vlMoraInt;
  const vlMovimento = vlPrestaInt + vlMoraInt;
  const isPrestaMoraValid = calculatedPrestaMora === vlPrestaMora;
  const isPrestaValid = calculatedPresta === vlPrestaInt;
  const isMovimentoValid = vlMovimento <= calculatedPresta;
  const isCpfCnpjValid = validateCpfCnpj(row.nrCpfCnpj);

  return {
    ...row,
    vlTotalInt,
    vlPrestaInt,
    qtPrestacoes,
    vlMoraInt,
    vlPrestaMora,
    calculatedPresta,
    calculatedPrestaMora,
    vlMovimento,
    isPrestaValid,
    isPrestaMoraValid,
    isMovimentoValid,
    isCpfCnpjValid,
    isValid: isPrestaValid && isMovimentoValid && isCpfCnpjValid,
  };
};

export {
  parseToCents,
  parseValueToBRL,
  validateCpfCnpj,
  validateData,
  parseToDateISO,
};
