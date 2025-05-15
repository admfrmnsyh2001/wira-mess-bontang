export class RegistrationCreate {
  execute(command: Record<string, unknown>) {
    return {
      ...command,
      status: 'created',
      created_at: new Date().toJSON(),
    };
  }
}
