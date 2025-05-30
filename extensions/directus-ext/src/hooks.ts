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
import { OnAdminRemovedRemoveUser } from './features/app/OnAdminRemovedRemoveUser.js';
import { AdminRemoved } from './features/domain/AdminRemoved.js';
import { OnBookingCreatedCreateAccessRight } from './features/app/OnBookingCreatedCreateAccessRight.js';
import { lookupBiostarClient } from './runtime/biostarClient.js';
import { OnBookingExpiredRemoveAccessRight } from './features/app/OnBookingExpiredRemoveAccessRight.js';
import { BookingExpired } from './features/domain/BookingExpired.js';
import { config } from './runtime/config.js';
import { localDay } from './lib/helpers/localDay.js';

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
    const evt = new BookingCreated({
      id: meta.key,
      name: meta.payload.name,
      division: meta.payload.division,
      email: meta.payload.email,
      startDate: new Date(meta.payload.start_date),
      endDate: new Date(meta.payload.end_date),
      room: meta.payload.room,
      pin: meta.payload.pin,
    });

    const roomService = await lookupService(ctx, 'room');
    const biostarClient = await lookupBiostarClient(ctx);
    await new OnBookingCreatedCreateAccessRight(biostarClient, roomService).listen(evt);

    const mailer = await lookupMailer(ctx);
    await new OnBookingCreatedSendEmail(mailer).listen(evt);
  });

  hooks.action('booking.items.update', async (meta) => {
    if (meta.payload.status !== 'expired') {
      return;
    }

    const bookingService = await lookupService(ctx, 'booking');
    const biostarClient = await lookupBiostarClient(ctx);

    const listener = new OnBookingExpiredRemoveAccessRight(biostarClient);

    for (const key of meta.keys) {
      const booking = await bookingService.readOne(key);
      const evt = new BookingExpired({
        id: booking.id,
        name: booking.name,
        division: booking.division,
        email: booking.email,
        startDate: new Date(booking.start_date),
        endDate: new Date(booking.end_date),
        room: booking.room,
        pin: booking.pin,
      });
      await listener.listen(evt);
    }
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

  hooks.filter('admin.items.delete', async (payload) => {
    const adminService = await lookupService(ctx, 'admin');
    const userService = await lookupUserService(ctx);

    for (const key of payload as string[]) {
      const admin = await adminService.readOne(key);
      await new OnAdminRemovedRemoveUser(userService).listen(new AdminRemoved(admin.email));
    }
  });

  const onSchedule = async () => {
    if (!config.accessRightEnabled) {
      return;
    }

    const bookingService = await lookupService(ctx, 'booking');

    const today = localDay();
    const ids = await bookingService.updateByQuery(
      {
        filter: {
          status: { _eq: 'registered' },
          end_date: { _lt: today },
        },
      },
      { status: 'expired' },
    );
    ctx.logger.info('expired found: %d', ids.length);
  };
  hooks.schedule('0 * * * *', onSchedule);
  onSchedule();
});
