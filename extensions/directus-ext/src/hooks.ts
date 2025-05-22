import { defineHook } from '@directus/extensions-sdk';
import { lookupService } from './lib/directus/lookupService.js';
import { PinGenerator } from './features/domain/PinGenerator.js';
import { RegistrationCreate } from './features/app/RegistrationCreate.js';
import { RegistrationVerify } from './features/app/RegistrationVerify.js';
import { OnRegistrationVerifiedCreateBooking } from './features/app/OnRegistrationVerifiedCreateBooking.js';
import { RegistrationVerified } from './features/domain/RegistrationVerified.js';
import { OnBookingCreatedSendEmail } from './features/app/OnBookingCreatedSendEmail.js';
import { BookingCreated } from './features/domain/BookingCreated.js';
import { lookupMailer } from './lib/directus/lookupMailer.js';
import { Seeder } from './features/app/Seeder.js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default defineHook(async (hooks, ctx) => {
  hooks.action('server.start', async () => {
    const seeder = new Seeder(ctx);
    await seeder.execute();
  });

  const pinGenerator = new PinGenerator();

  hooks.filter<Record<string, unknown>>('registration.items.create', (payload) => {
    return new RegistrationCreate().execute(payload);
  });

  hooks.filter<Record<string, unknown>>('registration.items.update', (payload) => {
    if (payload.status === 'verified') {
      return new RegistrationVerify().execute(payload);
    }

    return payload;
  });

  hooks.action('registration.items.update', async (meta) => {
    if (meta.payload.status !== 'verified') {
      return;
    }

    const registrationService = await lookupService(ctx, 'registration');
    const bookingService = await lookupService(ctx, 'booking');

    const listener = new OnRegistrationVerifiedCreateBooking(registrationService, bookingService, pinGenerator);

    for (const key of meta.keys) {
      await listener.listen(new RegistrationVerified(key));
    }
  });

  hooks.action('booking.items.create', async (payload) => {
    const mailer = await lookupMailer(ctx);
    const listener = new OnBookingCreatedSendEmail(mailer);
    await listener.listen(
      new BookingCreated({
        id: payload.id,
        name: payload.name,
        division: payload.division,
        email: payload.email,
        startDate: payload.start_date,
        endDate: payload.end_date,
        room: payload.room,
        pin: payload.pin,
      }),
    );
  });
});
