export function isServer() {
  const isServer = process.argv.some((arg) => arg.includes('start'));
  return isServer;
}
