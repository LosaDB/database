/**
 * IOP password encryption helpers.
 *
 * Matches the C++ implementation in ioLocalManagerParent::EncryptDecryptData
 * with bPassword = true (the key used for Lost Saga .iop archive passwords).
 *
 * The operation is symmetric: applying the same transform to an encrypted byte
 * array returns the original plaintext.
 */

export const MAX_PASSWORD = 20;

const MAX_KEY = 30;

/** Password key row from ioLocalManagerParent.cpp (bPassword = true). */
const IOP_PASSWORD_KEY = new Uint8Array([
  255, 1, 2, 9, 89, 32, 123, 39, 34, 211, 222, 244, 100, 129, 23, 1, 4, 3, 29,
  30, 1, 4, 5, 7, 8, 233, 89, 1, 98, 67,
]);

/** Convert an unsigned byte (0-255) to a signed byte (-128..127). */
function toSigned(b: number): number {
  return b > 127 ? b - 256 : b;
}

/** Normalize a parsed number to an unsigned byte. */
function toByte(n: number): number {
  const v = Math.trunc(n) % 256;
  return v < 0 ? v + 256 : v;
}

/** XOR transform used for both encryption and decryption. */
function transform(data: Uint8Array): Uint8Array {
  const srcSize = data.length;
  const result = new Uint8Array(srcSize);
  for (let i = 0; i < srcSize; i++) {
    let b = data[i];
    b ^= IOP_PASSWORD_KEY[i % MAX_KEY];
    b ^= IOP_PASSWORD_KEY[(srcSize - i) % MAX_KEY];
    result[i] = b;
  }
  return result;
}

/** Encrypt a plaintext password into a 20-byte signed decimal array. */
export function encryptIopPassword(plain: string): number[] {
  const src = new Uint8Array(MAX_PASSWORD);
  const encoded = new TextEncoder().encode(plain);
  src.set(encoded.slice(0, MAX_PASSWORD));
  return Array.from(transform(src), toSigned);
}

/** Decrypt a comma/space-separated signed/unsigned decimal or hex byte list. */
export function decryptIopPassword(input: string): string {
  const tokens = input
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const bytes = new Uint8Array(MAX_PASSWORD);
  for (let i = 0; i < MAX_PASSWORD; i++) {
    if (i < tokens.length) {
      const token = tokens[i];
      const base = /^0x/i.test(token) || /[a-fA-F]/.test(token) ? 16 : 10;
      bytes[i] = toByte(parseInt(token, base));
    } else {
      bytes[i] = 0;
    }
  }

  const decrypted = transform(bytes);

  // C++ stores these as char buffers; trim trailing nulls.
  let end = decrypted.length;
  while (end > 0 && decrypted[end - 1] === 0) {
    end--;
  }
  return String.fromCharCode(...decrypted.slice(0, end));
}

/** Known client password presets extracted from the source. */
export interface IopPasswordPreset {
  code: string;
  label: string;
  plaintext: string;
  encrypted: number[];
}

export const iopPasswordPresets: IopPasswordPreset[] = [
  {
    code: "kr-0",
    label: "Korea — Primary (iosuccess#@)",
    plaintext: "iosuccess#@",
    encrypted: [
      -105, 112, 108, 127, 62, 66, 9, -43, 53, 4, 64, 39, 70, -90, 108, 33,
      93, 10, 31, 31,
    ],
  },
  {
    code: "kr-1",
    label: "Korea — Secondary (XrFrI0%3BF%!0Dcx$30-)",
    plaintext: "XrFrI0%3BF%!0Dcx$30-",
    encrypted: [
      -90, 109, 89, 120, 20, 17, 73, -107, 4, 97, 37, 6, 118, -30, 15, 89,
      121, 57, 47, 50,
    ],
  },
  {
    code: "us-0",
    label: "US — Primary (eE39DkE!%E0)",
    plaintext: "eE39DkE!%E0",
    encrypted: [
      -101, 90, 44, 51, 25, 74, 41, -121, 99, 98, 48, 39, 70, -90, 108, 33,
      93, 10, 31, 31,
    ],
  },
  {
    code: "us-1",
    label: "US — Secondary (Eg%^io03UT$Cvf921-!$)",
    plaintext: "Eg%^io03UT$Cvf921-!$",
    encrypted: [
      -69, 120, 58, 84, 52, 78, 92, -107, 19, 115, 36, 100, 48, -64, 85, 19,
      108, 39, 62, 59,
    ],
  },
  {
    code: "tw-0",
    label: "Taiwan — Primary (iUT38#@49vnFdjf)(4sg)",
    plaintext: "iUT38#@49vnFdjf)(4sg",
    encrypted: [
      -105, 74, 75, 57, 101, 2, 44, -110, 127, 81, 110, 97, 34, -52, 10, 8,
      117, 62, 108, 120,
    ],
  },
  {
    code: "tw-1",
    label: "Taiwan — Secondary (Yi#weT%^903Unv0$2gfj)",
    plaintext: "Yi#weT%^903Unv0$2gfj",
    encrypted: [
      -89, 118, 60, 125, 56, 117, 73, -8, 127, 23, 51, 114, 40, -48, 92, 5,
      111, 109, 121, 117,
    ],
  },
  {
    code: "id-0",
    label: "Indonesia — Primary (T*$f40FRjfoe*(fl304d)",
    plaintext: "T*$f40FRjfoe*(fl304d",
    encrypted: [
      -86, 53, 59, 108, 105, 17, 42, -12, 44, 65, 111, 66, 108, -114, 10, 77,
      110, 58, 43, 123,
    ],
  },
  {
    code: "id-1",
    label: "Indonesia — Secondary (Mfe$%2049eFeodk*&31Z)",
    plaintext: "Mfe$%2049eFeodk*&31Z",
    encrypted: [
      -77, 121, 122, 46, 120, 19, 92, -110, 127, 66, 70, 66, 41, -62, 7, 11,
      123, 57, 46, 69,
    ],
  },
  {
    code: "th-0",
    label: "Thailand — Primary (K3$dls49YU#$#eoE3054)",
    plaintext: "K3$dls49YU#$#eoE3054",
    encrypted: [
      -75, 44, 59, 110, 49, 82, 88, -97, 31, 114, 35, 3, 101, -61, 3, 100,
      110, 58, 42, 43,
    ],
  },
  {
    code: "th-1",
    label: "Thailand — Secondary (-_495IUEVJdlsl++32ed)",
    plaintext: "-_495IUEVJdlsl++32ed",
    encrypted: [
      -45, 64, 43, 51, 104, 104, 57, -29, 16, 109, 100, 75, 53, -54, 71, 10,
      110, 56, 122, 123,
    ],
  },
  {
    code: "jp-0",
    label: "Japan — Primary (EDgei%^df930%#fj!_=])",
    plaintext: "EDgei%^df930%#fj!_=]",
    encrypted: [
      -69, 91, 120, 111, 52, 4, 50, -62, 32, 30, 51, 23, 99, -123, 10, 75,
      124, 85, 34, 66,
    ],
  },
  {
    code: "jp-1",
    label: "Japan — Secondary (@7$gjTRreie][!323O++)",
    plaintext: "@7$gjTRreie][!323O++",
    encrypted: [
      -66, 40, 59, 109, 55, 117, 62, -44, 35, 78, 101, 122, 29, -121, 95, 19,
      110, 69, 52, 52,
    ],
  },
  {
    code: "sg-0",
    label: "Singapore — Primary (EDgei%^df930%#fj!_=])",
    plaintext: "EDgei%^df930%#fj!_=]",
    encrypted: [
      -69, 91, 120, 111, 52, 4, 50, -62, 32, 30, 51, 23, 99, -123, 10, 75,
      124, 85, 34, 66,
    ],
  },
  {
    code: "sg-1",
    label: "Singapore — Secondary (@7$gjTRreie][!323O++)",
    plaintext: "@7$gjTRreie][!323O++",
    encrypted: [
      -66, 40, 59, 109, 55, 117, 62, -44, 35, 78, 101, 122, 29, -121, 95, 19,
      110, 69, 52, 52,
    ],
  },
  {
    code: "ph-0",
    label: "Philippine — Primary (-)4TRfkl-41$%dgkrm05)",
    plaintext: "-)4TRfkl-41$%dgkrm05",
    encrypted: [
      -45, 54, 43, 94, 15, 71, 7, -54, 107, 19, 49, 3, 99, -62, 11, 74, 47,
      103, 47, 42,
    ],
  },
  {
    code: "ph-1",
    label: "Philippine — Secondary (|059rtuGReowo@##tkg0)",
    plaintext: "|059rtuGReowo@##tkg0",
    encrypted: [
      -126, 47, 42, 51, 47, 85, 25, -31, 20, 66, 111, 80, 41, -26, 79, 2, 41,
      97, 120, 47,
    ],
  },
  {
    code: "cn-0",
    label: "China — Primary (-)4TRfkl-41$%dgkrm05)",
    plaintext: "-)4TRfkl-41$%dgkrm05",
    encrypted: [
      -45, 54, 43, 94, 15, 71, 7, -54, 107, 19, 49, 3, 99, -62, 11, 74, 47,
      103, 47, 42,
    ],
  },
  {
    code: "cn-1",
    label: "China — Secondary (|059rtuGReowo@##tkg0)",
    plaintext: "|059rtuGReowo@##tkg0",
    encrypted: [
      -126, 47, 42, 51, 47, 85, 25, -31, 20, 66, 111, 80, 41, -26, 79, 2, 41,
      97, 120, 47,
    ],
  },
  {
    code: "eu-0",
    label: "EU — Primary (Efedf12-Asv)",
    plaintext: "Efedf12-Asv",
    encrypted: [
      -69, 121, 122, 110, 59, 16, 94, -117, 7, 84, 118, 39, 70, -90, 108, 33,
      93, 10, 31, 31,
    ],
  },
  {
    code: "eu-1",
    label: "EU — Secondary (fegG-24qw##4dfe52%3*)",
    plaintext: "fegG-24qw##4dfe52%3*",
    encrypted: [
      -104, 122, 120, 77, 112, 19, 88, -41, 49, 4, 35, 19, 34, -64, 9, 20,
      111, 47, 44, 53,
    ],
  },
  {
    code: "latin-0",
    label: "Latin America — Primary (dus!qhdaksl)",
    plaintext: "dus!qhdaksl",
    encrypted: [
      -102, 106, 108, 43, 44, 73, 8, -57, 45, 84, 108, 39, 70, -90, 108, 33,
      93, 10, 31, 31,
    ],
  },
  {
    code: "latin-1",
    label: "Latin America — Secondary (tkdjqqn!dlfEhrqkfhgo)",
    plaintext: "tkdjqqn!dlfEhrqkfhgo",
    encrypted: [
      -118, 116, 123, 96, 44, 80, 2, -121, 34, 75, 102, 98, 46, -44, 29, 74,
      59, 98, 120, 112,
    ],
  },
  {
    code: "br-0",
    label: "Brazil — Primary (dus!qhdaksl)",
    plaintext: "dus!qhdaksl",
    encrypted: [
      -102, 106, 108, 43, 44, 73, 8, -57, 45, 84, 108, 39, 70, -90, 108, 33,
      93, 10, 31, 31,
    ],
  },
  {
    code: "br-1",
    label: "Brazil — Secondary (tkdjqqn!dlfEhrqkfhgo)",
    plaintext: "tkdjqqn!dlfEhrqkfhgo",
    encrypted: [
      -118, 116, 123, 96, 44, 80, 2, -121, 34, 75, 102, 98, 46, -44, 29, 74,
      59, 98, 120, 112,
    ],
  },
];
