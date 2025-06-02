import { readItems } from '@directus/sdk';
import { SelectField } from '@lib/fields/SelectField.js';
import { directusClient } from '@runtime/directusClient.js';
import { customElement } from 'lit/decorators.js';

@customElement('a-room-field')
export class RoomField extends SelectField {
  protected async createOptions(): Promise<Record<string, string>> {
    const options = await getOptions();
    return options;
  }
}

let promisedOptions: Promise<Record<string, string>>;

function getOptions(): Promise<Record<string, string>> {
  if (promisedOptions) {
    return promisedOptions;
  }
  promisedOptions = (async () => {
    const options: Record<string, string> = {
      '': '---',
    };
    const rows = await directusClient.request(readItems('room'));

    for (const row of rows) {
      options[row.id] = row.name;
    }
    return options;
  })();
  return promisedOptions;
}
