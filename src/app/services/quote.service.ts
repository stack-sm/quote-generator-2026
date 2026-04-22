import { inject, Injectable, PLATFORM_ID, resource, signal } from '@angular/core';
import { Quote } from '../models/quote.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private platformId = inject(PLATFORM_ID);
  public seenIds = new Set<number>(); // public so I can reset it from the component when needed

  // 1. Point to the data source
  public quotesResource = resource({
    loader: () => {
      // If NOT in browser (meaning we are in Node/SSR), stop immediately.
      if (!isPlatformBrowser(this.platformId)) {
        return Promise.resolve([]);
      }

      // return fetch('/wrong-file-name.json').then((res) => { // for testing error state
      return fetch('/quotes.json').then((res) => {
        if (!res.ok) throw new Error('404');
        return res.json();
      });
    },
  });

  // 2. Update the logic to use the Resource data
  public calculateNextQuote(currentId?: number): Quote | null {
    // Access the value from the resource signal
    const allQuotes = this.quotesResource.value() ?? [];

    // Handle the case where there are no quotes available
    if (allQuotes.length === 0) return null;

    // 1. Filter out the ID that is currently on the screen
    // AND filter out IDs I've already seen
    let available = allQuotes.filter((q: Quote) => !this.seenIds.has(q.id) && q.id !== currentId);

    // 2. If I run out of new quotes, reset but still exclude the current one
    if (available.length === 0) {
      this.seenIds.clear();
      available = allQuotes.filter((q: Quote) => q.id !== currentId);
    }

    // 3. Fallback: If there's only 1 quote in the whole file, just return it
    const source = available.length > 0 ? available : allQuotes;

    const randomQuote = source[Math.floor(Math.random() * source.length)];
    this.seenIds.add(randomQuote.id);
    return randomQuote;
  }
}
