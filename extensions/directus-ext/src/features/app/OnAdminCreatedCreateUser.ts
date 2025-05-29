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

    this.userService.createOne({
      first_name: evt.first_name,
      last_name: evt.last_name,
      email: evt.email,
      password: evt.password,
      role: role.id,
    });
  }
}
