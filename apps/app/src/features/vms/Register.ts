import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@lib/fields/TextField.js';
import '@lib/components/Button.js';
import { RecordField } from '@lib/fields/RecordField.js';
import { Toast } from '@lib/components/Toast.js';
import { BasePage } from '@lib/fw/BasePage.js';
import { directusClient } from '../../runtime/directusClient.js';
import { createItem } from '@directus/sdk';
import logo from '@runtime/img/simplo.png';
import { t } from '../../runtime/i18n.js';
import { email } from '@lib/fields/rules.js';

@customElement('a-register')
export class Register extends BasePage {
  protected pageLayout = 'full';
  protected pageTitle = t('Register');

  @property()
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  protected value: any;

  @property()
  protected errors = {};

  @state()
  private submitting = false;

  @state()
  private submitted = false;

  protected render(): unknown {
    if (this.submitted) {
      return html`
        <div class="alert alert-success text-center" role="alert">
        ${t('The registration will be processed shortly. Please return to the')}
        <a href="/" rel="external">${t('Main Page')}</a>.
        </div>
      `;
    }
    return html`
      <div class="v-full d-flex align-items-center justify-content-center">
        <div class="p-3" style="width: 100%; max-width: 600px">
          <div class="mb-5 text-center">
            <img src=${logo} alt="App" width="230">
          </div>

          <form @submit=${this.onSubmit}>
            <f-record-field
              .value=${this.value}
              .errors=${this.errors}
              @mutate=${this.onMutate}
            >
              <div class="mb-3 row">
                <div class="col">
                  <f-text-field
                    name="name"
                    label=${t('Name')}
                    required
                  ></f-text-field>
                </div>
              </div>

              <div class="mb-3 row">
                <div class="col">
                  <f-text-field
                    name="email"
                    label=${t('Email')}
                    required
                    .rules=${[email()]}
                  ></f-text-field>
                </div>
              </div>

              <div class="mb-3 row">
                <div class="col">
                  <f-text-field
                    name="division"
                    label=${t('Division')}
                  ></f-text-field>
                </div>
              </div>

              <div class="mb-3 row">
                  <div class="col">
                    <f-text-field type="date"
                      name="start_date"
                      label=${t('Start Date')}
                      required
                    ></f-text-field>
                  </div>

                  <div class="col">
                    <f-text-field type="date"
                      name="end_date"
                      label=${t('End Date')}
                      required
                    ></f-text-field>
                  </div>
              </div>

            </f-record-field>

            <div class="mb-3">
              <c-button
                variant="primary"
                type="submit"
                ?processing=${this.submitting}
                label=${t('Register')}
              ></c-button>

              <button type="button" class="btn btn-secondary" @click=${() => history.back()}>${t('Back')}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  private onMutate(evt: Event) {
    const target = evt.target as RecordField;
    this.value = { ...target.value };
    this.errors = target.errors;
  }

  private async onSubmit(evt: Event) {
    evt.preventDefault();

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const record = RecordField.of<any>(evt.target);

    if (!record.validate()) {
      return;
    }

    const model = record.value;

    if (!model) {
      return;
    }

    this.submitting = true;
    try {
      await directusClient.request(createItem('registration', model));
      Toast.open(t('Your registration is complete. Please wait for an email from us.'));
    } catch (err) {
      console.error('submit err:', err);
      Toast.error(err);
    } finally {
      this.submitting = false;
      this.submitted = true;
    }
  }
}
