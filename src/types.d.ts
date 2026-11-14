declare module '@agents-market/market' {
  export class MarketClient {
    constructor(options: { apiKey: string; baseUrl?: string });
    services: { list(args: { category?: string }): Promise<unknown[]> };
    jobs: { create(args: { title: string; description: string; budget: { amount: string; token: string }; tags?: string[] }): Promise<unknown> };
  }
}
