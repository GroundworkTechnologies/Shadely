/** Minimal ZIP writer (store method, no compression). Pure, no dependencies. */

export interface ZipFile {
  path: string;
  content: string | Uint8Array;
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]!) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** DOS date/time for 2026-01-01 00:00; fixed so output is deterministic. */
const DOS_TIME = 0;
const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;

export function createZip(files: readonly ZipFile[]): Uint8Array {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  const u16 = (n: number) => new Uint8Array([n & 0xff, (n >>> 8) & 0xff]);
  const u32 = (n: number) => new Uint8Array([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
  const cat = (...parts: Uint8Array[]) => {
    const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0));
    let o = 0;
    for (const p of parts) {
      out.set(p, o);
      o += p.length;
    }
    return out;
  };

  for (const f of files) {
    const name = enc.encode(f.path.replace(/^\/+/, ""));
    const data = typeof f.content === "string" ? enc.encode(f.content) : f.content;
    const crc = crc32(data);
    const flags = 0x0800; // UTF-8 names
    const local = cat(u32(0x04034b50), u16(20), u16(flags), u16(0), u16(DOS_TIME), u16(DOS_DATE), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name);
    chunks.push(local, data);
    central.push(cat(u32(0x02014b50), u16(20), u16(20), u16(flags), u16(0), u16(DOS_TIME), u16(DOS_DATE), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name));
    offset += local.length + data.length;
  }

  const centralBytes = cat(...central);
  const end = cat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(centralBytes.length), u32(offset), u16(0));
  return cat(...chunks, centralBytes, end);
}
