import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChangelogService {
  private hasUnreadChanges = new BehaviorSubject<boolean>(false);
  public hasUnreadChanges$ = this.hasUnreadChanges.asObservable();

  constructor(private http: HttpClient) {
    this.checkUnreadChanges();
  }

  getChangelog(): Observable<any> {
    return this.http.get<any>('assets/changelog.json');
  }

  checkUnreadChanges(): void {
    const lastViewedDate = localStorage.getItem('lastChangelogView');
    
    this.getChangelog().subscribe(changelog => {
      if (!lastViewedDate) {
        this.hasUnreadChanges.next(true);
        return;
      }

      const lastUpdate = new Date(changelog.lastUpdate);
      const lastViewed = new Date(lastViewedDate);
      
      this.hasUnreadChanges.next(lastUpdate > lastViewed);
    });
  }

  markChangelogAsViewed(): void {
    this.hasUnreadChanges.next(false);
  }
} 