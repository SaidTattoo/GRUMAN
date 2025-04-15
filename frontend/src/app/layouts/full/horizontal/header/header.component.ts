import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { navItemsPro } from 'src/app/layouts/navbar-data/navbar-data';
import { MaterialModule } from 'src/app/material.module';
import { AuthService } from 'src/app/services/auth.service';
import { CoreService } from 'src/app/services/core.service';
import { BrandingComponent } from '../../vertical/sidebar/branding.component';
import { StorageService } from '../../../../services/storage.service';
import { Subscription } from 'rxjs';
import { ChangelogService } from 'src/app/services/changelog.service';
import { ChangelogDialogComponent } from 'src/app/components/changelog-dialog/changelog-dialog.component';
import { MatBadgeModule } from '@angular/material/badge';
import { ChangePasswordDialogComponent } from '../../../../components/change-password-dialog/change-password-dialog.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatChipsModule, MatChipGrid, MatChipInputEvent } from '@angular/material/chips';
import { ENTER } from '@angular/cdk/keycodes';

interface notifications {
  id: number;
  img: string;
  title: string;
  subtitle: string;
}

interface profiledd {
  id: number;
  img: string;
  title: string;
  color: string;
  subtitle: string;
  link: string;
}

interface apps {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

interface quicklinks {
  id: number;
  title: string;
  link: string;
}

@Component({
  selector: 'app-horizontal-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
    FormsModule,
    MatMenuModule,
    MatButtonModule,
    BrandingComponent,
    MatBadgeModule,
    ReactiveFormsModule,
    MatChipsModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class AppHorizontalHeaderComponent implements OnInit, OnDestroy {
  @ViewChild('chipGrid') chipGrid!: MatChipGrid;
  readonly ENTER = ENTER;
  searchText: string = '';
  userProfile:any;
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  navItemsData = navItemsPro.filter((navitem) => navitem.displayName);

  showFiller = false;

  logout() {
    this.authService.logout();
  }

  public selectedLanguage: any = {
    language: 'English',
    code: 'en',
    type: 'US',
    icon: '/assets/images/flag/icon-flag-en.svg',
  };

  public languages: any[] = [
    {
      language: 'English',
      code: 'en',
      type: 'US',
      icon: '/assets/images/flag/icon-flag-en.svg',
    },
    {
      language: 'Español',
      code: 'es',
      icon: '/assets/images/flag/icon-flag-es.svg',
    },
    {
      language: 'Français',
      code: 'fr',
      icon: '/assets/images/flag/icon-flag-fr.svg',
    },
    {
      language: 'German',
      code: 'de',
      icon: '/assets/images/flag/icon-flag-de.svg',
    },
  ];

  userName: string | null = null;
  userRole: string | null = null;
  userEmail: string | null = null;
  userCompanies: any[] = [];
  selectedCompany: any | null = null;
  private userSub: Subscription;
  user: any = null;
  currentClient: any = null;

  showBadge$ = this.changelogService.hasUnreadChanges$;

  searchControl = new FormControl('');
  isSearchExpanded = false;
  searchParams: string[] = [];

  isDialogOpen = false;

  constructor(
    private vsidenav: CoreService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private authService: AuthService,
    private storage: StorageService,
    private changelogService: ChangelogService,
    private router: Router
  ) {
    translate.setDefaultLang('en');
  }

  changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }

  ngOnInit(): void {
    // Obtener los parámetros de búsqueda de la URL
    const currentUrl = this.router.url;
    const searchParams = new URLSearchParams(currentUrl.split('?')[1]);
    const qParam = searchParams.get('q');
    if (qParam) {
      // Dividir por comas y limpiar cada término
      this.searchParams = qParam.split(',').map(param => param.trim()).filter(param => param.length > 0);
      this.isSearchExpanded = this.searchParams.length > 0;
    }

    // Resto del código existente del ngOnInit
    this.userSub = this.authService.currentUser.subscribe(user => {
      if (user) {
        this.user = user;
        this.userName = user.name;
        this.userRole = user.role;
        this.userEmail = user.email;
        this.userCompanies = user.companies || [];
        
        // Si hay compañías disponibles, seleccionar la primera por defecto
        if (this.userCompanies.length > 0) {
          const storedCompanyId = this.storage.getItem('selectedCompanyId');
          if (storedCompanyId) {
            this.selectedCompany = this.userCompanies.find(c => c.id === parseInt(storedCompanyId)) || this.userCompanies[0];
          } else {
            this.selectedCompany = this.userCompanies[0];
          }
        }
      }
    });

    // Configurar el idioma por defecto
    this.translate.setDefaultLang(this.selectedLanguage.code);
    this.translate.use(this.selectedLanguage.code);

    // Verificar cambios no leídos al inicio
    this.changelogService.checkUnreadChanges();
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  openChangelog() {
    const dialogRef = this.dialog.open(ChangelogDialogComponent, {
      width: '600px',
      maxHeight: '80vh',
      disableClose: false
    });

    // Solo actualizar cuando el diálogo se cierre completamente
    dialogRef.afterClosed().subscribe(() => {
      this.changelogService.checkUnreadChanges();
    });
  }

  onCompanySelect(company: any): void {
    const currentUser = this.storage.getItem('currentUser');
    const updatedUser = { 
      ...currentUser,
      selectedCompany: company
    };
    this.selectedCompany = company;
    this.storage.setItem('currentUser', updatedUser);
  }

  getUserInitials(): string {
    if (this.userName) {
      const names = this.userName.split(' ');
      const initials = names.map(name => name.charAt(0)).join('');
      return initials.toUpperCase();
    }
    return '';
  }

  openChangePasswordDialog() {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle password change result if needed
      }
    });
  }

  toggleSearch(): void {
    this.isSearchExpanded = !this.isSearchExpanded;
    if (this.isSearchExpanded) {
      setTimeout(() => {
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    const searchDiv = document.querySelector('.search-div');
    const target = event.target as HTMLElement;
    
    // No cerrar si el click fue en un chip, en el input o en el botón de búsqueda
    if (target.closest('.mat-mdc-chip') || 
        target.closest('.search-input') || 
        target.closest('.search-button')) {
      return;
    }

    if (!searchDiv?.contains(target)) {
      this.isSearchExpanded = false;
      this.searchControl.setValue('');
    }
  }

  performSearch(): void {
    const value = this.searchControl.value?.trim();
    
    if (value) {
      // Agregar el término completo como un solo badge
      if (!this.searchParams.includes(value)) {
        this.searchParams.push(value);
      }
      // Limpiar el input
      this.searchControl.setValue('');
    }

    // Si hay términos acumulados, realizar la búsqueda
    if (this.searchParams.length > 0) {
      this.router.navigate(['/busqueda-global'], {
        queryParams: { q: this.searchParams.join(',') }
      });
    }
  }

  removeSearchParam(param: string): void {
    const index = this.searchParams.indexOf(param);
    if (index >= 0) {
      this.searchParams.splice(index, 1);
    }
  }

  clearSearch(): void {
    this.searchParams = [];
    this.searchControl.setValue('');
    this.isSearchExpanded = false;
    
    // Si estamos en la página de búsqueda global, actualizar los parámetros de la URL
    if (this.router.url.includes('/busqueda-global')) {
      this.router.navigate(['/busqueda-global'], {
        queryParams: {},
        replaceUrl: true
      });
    }
  }
}

@Component({
  selector: 'search-dialog',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    TablerIconsModule,
    FormsModule,
    NgScrollbarModule,
  ],
  templateUrl: 'search-dialog.component.html',
})
export class AppSearchDialogComponent {
  searchText: string = '';
  navItems = navItemsPro;

  navItemsData = navItemsPro.filter((navitem) => navitem.displayName);

  // filtered = this.navItemsData.find((obj) => {
  //   return obj.displayName == this.searchinput;
  // });
}
