import { Injectable, } from '@nestjs/common';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getUf() {
    return fetch(
      'https://api.cmfchile.cl/api-sbifv3/recursos_api/uf?apikey=1efaa680eeeec9b4f028257b9d5cad29fc4bce51&formato=json',
    ).then((res) => res.json());
  }
}
