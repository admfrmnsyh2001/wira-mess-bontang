import type { Query, QueryResult } from '@lib/fw/Query.js';
import { i18n } from '../../runtime/i18n.js';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CrudList } from './CrudList.js';
import { ConfirmModal } from '@lib/components/ConfirmModal.js';

const t = i18n.createTranslator('admin');

@customElement('a-registration-list')
export class RegistrationList extends CrudList {
  protected pageTitle = t('Registrations');
  protected collection = 'registration';

  protected canAdd = false;
  protected canEdit = false;
  protected canRemove = false;

  async routeCallback(): Promise<void> {
    this.itemActions.push({
      variant: 'success',
      label: 'Verify',
      icon: 'check2-circle',
      link: (item) => this.router.link(`${this.router.ctx.path}/${item.id}/edit`),
    });

    this.itemActions.push({
      variant: 'danger',
      label: 'Reject',
      icon: 'x-circle',
      execute: async (item) => {
        const confirmed = await ConfirmModal.show();
        if (!confirmed) {
          return;
        }
        await this.removeItem(item);
      },
    });

    await super.routeCallback();
  }

  protected async load(query: Query): Promise<QueryResult<Record<string, unknown>>> {
    query.filter = {
      status: 'created',
    };
    return super.load(query);
  }

  protected renderTableColumns(): unknown {
    return html`
      <c-table-column name="name" label=${t('Name')}></c-table-column>
      <c-table-column name="email" label=${t('Email')}></c-table-column>
      <c-table-column name="start_date" label=${t('Start Date')}></c-table-column>
      <c-table-column name="end_date" label=${t('End Date')}></c-table-column>
      <c-table-column name="status" label=${t('Status')}></c-table-column>
    `;
  }
}
