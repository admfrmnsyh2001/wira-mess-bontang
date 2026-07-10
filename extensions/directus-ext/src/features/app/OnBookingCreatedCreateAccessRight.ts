import type { BiostarClient } from '../../lib/biostar2/BiostarClient.js';
import { cardRegistered } from '../../lib/biostar2/card/cardRegistered.js';
import { createCard } from '../../lib/biostar2/card/createCard.js';
import { createUser } from '../../lib/biostar2/user/createUser.js';
import { registerCard } from '../../lib/biostar2/user/registerCard.js';
import type { Service } from '../../lib/directus/Service.js';
import { config } from '../../runtime/config.js';
import type { BookingCreated } from '../domain/BookingCreated.js';

export class OnBookingCreatedCreateAccessRight {
  constructor(
    private client: BiostarClient,
    private roomService: Service,
  ) {}

  async listen(evt: BookingCreated) {
    if (!config.accessRightEnabled) {
      console.warn('disabled access right');
      return;
    }

    const room = await this.roomService.readOne(evt.roomId);
    const id = generateId(evt.id);
    const groupId = config.biostarUserGroup;
    const checkinTime = config.checkinTime;
    const checkoutTime = config.checkoutTime;
    const startTime = new Date(`${evt.startDate} ${checkinTime}`);
    const expiryTime = new Date(`${evt.endDate} ${checkoutTime}`);
    const accessGroupId = room.access_group;

    const params = {
      id,
      groupId,
      name: evt.name,
      startTime,
      expiryTime,
      accessGroupId,
    };

    await this.client.request(createUser(params));
    const card = await this.client.request(createCard(evt.pin, 'csn'));
    await this.client.request(registerCard(id, card.id));
  }
}

function generateId(id: number): string {
  return `${Number(id) + 1_000_000}`;
}
