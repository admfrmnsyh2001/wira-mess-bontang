import type { Service } from '../../lib/directus/Service.js';
import type { PinGenerator } from '../domain/PinGenerator.js';
import type { RegistrationVerified } from '../domain/RegistrationVerified.js';

export class OnRegistrationVerifiedCreateBooking {
  constructor(
    readonly registrationService: Service,
    readonly bookingService: Service,
    readonly pinGenerator: PinGenerator,
  ) {}

  async listen(evt: RegistrationVerified) {
    const registration = await this.registrationService.readOne(evt.key);

    const pin = await this.pinGenerator.generate();

    this.bookingService.createOne({
      name: registration.name,
      division: registration.division,
      email: registration.email,
      start_date: registration.start_date,
      end_date: registration.end_date,
      room: registration.room,
      status: 'registered',
      registered_at: new Date().toJSON(),
      pin,
    });
  }
}
