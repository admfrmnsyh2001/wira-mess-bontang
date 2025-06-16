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

  protected async createOptions(): Promise<Record<string, string>> {
    const options: Record<string, string> = {
      '': '---',
    };

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

      const rooms = await directusClient.request(readItems('room', { filter }));

      for (const room of rooms) {
        options[room.id] = room.name;
      }
    } catch (err) {
      console.error('Error fetching room options:', err);

      const rooms = await directusClient.request(readItems('room'));
      for (const room of rooms) {
        options[room.id] = room.name;
      }
    }
    return options;
  }
}
