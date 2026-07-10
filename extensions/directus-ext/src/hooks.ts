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
import { isServer } from './lib/directus/isServer.js';
import { lookupEventBus } from './runtime/eventBus.js';
import { BiostarListener } from './features/app/BiostarListener.js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default defineHook(async (hooks, ctx) => {
  if (!isServer()) {
    return;
  }

  hooks.action('server.start', async () => {
    const seeder = new Seeder(ctx);
    await seeder.execute();
  });

  const registrationService = await lookupService(ctx, 'registration');
  const bookingService = await lookupService(ctx, 'booking');
  const pinGenerator = new PinGenerator();
  const mailer = await lookupMailer(ctx);
  const roomService = await lookupService(ctx, 'room');
  const biostarClient = await lookupBiostarClient(ctx);
  const userService = await lookupUserService(ctx);
  const roleService = await lookupRoleService(ctx);
  const biostarEventService = await lookupService(ctx, 'biostar_event');
  const eventBus = await lookupEventBus(ctx);

  eventBus.listen(
    RegistrationVerified.name,
    new OnRegistrationVerifiedCreateBooking(registrationService, bookingService, pinGenerator),
  );
  eventBus.listen(BookingCreated.name, new OnBookingCreatedCreateAccessRight(biostarClient, roomService));
  eventBus.listen(BookingCreated.name, new OnBookingCreatedSendEmail(mailer));
  eventBus.listen(BookingExpired.name, new OnBookingExpiredRemoveAccessRight(biostarClient, ctx.logger));
  eventBus.listen(AdminCreated.name, new OnAdminCreatedCreateUser(userService, roleService));
  eventBus.listen(AdminRemoved.name, new OnAdminRemovedRemoveUser(userService));

  new BiostarListener(biostarClient, biostarEventService).listen();

  hooks.filter<Record<string, unknown>>('registration.items.create', (payload) => {
    return new RegistrationCreate().execute(payload);
  });

  hooks.filter<Record<string, unknown>>('registration.items.update', (payload) => {
    if (payload.status === 'verified') {
      return new RegistrationVerify().execute(payload);
    }

    return payload;
  });

  hooks.action('registration.items.create', async (meta) => {
    console.log('>>>', meta)
    await mailer.send({
      to: `it@kpi.co.id`,
      subject: 'Booking Request',
      html:`
	<p>
	   Booking Request 
	</p>

	<p>
	Informasi sistem mendeteksi adanya pembuatan jadwal booking baru atas nama berikut:
	<br>
	Name: ${meta.payload.name}
	</br>
	<br>
	Tanggal: ${meta.payload.start_date} s/d ${meta.payload.end_date}
	</br>
	<br>
	<a href="https://192.168.5.102:9443/admin" style="color: #1a73e8; font-weight: bold; text-decoration: underline;">https://192.168.5.102:9443/admin</a>
	</br>
        </p>
       `.trim(),
     });
   });

  hooks.action('registration.items.update', async (meta) => {
    if (meta.payload.status === 'verified') {
      for (const key of meta.keys) {
        await eventBus.dispatch(new RegistrationVerified(key));
      }
      return;
    }
  });

  hooks.action('booking.items.create', async (meta) => {
    const roomData = await roomService.readOne(meta.payload.room);
    const evt = new BookingCreated({
      id: meta.key,
      name: meta.payload.name,
      division: meta.payload.division,
      email: meta.payload.email,
      startDate: meta.payload.start_date,
      endDate: meta.payload.end_date,
      room: roomData?.name ?? meta.payload.room,
      pin: meta.payload.pin,
    });
    await eventBus.dispatch(evt);
  });

  hooks.action('booking.items.update', async (meta) => {
    for (const key of meta.keys) {
      const booking = await bookingService.readOne(key);

      if (meta.payload.status === 'expired') {
        const evt = new BookingExpired({
          id: booking.id,
          name: booking.name,
          division: booking.division,
          email: booking.email,
          startDate: booking.start_date,
          endDate: booking.end_date,
          room: booking.room,
          pin: booking.pin,
        });
        await eventBus.dispatch(evt);
      } else if (meta.payload.status === 'registered') {
        const roomData = await roomService.readOne(booking.room);
        const evt = new BookingCreated({
          id: booking.id,
          name: booking.name,
          division: booking.division,
          email: booking.email,
          startDate: booking.start_date,
          endDate: booking.end_date,
          room: roomData?.name ?? booking.room,
          pin: booking.pin,
        });
        await eventBus.dispatch(evt);
      }
    }
  });

  hooks.action('admin.items.create', async (meta) => {
    const evt = new AdminCreated({
      email: meta.payload.email,
      firstName: meta.payload.first_name,
      lastName: meta.payload.last_name,
      password: meta.payload.password,
    });
    await eventBus.dispatch(evt);
  });

  hooks.filter('admin.items.delete', async (payload) => {
    const adminService = await lookupService(ctx, 'admin');

    for (const key of payload as string[]) {
      const admin = await adminService.readOne(key);
      await eventBus.dispatch(new AdminRemoved(admin.email));
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
