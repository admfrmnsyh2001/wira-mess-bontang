import { html } from 'lit';
import { CrudList } from './CrudList.js';
import type { Query, QueryResult } from '@lib/fw/Query.js';
import { customElement } from 'lit/decorators.js';
import { i18n } from '../../runtime/i18n.js';
import { ConfirmModal } from '@lib/components/ConfirmModal.js';

const t = i18n.createTranslator('admin');

@customElement('a-admin-list')
export class AdminList extends CrudList {
  protected pageTitle = t('Admins');
  protected collection = 'admin';

  protected canAdd = false;
  protected canEdit = false;
  protected canRemove = false;

  async routeCallback(): Promise<void> {
    this.actions.push({
      variant: 'primary',
      label: 'Add',
      icon: 'person-add',
      link: () => this.router.link(`${this.router.ctx.path}/-/add`),
    });

    this.itemActions.push({
      variant: 'danger',
      label: 'Remove',
      icon: 'person-dash',
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

  protected renderTableColumns(): unknown {
    return html`
      <c-table-column name="name" label=${t('Name')}></c-table-column>
      <c-table-column name="userName" label=${t('User Name')}></c-table-column>
      <c-table-column name="password" label=${t('Password')}></c-table-column>
      <c-table-column name="role" label=${t('Role')}></c-table-column>
    `;
  }
}
