import type { BiostarClient } from '../../lib/biostar2/BiostarClient.js';
import { createUser } from '../../lib/biostar2/user/createUser.js';
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

    const room = await this.roomService.readOne(evt.room);
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
      pin: evt.pin,
      accessGroupId,
    };

    await this.client.request(createUser(params));
  }
}

function generateId(id: number): string {
  return `${Number(id) + 1_000_000}`;
}
