interface AdminCreatedProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export class AdminCreated {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  constructor(readonly props: AdminCreatedProps) {
    this.email = props.email;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.password = props.password;
  }
}
