import { customElement } from 'lit/decorators.js';
import { CrudForm } from './CrudForm.js';
import { html } from 'lit';
import { t } from '../../runtime/i18n.js';

@customElement('a-admin-add')
export class AddAdmin extends CrudForm {
  protected collection = 'admin';
  protected pageTitle = t('Add Admin');
  protected renderLayout(): unknown {
    return html`
      <div class="mb-3">
        <div class="mb-3 row">
                <div class="col-md-6">
                  <f-text-field
                    name="first_name"
                    label=${t('First Name')}
                    required
                  ></f-text-field>
                </div>

                <div class="col-md-6">
                  <f-text-field
                    name="last_name"
                    label=${t('Last Name')}
                  ></f-text-field>
                </div>

                <div class="col-md-6">
                  <f-text-field
                    name="username"
                    label=${t('Username')}
                    required
                  ></f-text-field>
              </div>

                <div class="col-md-6">
                  <f-text-field
                    name="password"
                    label=${t('Pasword')}
                    required
                  ></f-text-field>
              </div>

            </div>
      </div>
    `;
  }

  protected submit(value: Record<string, unknown>): Promise<Record<string, string>> {
    const newValue = {
      first_name: value.first_name,
      last_name: value.last_name,
      email: `${value.username}@simplo.id`,
      password: value.password,
    };
    return super.submit(newValue);
  }
}
