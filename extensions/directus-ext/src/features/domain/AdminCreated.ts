interface AdminCreatedProps {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export class AdminCreated {
  first_name: string;
  last_name: string;
  email: string;
  password: string;

  constructor(readonly props: AdminCreatedProps) {
    this.email = props.email;
    this.first_name = props.first_name;
    this.last_name = props.last_name;
    this.password = props.password;
  }
}
