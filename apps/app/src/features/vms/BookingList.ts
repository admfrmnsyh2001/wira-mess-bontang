import type { Query, QueryResult } from '@lib/fw/Query.js';
import { i18n } from '@stores/i18n.js';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CrudList } from './CrudList.js';

const t = i18n.createTranslator('admin');

@customElement('a-booking-list')
export class BookingList extends CrudList {
  protected pageTitle = t('Bookings');
  protected collection = 'booking';

  protected canAdd = false;
  protected canEdit = false;
  protected canRemove = false;

  protected async load(query: Query): Promise<QueryResult<Record<string, unknown>>> {
    return super.load(query);
  }

  protected renderTableColumns(): unknown {
    return html`
      <c-table-column name="name" label=${t('Name')}></c-table-column>
      <c-table-column name="email" label=${t('Email')}></c-table-column>
      <c-table-column name="room" label=${t('Room')}></c-table-column>
      <c-table-column name="start_date" label=${t('Start Date')}></c-table-column>
      <c-table-column name="end_date" label=${t('End Date')}></c-table-column>
      <c-table-column name="status" label=${t('Status')}></c-table-column>
    `;
  }
}
