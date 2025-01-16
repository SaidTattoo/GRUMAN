export class CreateUserDto {
    name: string;
    lastName: string;
    rut: string;
    email: string;
    password: string;
    profile: string;
    clientId: number;
    especialidades?: number[];
  }