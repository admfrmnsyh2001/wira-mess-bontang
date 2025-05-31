import type { Service } from '../../lib/directus/Service.js';
import type { AdminCreated } from '../domain/AdminCreated.js';

export class OnAdminCreatedCreateUser {
  constructor(
    private userService: Service,
    private roleService: Service,
  ) {}

  async listen(evt: AdminCreated) {
    const [role] = await this.roleService.readByQuery({
      filter: { name: { _eq: 'Administrator' } },
    });

    if (!role) {
      throw new Error('unknown administrator role');
    }

    await this.userService.createOne({
      first_name: evt.firstName,
      last_name: evt.lastName,
      email: evt.email,
      password: evt.password,
      role: role.id,
    });
  }
}
