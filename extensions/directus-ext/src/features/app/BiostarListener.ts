import type { BiostarClient } from '../../lib/biostar2/BiostarClient.js';
import { BEV_VERIFY_SUCCESS_CARD } from '../../lib/biostar2/eventTypes.js';
import type { Service } from '../../lib/directus/Service.js';

export class BiostarListener {
  constructor(
    private biostarClient: BiostarClient,
    private biostarEventService: Service,
  ) {}

  listen() {
    this.biostarClient.subscribe(async (data) => {
      if (!data.Event) {
        return;
      }

      const eventType = data.Event.event_type_id.code;

      if (eventType !== BEV_VERIFY_SUCCESS_CARD) {
        return;
      }

      const userId = data.Event.user_id.user_id;

      if (Number(userId) < 1_000_000) {
        return;
      }

      const booking = Number(userId) - 1_000_000;
      const deviceId = data.Event.device_id.id;
      const at = data.Event.datetime;
      const id = `${booking}-${deviceId}-${new Date(at).getTime() / 1000}`;

      const row = {
        booking,
        id,
        device_id: deviceId,
        user_id: userId,
        at,
      };
      try {
        await this.biostarEventService.createOne(row);
      } catch {
        console.error('duplicate row:', row);
      }
    });
  }
}
