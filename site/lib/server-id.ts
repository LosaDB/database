/**
 * Converts an IP address and port number to a 64-bit game server ID.
 *
 * The IP address is stored in the first 32 bits (little-endian) and the port
 * number is stored in the last 32 bits (little-endian), matching the game's
 * server list format.
 */
export function convertToGameServerID(ip: string, port: number): bigint {
  const int64Size = 8;
  const intSize = 4;

  const szByteArray = new Uint8Array(8);
  const ipSegments = ip.split(".");

  for (let i = 0; i < ipSegments.length && i < int64Size; i++) {
    szByteArray[i] = parseInt(ipSegments[i], 10);
  }

  const portBuffer = new ArrayBuffer(intSize);
  const portView = new DataView(portBuffer);
  portView.setInt32(0, port, true);

  const combinedBuffer = new ArrayBuffer(int64Size);
  const combinedView = new DataView(combinedBuffer);

  for (let i = 0; i < intSize; i++) {
    combinedView.setUint8(i, szByteArray[i]);
  }
  for (let i = 0; i < intSize; i++) {
    combinedView.setUint8(intSize + i, portView.getUint8(i));
  }

  return combinedView.getBigInt64(0, true);
}

/**
 * Converts a 64-bit game server ID back into an IP address and port number.
 */
export function convertServerIDToAddress(gameServerID: bigint): {
  ip: string;
  port: number;
} {
  const int64Size = 8;
  const intSize = 4;

  const gameServerBuffer = new ArrayBuffer(int64Size);
  const gameServerView = new DataView(gameServerBuffer);
  gameServerView.setBigInt64(0, gameServerID, true);

  const ipSegments: string[] = [];
  for (let i = 0; i < intSize; i++) {
    ipSegments.push(gameServerView.getUint8(i).toString());
  }

  const ipAddress = ipSegments.join(".");

  const portBuffer = new ArrayBuffer(intSize);
  const portView = new DataView(portBuffer);
  for (let i = 0; i < intSize; i++) {
    portView.setUint8(i, gameServerView.getUint8(intSize + i));
  }

  const port = portView.getInt32(0, true);

  return { ip: ipAddress, port };
}

const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

export function isValidIP(ip: string): boolean {
  if (!IP_REGEX.test(ip)) return false;
  return ip.split(".").every((segment) => {
    const num = parseInt(segment, 10);
    return !Number.isNaN(num) && num >= 0 && num <= 255;
  });
}

export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 0 && port <= 65535;
}
