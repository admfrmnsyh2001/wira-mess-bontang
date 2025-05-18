import { deleteItem, readItems } from '@directus/sdk';
import { ConfirmModal } from '@lib/components/ConfirmModal.js';
import { BaseList } from '@lib/fw/BaseList.js';
import type { Query, QueryResult } from '@lib/fw/Query.js';
import { directusClient } from '../../runtime/directusClient.js';
import { t } from '../../runtime/i18n.js';
import { html } from 'lit';

export class CrudList extends BaseList {
  protected pageTitle = 'Item List';
  protected collection = '';
  protected fields?: string[];
  protected canAdd = true;
  protected canEdit = true;
  protected canRemove = true;

  async routeCallback(): Promise<void> {
    if (this.canAdd) {
      this.actions.push({
        label: 'Add',
        variant: 'primary',
        icon: 'plus-lg',
        link: () => this.router.link(`${this.router.ctx.path}/-/add`),
      });
    }

    if (this.canEdit) {
      this.itemActions.push({
        label: 'Edit',
        icon: 'pencil-square',
        link: (item) => this.router.link(`${this.router.ctx.path}/${item.id}/edit`),
      });
    }

    if (this.canRemove) {
      this.itemActions.push({
        variant: 'danger',
        label: 'Remove',
        icon: 'trash',
        execute: async (item) => {
          const confirmed = await ConfirmModal.show();
          if (!confirmed) {
            return;
          }
          await this.removeItem(item);
        },
      });
    }

    await super.routeCallback();
  }

  protected async removeItem(item: Record<string, unknown>) {
    await directusClient.request(deleteItem(this.collection, item.id as string));
  }

  protected renderTableColumns(): unknown {
    return html`
      <c-table-column name="name" label=${t('Name')}></c-table-column>
    `;
  }

  protected async load(query: Query): Promise<QueryResult> {
    if (!query.search) {
      // biome-ignore lint/performance/noDelete: <explanation>
      delete query.search;
    }

    const items = await directusClient.request(readItems(this.collection, query));
    return {
      items,
    };
  }

  protected errorCallback(err: unknown): void {
    if (isDirectusError(err)) {
      const message = err.errors.map((err) => err.message).join('. ');
      super.errorCallback(message);
      return;
    }

    super.errorCallback(err);
  }
}

interface DirectusError {
  errors: Error[];
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function isDirectusError(err: any): err is DirectusError {
  return err.errors;
}
