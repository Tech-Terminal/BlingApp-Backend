import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Meilisearch, Index, SearchParams, SearchResponse } from 'meilisearch';
import { AppConfig } from '@libs/config/app.config';
import { SearchIndex, SEARCH_INDEX_CONFIG, transformDocumentForSearch } from './search.constants';

@Injectable()
export class SearchEngineService implements OnModuleInit {
  private readonly logger = new Logger(SearchEngineService.name);
  private client!: Meilisearch;

  async onModuleInit() {
    const host = AppConfig.MEILISEARCH_HOST;
    const apiKey = AppConfig.MEILISEARCH_MASTER_KEY;

    if (!apiKey) {
      this.logger.warn('MEILISEARCH_MASTER_KEY is not set. Search features may fail.');
    }

    this.client = new Meilisearch({ host, apiKey });
    
    try {
      const health = await this.client.health();
      this.logger.log(`Meilisearch is healthy: ${health.status}`);
      await this.initializeIndexes();
    } catch (error) {
      this.logger.error('Could not connect to Meilisearch', error);
    }
  }

  private async setupIndex(indexName: SearchIndex, searchable: string[], filterable: string[]) {
    await this.client.createIndex(indexName, { primaryKey: 'id' });
    const index = this.client.index(indexName);
    await index.updateSearchableAttributes(searchable);
    await index.updateFilterableAttributes(filterable);
    await index.updateTypoTolerance({
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 3,
        twoTypos: 6,
      },
    });
  }

  /**
   * Idempotently initializes index schemas. Updates filterable, searchable, and typo tolerance attributes on boot.
   */
  async initializeIndexes() {
    try {
      const existingIndexes = await this.client.getIndexes();
      const existingUids = new Set(existingIndexes.results.map((idx) => idx.uid));

      for (const config of SEARCH_INDEX_CONFIG) {
        if (!existingUids.has(config.name)) {
          await this.setupIndex(config.name, config.searchable, config.filterable);
          this.logger.log(`Meilisearch index "${config.name}" created and configured.`);
        } else {
          const index = this.client.index(config.name);
          await index.updateSearchableAttributes(config.searchable);
          await index.updateFilterableAttributes(config.filterable);
          await index.updateTypoTolerance({
            enabled: true,
            minWordSizeForTypos: {
              oneTypo: 3,
              twoTypos: 6,
            },
          });
          this.logger.debug(`Meilisearch index "${config.name}" settings updated.`);
        }
      }
    } catch (e) {
      this.logger.error('Error initializing indexes', e);
    }
  }

  getIndex(indexName: SearchIndex): Index<Record<string, any>> {
    return this.client.index(indexName);
  }

  async search<T extends Record<string, any>>(
    indexName: SearchIndex,
    query: string,
    options?: SearchParams,
  ): Promise<SearchResponse<T>> {
    try {
      const index = this.client.index(indexName);
      return await index.search<T>(query, options);
    } catch (error) {
      this.logger.error(`Error performing search on ${indexName}`, error);
      return { hits: [], query, processingTimeMs: 0, limit: 0, offset: 0, estimatedTotalHits: 0 } as any;
    }
  }

  async globalSearch(query: string, limit: number = 10, offset: number = 0) {
    try {
      const queries = [
        { indexUid: SearchIndex.ACTIVE_INGREDIENTS, q: query, limit, offset, showRankingScore: true },
        { indexUid: SearchIndex.MEDICINES, q: query, limit, offset, showRankingScore: true },
      ];
      
      const results = await this.client.multiSearch({ queries });
      return results;
    } catch (error) {
      this.logger.error('Error performing global search', error);
      return { results: [] };
    }
  }

  async addDocuments(indexName: SearchIndex, documents: any[]) {
    try {
      const index = this.client.index(indexName);
      const minimalDocs = documents.map((doc) => transformDocumentForSearch(indexName, doc));
      await index.addDocuments(minimalDocs);
    } catch (error) {
      this.logger.error(`Error adding documents to ${indexName}`, error);
    }
  }

  async updateDocuments(indexName: SearchIndex, documents: any[]) {
    try {
      const index = this.client.index(indexName);
      const minimalDocs = documents.map((doc) => transformDocumentForSearch(indexName, doc));
      await index.updateDocuments(minimalDocs);
    } catch (error) {
      this.logger.error(`Error updating documents in ${indexName}`, error);
    }
  }

  async deleteDocument(indexName: SearchIndex, documentId: string | number) {
    try {
      const index = this.client.index(indexName);
      await index.deleteDocument(documentId);
    } catch (error) {
      this.logger.error(`Error deleting document ${documentId} from ${indexName}`, error);
    }
  }
}
