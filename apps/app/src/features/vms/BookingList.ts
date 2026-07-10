import type { Query, QueryResult } from '@lib/fw/Query.js';
import { i18n } from '../../runtime/i18n.js';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CrudList } from './CrudList.js';
import { readItems } from '@directus/sdk';
import { directusClient } from '../../runtime/directusClient.js';

const t = i18n.createTranslator('admin');

@customElement('a-booking-list')
export class BookingList extends CrudList {
  protected pageTitle = t('Bookings');
  protected collection = 'booking';

  protected canAdd = false;
  protected canEdit = false;
  protected canRemove = false;

  protected async load(query: Query): Promise<QueryResult<Record<string, unknown>>> {
    const date = query.filter?.date;

    let filter = {};
    if (date) {
      filter = {
        start_date: {
          _lte: date,
        },
        end_date: {
          _gte: date,
        },
      };
    }

    // biome-ignore lint/suspicious/noExplicitAny: needed for Directus fields typing
    const items = await directusClient.request(readItems('booking', {
      search: query.search,
      fields: ['*', 'room.name', 'room.id'] as any,
      filter,
    }));

    return { items };
  }

  protected renderTableColumns(): unknown {
    return html`
      <c-table-column name="name" label=${t('Name')} width="250"></c-table-column>
      <c-table-column name="email" label=${t('Email')} width="250"></c-table-column>
      <c-table-column name="room" label=${t('Room')} width="150" .renderer=${renderRoom}></c-table-column>
      <c-table-column name="start_date" label=${t('Start Date')}></c-table-column>
      <c-table-column name="end_date" label=${t('End Date')}></c-table-column>
      <c-table-column name="status" label=${t('Status')} .renderer=${renderBadge}></c-table-column>
    `;
  }

  protected renderSearch(): unknown {
    return html`
    <label for="date" class="mt-2 me-2">${t('Filter by date')}</label>
    <div class="me-2">
      <input type="date" class="form-control" .value=${(this.query.filter?.date as string) ?? ''} @change=${this.onDateChange}>
    </div>
      ${super.renderSearch()}
    `;
  }

  private _debounceDateChange = 0;
  private onDateChange(evt: Event) {
    const el = evt.target as HTMLInputElement;
    const value = el.value;

    clearTimeout(this._debounceDateChange);
    this._debounceDateChange = setTimeout(() => {
      this.query = {
        ...this.query,
        filter: {
          date: value,
        },
      };

      const urlQuery = this.toQueryString(this.query);
      this.router.replace(urlQuery);
    }, 1000);
  }
}

function renderRoom(row: Record<string, unknown>) {
  // biome-ignore lint/suspicious/noExplicitAny: room can be object or string
  const room = row.room as any;
  const roomName = room?.name ?? room ?? '-';
  return html`<td>${roomName}</td>`;
}

function renderBadge(row: Record<string, unknown>, field: Record<string, unknown>) {
  const status = row.status as string;

  let badgeClass = '';
  if (status === 'registered') {
    badgeClass = 'bg-primary';
  } else if (status === 'expired') {
    badgeClass = 'bg-danger';
  }
  return html`
  <td>
    <span class="badge ${badgeClass} text-capitalize">
      ${status}
    </span>
  </td>
  `;
}
