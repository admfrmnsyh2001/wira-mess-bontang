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
import { OnAdminCreatedCreateUser } from './features/app/OnAdminCreatedCreateUser.js';
import { AdminCreated } from './features/domain/AdminCreated.js';
import { lookupUserService } from './lib/directus/lookupUserService.js';
import { lookupRoleService } from './lib/directus/lookupRoleService.js';

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

  hooks.action('booking.items.create', async (meta) => {
    const mailer = await lookupMailer(ctx);
    await new OnBookingCreatedSendEmail(mailer).listen(
      new BookingCreated({
        id: meta.payload.id,
        name: meta.payload.name,
        division: meta.payload.division,
        email: meta.payload.email,
        startDate: meta.payload.start_date,
        endDate: meta.payload.end_date,
        room: meta.payload.room,
        pin: meta.payload.pin,
      }),
    );
  });

  hooks.action('admin.items.create', async (meta) => {
    const userService = await lookupUserService(ctx);
    const roleService = await lookupRoleService(ctx);
    await new OnAdminCreatedCreateUser(userService, roleService).listen(
      new AdminCreated({
        email: meta.payload.email,
        first_name: meta.payload.first_name,
        last_name: meta.payload.last_name,
        password: meta.payload.password,
      }),
    );
  });
});
