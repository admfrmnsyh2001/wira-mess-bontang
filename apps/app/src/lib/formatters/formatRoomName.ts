export function formatRoomName(name: string): string {
  return name.replace(/^\s*(kamar|room)\s+/i, '');
}
