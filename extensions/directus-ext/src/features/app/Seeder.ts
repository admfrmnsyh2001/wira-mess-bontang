import type { HookExtensionContext } from '@directus/extensions';
import { lookupService } from '../../lib/directus/lookupService.js';

export class Seeder {
  constructor(private ctx: HookExtensionContext) {}

  async execute() {
    await this.seedPermissions();
    await this.seedAdmins();
    await this.seedRooms();
  }

  async seedAdmins() {
    const adminService = await lookupService(this.ctx, 'admin');

    const admins = await adminService.readByQuery({ limit: 1 });
    if (admins.length !== 0) {
      return;
    }

    this.ctx.logger.info('seeding admins...');

    const UserService = this.ctx.services.UsersService;

    const schema = await this.ctx.getSchema();

    const userService = new UserService({ schema });
    const [user] = await userService.readByQuery({
      query: {
        email: { contains: 'admin@' },
      },
      limit: 1,
    });

    await adminService.createOne({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: '',
      master: true,
    });
  }

  async seedPermissions() {
    const PolicyService = this.ctx.services.PoliciesService;
    const PermissionService = this.ctx.services.PermissionsService;

    const schema = await this.ctx.getSchema();

    const policyService = new PolicyService({ schema });
    const permissionService = new PermissionService({ schema });

    const permissions = await permissionService.readByQuery({ limit: 1 });
    if (permissions.length !== 0) {
      return;
    }

    this.ctx.logger.info('seeding permissions...');
    const [publicPolicy] = await policyService.readByQuery({
      filter: {
        name: { _contains: 'public' },
      },
    });

    await permissionService.createMany([
      {
        collection: 'registration',
        action: 'create',
        permissions: null,
        validation: null,
        presets: null,
        fields: ['*'],
        policy: publicPolicy.id,
      },
    ]);
  }

  async seedRooms() {
    const roomService = await lookupService(this.ctx, 'room');

    const rooms = await roomService.readByQuery({ limit: 1 });
    if (rooms.length !== 0) {
      return;
    }

    this.ctx.logger.info('seeding rooms...');
    await roomService.createMany([
      { id: '01', name: 'Room 01', access_group: '8' },
      { id: '02', name: 'Room 02', access_group: '7' },
      { id: '03', name: 'Room 03', access_group: '5' },
      { id: '04', name: 'Room 04', access_group: '9' },
      { id: '05', name: 'Room 05' },
      { id: '06', name: 'Room 06' },
      { id: '07', name: 'Room 07' },
      { id: '08', name: 'Room 08' },
      { id: '09', name: 'Room 09' },
    ]);
  }
}
