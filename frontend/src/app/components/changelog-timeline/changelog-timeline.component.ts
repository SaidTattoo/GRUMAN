import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ChangelogService } from '../../services/changelog.service';

interface Change {
  type: 'feature' | 'fix' | 'improvement';
  description: string;
}

interface Version {
  version: string;
  date: string;
  changes: Change[];
}

interface Changelog {
  lastUpdate: string;
  versions: Version[];
}

@Component({
  selector: 'app-changelog-timeline',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <mat-card class="timeline-container">
      <mat-card-header>
        <mat-card-title>Historial Completo de Actualizaciones</mat-card-title>
        <mat-card-subtitle>
          Última actualización: {{ changelog?.lastUpdate | date:'fullDate':'':'es' }}
        </mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="timeline">
          @for (version of changelog?.versions; track version.version) {
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="version-header">
                <h3>Versión {{ version.version }}</h3>
                <span class="version-date">{{ version.date | date:'d MMM, y':'':'es' }}</span>
              </div>
              <div class="changes-list">
                @for (change of version.changes; track change.description) {
                  <div class="change-item">
                    <mat-icon [ngClass]="change.type">
                      {{ getIconForType(change.type) }}
                    </mat-icon>
                    <span>{{ change.description }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .timeline-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }

    mat-card-subtitle {
      margin-top: 8px !important;
      color: #666;
    }

    .timeline {
      position: relative;
      padding: 20px 0;
      margin-left: 20px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 9px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e0e0e0;
    }

    .timeline-item {
      position: relative;
      padding-left: 40px;
      padding-bottom: 24px;
      min-height: min-content;

      &:last-child {
        padding-bottom: 0;
      }

      &:not(:last-child) {
        margin-bottom: calc(12px + 1vh);
      }
    }

    .timeline-dot {
      position: absolute;
      left: 0;
      top: 6px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid #1e88e5;
      z-index: 1;
    }

    .version-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;

      h3 {
        margin: 0;
        color: #1e88e5;
        font-size: 1.2em;
        font-weight: 500;
        margin-right: 12px;
      }

      .version-date {
        color: #666;
        font-size: 0.9em;
      }
    }

    .changes-list {
      padding-left: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .change-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      mat-icon {
        font-size: 20px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      span {
        font-size: 0.95em;
        line-height: 1.4;
        flex: 1;
      }
    }

    .feature {
      color: #4CAF50;
    }

    .fix {
      color: #F44336;
    }

    .improvement {
      color: #2196F3;
    }

    @media (max-width: 600px) {
      .timeline-item {
        padding-left: 32px;
        padding-bottom: 20px;
      }

      .timeline-dot {
        width: 16px;
        height: 16px;
      }

      .version-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;

        .version-date {
          margin-left: 0;
        }
      }
    }
  `]
})
export class ChangelogTimelineComponent implements OnInit {
  changelog: Changelog | null = null;

  constructor(private changelogService: ChangelogService) {}

  ngOnInit() {
    this.changelogService.getChangelog().subscribe({
      next: (data) => {
        this.changelog = data;
      },
      error: (error) => {
        console.error('Error loading changelog:', error);
      }
    });
  }

  getIconForType(type: string): string {
    switch (type) {
      case 'feature': return 'star';
      case 'fix': return 'bug_report';
      case 'improvement': return 'trending_up';
      default: return 'info';
    }
  }

  getVersionClass(version: Version): string {
    const versionNumber = parseFloat(version.version.split('.')[1]);
    if (versionNumber === 0) return 'major';
    if (versionNumber % 1 === 0) return 'minor';
    return '';
  }
} 