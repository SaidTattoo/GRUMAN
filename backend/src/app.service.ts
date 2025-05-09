import { Injectable, } from '@nestjs/common';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getUf() {
    return fetch(
      `https://api.cmfchile.cl/api-sbifv3/recursos_api/uf?apikey=${process.env.CMF_APIKEY}&formato=json`,
    ).then((res) => res.json());
  }
}
