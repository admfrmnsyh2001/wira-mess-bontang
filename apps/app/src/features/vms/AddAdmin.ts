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
              </div>

              <div class="mb-3 row">
                <div class="col">
                  <f-text-field
                    name="email"
                    label=${t('Email')}
                    required
                  ></f-text-field>
                </div>
              </div>
      </div>
    `;
  }
}
