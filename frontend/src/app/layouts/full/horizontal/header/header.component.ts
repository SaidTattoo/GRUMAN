import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { navItemsPro } from 'src/app/layouts/navbar-data/navbar-data';
import { MaterialModule } from 'src/app/material.module';
import { AuthService } from 'src/app/services/auth.service';
import { CoreService } from 'src/app/services/core.service';
import { BrandingComponent } from '../../vertical/sidebar/branding.component';
import { navItems } from '../sidebar/sidebar-data';
import { StorageService } from '../../../../services/storage.service';
import { Subscription } from 'rxjs';
import { ChangelogService } from 'src/app/services/changelog.service';
import { ChangelogDialogComponent } from 'src/app/components/changelog-dialog/changelog-dialog.component';
import { MatBadgeModule } from '@angular/material/badge';

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
    MatBadgeModule
  ],
  templateUrl: './header.component.html',
  styles: [`
    .topbar {
      height: auto !important;
    }
    .company-logo {
      height: 60px !important;
      width: auto !important;
      object-fit: contain;
      margin-right: 15px;
    }
    .profile-initials-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #1e88e5;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
    }
    .profile-initials-circle-large {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: #1e88e5;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 1.2em;
    }
    ::ng-deep .company-menu {
  max-height: none !important;
}

::ng-deep .company-menu .mat-menu-content {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
  `],
})
export class AppHorizontalHeaderComponent implements OnInit, OnDestroy {
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
  unreadChanges = 0;
  user: any = null;
  currentClient: any = null;

  showBadge$ = this.changelogService.hasUnreadChanges$;

  constructor(
    private vsidenav: CoreService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private authService: AuthService,
    private storage: StorageService ,private changelogService: ChangelogService
  ) {
    translate.setDefaultLang('en');
  }

  changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }

  openDialog() {
    const dialogRef = this.dialog.open(AppSearchDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  ngOnInit(): void {
    this.userSub = this.storage.user$.subscribe(user => {
      if (user) {
        this.userName = user.name;
        this.userRole = user.profile;
        this.userEmail = user.email;
        this.userCompanies = user.companies || [];
        this.selectedCompany = user.selectedCompany || 
                             (this.userCompanies.length === 1 ? this.userCompanies[0] : null);
      }
    });

    this.changelogService.hasUnreadChanges$.subscribe(
      hasUnread => {
        this.unreadChanges = hasUnread ? 1 : 0;
        console.log('Has unread changes:', hasUnread);
      }
    );
    
    this.changelogService.checkUnreadChanges();

    this.authService.currentUser.subscribe(user => {
      this.user = user;
    });

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
      maxHeight: '80vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.changelogService.checkUnreadChanges();
    });
  }
  onCompanySelect(company: any): void {
    const currentUser = this.storage.getItem('currentUser');
    const updatedUser = { 
      ...currentUser,
      selectedCompany: company,
      companies: currentUser.companies
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

  notifications: notifications[] = [
    {
      id: 1,
      img: '/assets/images/profile/user-1.jpg',
      title: 'Roman Joined the Team!',
      subtitle: 'Congratulate him',
    },
    {
      id: 2,
      img: '/assets/images/profile/user-2.jpg',
      title: 'New message received',
      subtitle: 'Salma sent you new message',
    },
    {
      id: 3,
      img: '/assets/images/profile/user-3.jpg',
      title: 'New Payment received',
      subtitle: 'Check your earnings',
    },
    {
      id: 4,
      img: '/assets/images/profile/user-4.jpg',
      title: 'Jolly completed tasks',
      subtitle: 'Assign her new tasks',
    },
    {
      id: 5,
      img: '/assets/images/profile/user-5.jpg',
      title: 'Roman Joined the Team!',
      subtitle: 'Congratulate him',
    },
  ];

  profiledd: profiledd[] = [
    {
      id: 1,
      img: 'wallet',
      color: 'primary',
      title: 'My Profile',
      subtitle: 'Account Settings',
      link: '/',
    },
    {
      id: 2,
      img: 'shield',
      color: 'success',
      title: 'My Inbox',
      subtitle: 'Messages & Email',
      link: '/',
    },
    {
      id: 3,
      img: 'credit-card',
      color: 'error',
      title: 'My Tasks',
      subtitle: 'To-do and Daily Tasks',
      link: '/',
    },
  ];
  apps: apps[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-dd-chat.svg',
      title: 'Chat Application',
      subtitle: 'Messages & Emails',
      link: '/apps/chat',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-dd-cart.svg',
      title: 'Todo App',
      subtitle: 'Completed task',
      link: '/apps/todo',
    },
    {
      id: 3,
      img: '/assets/images/svgs/icon-dd-invoice.svg',
      title: 'Invoice App',
      subtitle: 'Get latest invoice',
      link: '/apps/invoice',
    },
    {
      id: 4,
      img: '/assets/images/svgs/icon-dd-date.svg',
      title: 'Calendar App',
      subtitle: 'Get Dates',
      link: '/apps/calendar',
    },
    {
      id: 5,
      img: '/assets/images/svgs/icon-dd-mobile.svg',
      title: 'Contact Application',
      subtitle: '2 Unsaved Contacts',
      link: '/apps/contacts',
    },
    {
      id: 6,
      img: '/assets/images/svgs/icon-dd-lifebuoy.svg',
      title: 'Tickets App',
      subtitle: 'Create new ticket',
      link: '/apps/tickets',
    },
    {
      id: 7,
      img: '/assets/images/svgs/icon-dd-message-box.svg',
      title: 'Email App',
      subtitle: 'Get new emails',
      link: '/apps/email/inbox',
    },
    {
      id: 8,
      img: '/assets/images/svgs/icon-dd-application.svg',
      title: 'Courses',
      subtitle: 'Create new course',
      link: '/apps/courses',
    },
  ];

  quicklinks: quicklinks[] = [
    {
      id: 1,
      title: 'Pricing Page',
      link: '/theme-pages/pricing',
    },
    {
      id: 2,
      title: 'Authentication Design',
      link: '/authentication/login',
    },
    {
      id: 3,
      title: 'Register Now',
      link: '/authentication/side-register',
    },
    {
      id: 4,
      title: '404 Error Page',
      link: '/authentication/error',
    },
    {
      id: 5,
      title: 'Notes App',
      link: '/apps/notes',
    },
    {
      id: 6,
      title: 'Employee App',
      link: '/apps/employee',
    },
    {
      id: 7,
      title: 'Todo Application',
      link: '/apps/todo',
    },
    {
      id: 8,
      title: 'Treeview',
      link: '/theme-pages/treeview',
    },
  ];

  changeClient(client: any): void {
    this.currentClient = client;
    this.selectedCompany = client;
    const currentUser = this.storage.getItem('currentUser');
    const updatedUser = { 
      ...currentUser,
      selectedCompany: client
    };
    this.storage.setItem('currentUser', updatedUser);
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

  navItemsData = navItems.filter((navitem) => navitem.displayName);

  // filtered = this.navItemsData.find((obj) => {
  //   return obj.displayName == this.searchinput;
  // });
}
