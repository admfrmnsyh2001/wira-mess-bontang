interface BookingCreatedParams {
  id: number;
  name: string;
  division: string;
  email: string;
  startDate: Date;
  endDate: Date;
  room: string;
  pin: string;
}

export class BookingCreated {
  id: number;
  name: string;
  division: string;
  email: string;
  startDate: Date;
  endDate: Date;
  room: string;
  pin: string;

  constructor(readonly params: BookingCreatedParams) {
    this.id = params.id;
    this.name = params.name;
    this.division = params.division;
    this.email = params.email;
    this.startDate = params.startDate;
    this.endDate = params.endDate;
    this.room = params.room;
    this.pin = params.pin;
  }
}
