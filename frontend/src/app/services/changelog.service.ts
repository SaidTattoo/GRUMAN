import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'feature' | 'fix' | 'improvement';
    description: string;
  }[];
}

interface Changelog {
  lastUpdate: string;
  versions: ChangelogEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class ChangelogService {
  private readonly STORAGE_KEY = 'last_changelog_read';
  private unreadChangesSubject = new BehaviorSubject<number>(0);
  unreadChanges$ = this.unreadChangesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkUnreadChanges();
  }

  getChangelog(): Observable<Changelog> {
    return this.http.get<Changelog>('assets/changelog.json');
  }

  private checkUnreadChanges() {
    const lastReadDate = localStorage.getItem(this.STORAGE_KEY);
    
    this.getChangelog().subscribe(changelog => {
      if (!lastReadDate) {
        const totalChanges = changelog.versions.reduce(
          (total, version) => total + version.changes.length, 0
        );
        this.unreadChangesSubject.next(totalChanges);
        return;
      }

      const unreadChanges = changelog.versions
        .filter(version => new Date(version.date) > new Date(lastReadDate))
        .reduce((total, version) => total + version.changes.length, 0);

      this.unreadChangesSubject.next(unreadChanges);
    });
  }

  markChangesAsRead() {
    const currentDate = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, currentDate);
    this.unreadChangesSubject.next(0);
  }

  refreshUnreadCount() {
    this.checkUnreadChanges();
  }
} 