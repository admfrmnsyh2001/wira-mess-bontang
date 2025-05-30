import type { BiostarClient } from '../../lib/biostar2/BiostarClient.js';
import { deleteUser } from '../../lib/biostar2/user/deleteUser.js';
import { config } from '../../runtime/config.js';
import type { BookingExpired } from '../domain/BookingExpired.js';
import type { Logger } from 'pino';

export class OnBookingExpiredRemoveAccessRight {
  constructor(
    private client: BiostarClient,
    private logger: Logger,
  ) {}

  async listen(evt: BookingExpired) {
    if (!config.accessRightEnabled) {
      this.logger.warn('disabled access right');
      return;
    }

    this.logger.info('remove access right');

    const id = generateId(evt.id);

    try {
      await this.client.request(deleteUser(id));
    } catch (err) {
      this.logger.error(`cannot remove biostar user with id: ${id}, because: ${err}`);
    }
  }
}

function generateId(id: number): string {
  return `${Number(id) + 1_000_000}`;
}
