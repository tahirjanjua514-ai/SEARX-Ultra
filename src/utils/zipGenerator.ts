/**
 * Pure TypeScript PKZIP generator without external dependencies.
 * Produces valid .zip files adhering strictly to the PKWARE specification.
 */

interface ZipEntry {
  filename: string;
  data: Uint8Array;
  date: Date;
}

export class SimpleZip {
  private entries: ZipEntry[] = [];

  public addFile(filename: string, content: string | Uint8Array, date = new Date()): void {
    const data = typeof content === 'string' ? new TextEncoder().encode(content) : content;
    this.entries.push({ filename, data, date });
  }

  public generateBlob(): Blob {
    const localHeaders: Uint8Array[] = [];
    const centralHeaders: Uint8Array[] = [];
    let offset = 0;

    for (const entry of this.entries) {
      const filenameBytes = new TextEncoder().encode(entry.filename);
      const crc = this.calculateCrc32(entry.data);
      const size = entry.data.length;

      const dosTime = this.toDosDateTime(entry.date);

      // Local File Header (30 bytes + filename length)
      const localHeader = new Uint8Array(30 + filenameBytes.length);
      const lView = new DataView(localHeader.buffer);
      lView.setUint32(0, 0x04034b50, true); // Local file header signature
      lView.setUint16(4, 20, true); // Version needed to extract (2.0)
      lView.setUint16(6, 0x0800, true); // General purpose bit flag (UTF-8)
      lView.setUint16(8, 0, true); // Compression method (0 = stored / uncompressed)
      lView.setUint16(10, dosTime.time, true);
      lView.setUint16(12, dosTime.date, true);
      lView.setUint32(14, crc, true); // CRC-32
      lView.setUint32(18, size, true); // Compressed size
      lView.setUint32(22, size, true); // Uncompressed size
      lView.setUint16(26, filenameBytes.length, true);
      lView.setUint16(28, 0, true); // Extra field length
      localHeader.set(filenameBytes, 30);

      // Central Directory Header (46 bytes + filename length)
      const centralHeader = new Uint8Array(46 + filenameBytes.length);
      const cView = new DataView(centralHeader.buffer);
      cView.setUint32(0, 0x02014b50, true); // Central directory signature
      cView.setUint16(4, 20, true); // Version made by
      cView.setUint16(6, 20, true); // Version needed
      cView.setUint16(8, 0x0800, true); // UTF-8
      cView.setUint16(10, 0, true); // Stored
      cView.setUint16(12, dosTime.time, true);
      cView.setUint16(14, dosTime.date, true);
      cView.setUint32(16, crc, true);
      cView.setUint32(20, size, true);
      cView.setUint32(24, size, true);
      cView.setUint16(28, filenameBytes.length, true);
      cView.setUint16(30, 0, true); // Extra field length
      cView.setUint16(32, 0, true); // File comment length
      cView.setUint16(34, 0, true); // Disk number start
      cView.setUint16(36, 0, true); // Internal attributes
      cView.setUint32(38, 0, true); // External attributes
      cView.setUint32(42, offset, true); // Relative offset of local header
      centralHeader.set(filenameBytes, 46);

      localHeaders.push(localHeader);
      localHeaders.push(entry.data);
      centralHeaders.push(centralHeader);

      offset += localHeader.length + entry.data.length;
    }

    const centralDirOffset = offset;
    let centralDirSize = 0;
    for (const ch of centralHeaders) {
      centralDirSize += ch.length;
    }

    // End of Central Directory Record (22 bytes)
    const eocd = new Uint8Array(22);
    const eView = new DataView(eocd.buffer);
    eView.setUint32(0, 0x06054b50, true); // EOCD signature
    eView.setUint16(4, 0, true); // Number of this disk
    eView.setUint16(6, 0, true); // Disk where central directory starts
    eView.setUint16(8, this.entries.length, true); // Total entries on this disk
    eView.setUint16(10, this.entries.length, true); // Total entries
    eView.setUint32(12, centralDirSize, true); // Size of central directory
    eView.setUint32(16, centralDirOffset, true); // Offset of start of central directory
    eView.setUint16(20, 0, true); // Comment length

    const parts: any[] = [...localHeaders, ...centralHeaders, eocd];
    return new Blob(parts, { type: 'application/zip' });
  }

  private toDosDateTime(d: Date): { time: number; date: number } {
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    return { time, date };
  }

  private calculateCrc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
}

// Precomputed CRC32 table
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}
