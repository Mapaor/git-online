export function parse(line: string): { cmd: string; args: string[] } {
  const tokens = line.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];
  const clean = tokens.map(t => t.replace(/^"(.*)"$/, '$1'));
  return {
    cmd: clean[0] ?? '',
    args: clean.slice(1),
  };
}
