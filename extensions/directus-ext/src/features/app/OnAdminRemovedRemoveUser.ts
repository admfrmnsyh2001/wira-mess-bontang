import type { Service } from '../../lib/directus/Service.js';
import { ValidationError } from '../../lib/fw/errors/ValidationError.js';
import type { AdminRemoved } from '../domain/AdminRemoved.js';

export class OnAdminRemovedRemoveUser {
  constructor(private userService: Service) {}

  async listen(evt: AdminRemoved) {
    const [user] = await this.userService.readByQuery({
      filter: {
        email: { _eq: evt.email },
      },
    });

    if (!user) {
      throw new ValidationError('unknown user to delete');
    }

    await this.userService.deleteOne(user.id);
  }
}
