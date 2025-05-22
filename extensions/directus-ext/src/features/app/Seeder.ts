import type { HookExtensionContext } from '@directus/extensions';
import { lookupService } from '../../lib/directus/lookupService.js';

export class Seeder {
  constructor(private ctx: HookExtensionContext) {}

  async execute() {
    await this.seedPermissions();
    await this.seedRooms();
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
      { id: '01', name: '01' },
      { id: '02', name: '02' },
      { id: '03', name: '03' },
      { id: '04', name: '04' },
      { id: '05', name: '05' },
      { id: '06', name: '06' },
      { id: '07', name: '07' },
      { id: '08', name: '08' },
      { id: '09', name: '09' },
    ]);
  }
}
