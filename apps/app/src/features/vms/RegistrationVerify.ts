import { t } from '@stores/i18n.js';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@lib/fields/TextField.js';
import '@lib/fields/TextareaField.js';
import { CrudForm } from './CrudForm.js';
import { auth } from '@stores/auth.js';

@customElement('a-registration-verify')
export class RegistrationVerify extends CrudForm {
  protected collection = 'registration';
  protected pageTitle = t('Verify Registration');
  protected submitLabel = t('Verify');

  protected renderLayout(): unknown {
    return html`
      <div class="mb-3 row">
        <div class="col">
          <f-text-field
            name="name"
            label=${t('Name')}
            required
            disabled
          ></f-text-field>
        </div>
      </div>

      <div class="mb-3 row">
        <div class="col">
          <f-text-field
            name="email"
            label=${t('Email')}
            required
            disabled
          ></f-text-field>
        </div>
      </div>

      <div class="mb-3 row">
        <div class="col">
          <f-text-field
            name="division"
            label=${t('Division')}
            disabled
          ></f-text-field>
        </div>
      </div>

      <div class="mb-3 row">
        <div class="col">
          <f-text-field type="date"
            name="start_date"
            label=${t('Start Date')}
            required
            disabled
          ></f-text-field>
        </div>

        <div class="col">
          <f-text-field type="date"
            name="end_date"
            label=${t('End Date')}
            required
            disabled
          ></f-text-field>
        </div>
      </div>

      <div class="mb-3 row">
        <div class="col">
          <f-text-field
            name="room"
            label=${t('Room')}
            required
          ></f-text-field>
        </div>
      </div>
    `;
  }

  protected submit(value: Record<string, unknown>): Promise<Record<string, string>> {
    return super.submit({
      room: value.room,
      status: 'verified',
    });
  }
}
