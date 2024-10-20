import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="branding">
      @if(options.theme === 'light') {

        <img
          src="./assets/images/empresas/atlantis_logo.jpg"
          style="width: 100px"
          class="align-middle m-2"
          alt="logo"
        />


      } @if(options.theme === 'dark') {

        <img
          src="./assets/images/empresas/atlantis_logo.jpg"
          style="width: 100px"
          class="align-middle m-2"
          alt="logo"
        />
      }
    </div>
  `,
})
export class BrandingComponent implements OnInit {
  options = this.settings.getOptions();
  company: string = '';
  constructor(private settings: CoreService,private authService: AuthService) { }
  ngOnInit(): void {
    const userProfile:any = this.authService.getUserProfile();
    console.log(userProfile);
    if (userProfile) {
      this.company = userProfile.company;
    }
  }
  getCompanyLogo(): string {
    console.log(this.company);
    switch (this.company) {
      case 'maicao':
        return './assets/images/empresas/maicao.png';
      case 'cruz_verde':
        return './assets/images/empresas/cruzverde.png';
      case 'gruman':
        return './assets/images/empresas/gruman.png';
      case 'rotter_krauss':
        return './assets/images/empresas/rotter_krauss.png';
      case 'san_camilo':
        return './assets/images/empresas/san_camilo.png';
      default:
        return './assets/images/empresas/default_logo.png';
    }
  }
}
