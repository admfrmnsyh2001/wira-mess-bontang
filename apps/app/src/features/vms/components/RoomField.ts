import { readItems } from '@directus/sdk';
import { SelectField } from '@lib/fields/SelectField.js';
import { directusClient } from '@runtime/directusClient.js';
import { customElement, property } from 'lit/decorators.js';

@customElement('a-room-field')
export class RoomField extends SelectField {
  private lastValue?: string;

  @property()
  private start?: string;

  @property()
  private end?: string;

  protected async createOptions(): Promise<Array<{ value: string; label: string }>> {
    const options: Array<{ value: string; label: string }> = [
      { value: '', label: '---' }
    ];

    try {
      const conflictedRooms = (
        await directusClient.request(
          readItems('booking', {
            filter: {
              start_date: { _lt: this.end },
              end_date: { _gt: this.start },
            },
          }),
        )
      ).map((booking) => booking.room);

      let filter = {};
      if (conflictedRooms.length > 0) {
        filter = {
          id: { _nin: conflictedRooms },
        };
      }

      const rooms = await directusClient.request(readItems('room', { filter, sort: ['name'] }));

      for (const room of rooms) {
        options.push({ value: room.id, label: room.name });
      }
    } catch (err) {
      console.error('Error fetching room options:', err);

      const rooms = await directusClient.request(readItems('room', { sort: ['name'] }));
      for (const room of rooms) {
        options.push({ value: room.id, label: room.name });
      }
    }
    return options;
  }
}
