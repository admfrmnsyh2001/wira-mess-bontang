import type { Mailer } from '../../lib/directus/Mailer.js';
import type { BookingCreated } from '../domain/BookingCreated.js';

export class OnBookingCreatedSendEmail {
  constructor(private mailer: Mailer) {}

  async listen(evt: BookingCreated) {
    await this.mailer.send({
      to: `${evt.name} <${evt.email}>`,
      subject: 'Booking Confirmed',
      html: `
        <p>Your booking has been confirmed. Please use the PIN below at check-in time.</p>
        <p>
          <b>Name:</b> ${evt.name}<br>
          <b>Room:</b> ${evt.room}<br>
          <b>Date:</b> ${evt.startDate} - ${evt.endDate}<br>
          <b>PIN:</b> ${evt.pin}<br>
        </p>
      `.trim(),
    });
  }
}
