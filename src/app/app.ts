import { Component, effect, inject, signal } from '@angular/core';
import { QuoteService } from './services/quote.service';
import { Quote } from './models/quote.model';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [MatButtonModule],
})
export class App {
  protected readonly title = signal('Amazing quotes');
  public quoteService = inject(QuoteService);

  // displayed quote
  public activeQuote = signal<Quote | null>(null);

  // load the first quote when the resource data is available
  private autoLoader = effect(() => {
    // 1. Guard against errors
    if (this.quoteService.quotesResource.error()) {
      return;
    }

    // 2. Access the value ONCE
    const allQuotes = this.quoteService.quotesResource.value();

    // 3. Only run logic if we have data and no active quote yet
    if (allQuotes && allQuotes.length > 0 && !this.activeQuote()) {
      // Try to find the Shakespeare quote (ID: 1) first
      const initialQuote = allQuotes.find((q: Quote) => q.id === 1);

      if (initialQuote) {
        this.activeQuote.set(initialQuote);
        this.quoteService.seenIds.add(initialQuote.id);
      } else {
        // Fallback if ID 1 isn't there for some reason
        this.updateQuote();
      }
    }
  });

  public handleRefresh() {
    window.location.reload();
  }

  public updateQuote() {
    this.activeQuote.set(this.quoteService.calculateNextQuote(this.activeQuote()?.id));
  }

  public onAmazingQuoteButtonClick() {
    // No return value needed since the quote is stored in a signal
    this.activeQuote.set(this.quoteService.calculateNextQuote());
  }
}
