import { BaseForm } from '@lib/fw/BaseForm.js';
import { t } from '../../runtime/i18n.js';
import { html } from 'lit';
import '@lib/fields/TextField.js';
import { directusClient } from '../../runtime/directusClient.js';
import { createItem, readItem, updateItem } from '@directus/sdk';

export class CrudForm extends BaseForm {
  protected label?: string;
  protected collection = 'organization';
  protected kind = '';

  async routeCallback(): Promise<void> {
    this.kind = this.kind || this.router.ctx.params.key ? 'edit' : 'add';
    this.label = this.label || detectLabel(this.collection);
    if (this.pageTitle === 'Form') {
      this.pageTitle = this.kind === 'add' ? t(`Add ${this.label}`) : t(`Edit ${this.label}`);
    }

    await super.routeCallback();
  }

  protected renderLayout(): unknown {
    return html`
      <div class="row mb-3">
        <div class="col">
          <f-text-field
            name="name"
            label=${t('Name')}
            required
          ></f-text-field>
        </div>
      </div>
    `;
  }

  protected async load(): Promise<Record<string, unknown> | undefined> {
    if (this.kind === 'edit') {
      const result = await directusClient.request(readItem(this.collection, this.router.ctx.params.key));
      return result;
    }
    return undefined;
  }

  protected async submit(value: Record<string, unknown>): Promise<Record<string, string>> {
    if (this.kind === 'add') {
      await directusClient.request(createItem(this.collection, value));
      return {};
    }

    if (this.kind === 'edit') {
      await directusClient.request(updateItem(this.collection, this.router.ctx.params.key, value));
      return {};
    }

    throw new Error(`unimplemented submit with kind: ${this.kind}`);
  }
}

function detectLabel(name: string): string {
  return name[0].toUpperCase() + name.slice(1);
}
