import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  CreateExampleMongodbDocDto,
  ExampleMongodbDocDto,
  UpdateExampleMongodbDocDto,
} from '../models/example-document.models';

/** Transport only: no shared state, forms, navigation or notifications. */
@Injectable({ providedIn: 'root' })
export class ExampleCrudApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/example-crud';

  list$() { return this.http.get<ExampleMongodbDocDto[]>(this.baseUrl); }
  getById$(id: string) {
    return this.http.get<ExampleMongodbDocDto>(this.url(id));
  }
  create$(dto: CreateExampleMongodbDocDto) {
    return this.http.post<ExampleMongodbDocDto>(this.baseUrl, dto);
  }
  update$(id: string, patch: UpdateExampleMongodbDocDto) {
    return this.http.patch<ExampleMongodbDocDto>(this.url(id), patch);
  }
  delete$(id: string) { return this.http.delete<void>(this.url(id)); }
  private url(id: string) { return `${this.baseUrl}/${encodeURIComponent(id)}`; }
}
