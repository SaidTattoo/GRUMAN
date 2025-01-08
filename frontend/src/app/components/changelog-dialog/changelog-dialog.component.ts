import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
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

@Component({
  selector: 'app-changelog-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="changelog-dialog">
      <h2 mat-dialog-title>Últimas Actualizaciones</h2>
      <p class="update-date">Última actualización: {{ lastUpdate | date:'fullDate':'':'es' }}</p>
      
      <div class="dialog-content">
        @for (version of recentVersions; track version.version) {
          <div class="version-block">
            <h3>
              Versión {{ version.version }}
              <small>({{ version.date | date:'d MMM, y':'':'es' }})</small>
            </h3>
            <ul class="changes-list">
              @for (change of version.changes; track change.description) {
                <li class="change-item">
                  <mat-icon [ngClass]="change.type">
                    {{ getIconForType(change.type) }}
                  </mat-icon>
                  <span>{{ change.description }}</span>
                </li>
              }
            </ul>
          </div>
        }
      </div>

      <mat-dialog-actions align="end">
        <button mat-button (click)="verHistorialCompleto()">Ver historial completo</button>
        <button mat-button mat-dialog-close>Cerrar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .changelog-dialog {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 80vh;
      padding: 24px;
      box-sizing: border-box;
    }

    h2[mat-dialog-title] {
      margin: 0;
      padding: 0;
    }

    .update-date {
      color: #666;
      font-size: 0.9em;
      margin: 8px 0 16px;
    }

    .dialog-content {
      flex: 1;
      overflow-y: auto;
      padding-right: 8px; // Espacio para el scrollbar
      margin-bottom: 16px;
    }

    .version-block {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    h3 {
      color: #333;
      margin: 0 0 16px;
      font-size: 1.1em;
      
      small {
        color: #666;
        font-size: 0.85em;
        margin-left: 8px;
      }
    }

    .changes-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .change-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
      font-size: 0.95em;
      
      &:last-child {
        margin-bottom: 0;
      }

      mat-icon {
        margin-right: 8px;
        font-size: 20px;
        flex-shrink: 0;
      }

      span {
        flex: 1;
        line-height: 1.4;
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

    mat-dialog-actions {
      margin: 0;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    /* Estilo personalizado para el scrollbar */
    .dialog-content::-webkit-scrollbar {
      width: 6px;
    }

    .dialog-content::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb:hover {
      background: #666;
    }
  `]
})
export class ChangelogDialogComponent implements OnInit {
  recentVersions: Version[] = [];
  lastUpdate: string = '';

  constructor(
    private changelogService: ChangelogService,
    private dialogRef: MatDialogRef<ChangelogDialogComponent>,
    private router: Router
  ) {}

  ngOnInit() {
    this.changelogService.getChangelog().subscribe({
      next: (data) => {
        this.lastUpdate = data.lastUpdate;
        this.recentVersions = data.versions.slice(0, 3).map(version => ({
          version: version.version,
          date: version.date,
          changes: version.changes.map(change => ({
            type: change.type as 'feature' | 'fix' | 'improvement',
            description: change.description
          }))
        }));
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

  verHistorialCompleto() {
    this.dialogRef.close();
    this.router.navigate(['/changelog']);
  }
} 