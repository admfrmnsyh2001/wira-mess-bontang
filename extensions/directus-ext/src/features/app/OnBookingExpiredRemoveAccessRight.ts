import type { BiostarClient } from '../../lib/biostar2/BiostarClient.js';
import { deleteUser } from '../../lib/biostar2/user/deleteUser.js';
import { config } from '../../runtime/config.js';
import type { BookingExpired } from '../domain/BookingExpired.js';

export class OnBookingExpiredRemoveAccessRight {
  constructor(private client: BiostarClient) {}

  async listen(evt: BookingExpired) {
    if (!config.accessRightEnabled) {
      console.warn('disabled access right');
      return;
    }

    const id = generateId(evt.id);

    try {
      await this.client.request(deleteUser(id));
    } catch (err) {
      console.error(`cannot remove biostar user with id: ${id}, because: ${err}`);
    }
  }
}

function generateId(id: number): string {
  return `${Number(id) + 1_000_000}`;
}
