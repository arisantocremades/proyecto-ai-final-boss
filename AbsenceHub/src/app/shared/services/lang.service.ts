import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly STORAGE_KEY = 'app-lang';
  readonly current = signal<string>('es-ES');

  constructor(private translate: TranslateService) {
    const saved = localStorage.getItem(this.STORAGE_KEY) ?? 'es-ES';
    this.current.set(saved);
    this.translate.use(saved);
  }

  toggle(): void {
    const next = this.current() === 'es-ES' ? 'en-US' : 'es-ES';
    this.current.set(next);
    localStorage.setItem(this.STORAGE_KEY, next);
    this.translate.use(next);
  }
}
