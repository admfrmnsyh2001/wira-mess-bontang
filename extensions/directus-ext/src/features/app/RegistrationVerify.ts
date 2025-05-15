import { ValidationError } from '../../lib/fw/errors/ValidationError.js';

export class RegistrationVerify {
  execute(command: Record<string, unknown>) {
    if (!command.room) {
      throw new ValidationError('invalid room');
    }

    return {
      ...command,
      verified_at: new Date().toJSON(),
    };
  }
}
