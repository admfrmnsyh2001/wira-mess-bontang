import { readItems } from '@directus/sdk';
import { SelectField } from '@lib/fields/SelectField.js';
import { directusClient } from '@runtime/directusClient.js';
import { customElement } from 'lit/decorators.js';

@customElement('a-room-field')
export class RoomField extends SelectField {
  private lastValue: string | undefined;

  protected async createOptions(): Promise<Record<string, string>> {
    if (this.value !== this.lastValue) {
      promisedOptions = undefined;
    }
    const options = await getOptions();
    return options;
  }
}

let promisedOptions: Promise<Record<string, string>> | undefined;

function getOptions(currentValue?: string): Promise<Record<string, string>> {
  if (!promisedOptions) {
    promisedOptions = (async () => {
      const options: Record<string, string> = {
        '': '---',
      };

      try {
        const rooms = await directusClient.request(readItems('room'));
        const now = new Date().toISOString();
        const activeBookings = await directusClient.request(
          readItems('booking', {
            filter: {
              _and: [{ end_date: { _gte: now } }, { status: { _neq: 'cancelled' } }],
            },
            fields: ['room', 'start_date', 'end_date', 'status'],
          }),
        );

        for (const room of rooms) {
          if (currentValue && room.id === currentValue) {
            options[room.id] = room.name;
            continue;
          }

          const hasActiveBooking = activeBookings.some((booking) => booking.room === room.id);
          if (!hasActiveBooking) {
            options[room.id] = room.name;
          }
        }
      } catch (error) {
        console.error('Error fetching room options:', error);

        const rooms = await directusClient.request(readItems('room'));
        for (const room of rooms) {
          options[room.id] = room.name;
        }
      }

      return options;
    })();
  }

  return promisedOptions;
}
