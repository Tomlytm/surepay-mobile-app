export function formatPublicKey(json: { key: string }): string {
  const key = json.key.trim();

  const begin = "-----BEGIN PUBLIC KEY-----";
  const end = "-----END PUBLIC KEY-----";

  const keyBody = key
    .replace(begin, "")
    .replace(end, "")
    .replace(/\s+/g, "");

  const formattedBody = keyBody.match(/.{1,64}/g)?.join("\n") ?? "";

  return `${begin}\n${formattedBody}\n${end}`;
}
