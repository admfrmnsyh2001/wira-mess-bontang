import type { Mailer } from '../../lib/directus/Mailer.js';
import type { BookingCreated } from '../domain/BookingCreated.js';

export class OnBookingCreatedSendEmail {
  constructor(private mailer: Mailer) {}

  async listen(evt: BookingCreated) {
    await this.mailer.send({
      to: `${evt.name} <${evt.email}>`,
      subject: 'Your booking has been created',
      html: `
        <p>
          Your booking has been successfully created. You may proceed directly
          to your room and use the provided PIN at the scheduled time.
        </p>

        <p>
          Scheduled Time: ${evt.startDate} to ${evt.endDate}
          <br>
          Name: ${evt.name}
          <br>
          Room: ${evt.room}
          <br>
          PIN: ${evt.pin}
          <br>
        </p>
      `.trim(),
    });
  }
}
