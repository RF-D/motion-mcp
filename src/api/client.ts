import axios, { AxiosInstance, AxiosError } from 'axios';
import PQueue from 'p-queue';
import {
  MotionConfig,
  MotionTask,
  MotionProject,
  MotionWorkspace,
  MotionUser,
  MotionComment,
  MotionSchedule,
  MotionCustomField,
  MotionRecurringTask,
  MotionListResponse,
  MotionTaskCreateParams,
  MotionTaskUpdateParams,
  MotionProjectCreateParams,
  MotionCommentCreateParams,
} from '../types/motion.js';

export class MotionApiClient {
  private axios: AxiosInstance;
  private queue: PQueue;

  constructor(config: MotionConfig) {
    this.axios = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'X-API-Key': config.apiKey,
        'Content-Type': 'application/json',
      },
    });

    // Set up rate limiting queue
    this.queue = new PQueue({
      concurrency: 1,
      interval: 60000, // 1 minute
      intervalCap: config.rateLimitPerMinute,
    });

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status;
          const message = (error.response.data as any)?.message || error.message;

          if (status === 429) {
            throw new Error(`Rate limit exceeded. Please try again later. ${message}`);
          } else if (status === 401) {
            throw new Error(`Authentication failed. Check your API key. ${message}`);
          } else if (status === 404) {
            throw new Error(`Resource not found. ${message}`);
          } else {
            throw new Error(`API error (${status}): ${message}`);
          }
        }
        throw error;
      }
    );
  }

  private async request<T>(method: string, path: string, data?: any, params?: any): Promise<T> {
    return this.queue.add(async () => {
      const response = await this.axios.request<T>({
        method,
        url: path,
        data,
        params,
      });
      return response.data;
    }) as Promise<T>;
  }

  // Beta endpoints (e.g. custom fields) live under /beta/ rather than /v1/.
  // Pass an absolute URL so axios ignores the v1 baseURL.
  private async requestBeta<T>(
    method: string,
    path: string,
    data?: any,
    params?: any
  ): Promise<T> {
    return this.queue.add(async () => {
      const response = await this.axios.request<T>({
        method,
        url: `https://api.usemotion.com/beta${path}`,
        data,
        params,
      });
      return response.data;
    }) as Promise<T>;
  }

  // Workspace methods
  async listWorkspaces(): Promise<MotionWorkspace[]> {
    // Motion API wraps the array in `{ workspaces: [...] }` — unwrap defensively
    // so older code paths that expect an array keep working.
    const res = await this.request<MotionWorkspace[] | { workspaces: MotionWorkspace[] }>(
      'GET',
      '/workspaces'
    );
    return Array.isArray(res) ? res : (res?.workspaces ?? []);
  }

  async getWorkspace(workspaceId: string): Promise<MotionWorkspace> {
    return this.request<MotionWorkspace>('GET', `/workspaces/${workspaceId}`);
  }

  // Task methods
  async listTasks(params?: {
    assigneeId?: string;
    cursor?: string;
    includeAllStatuses?: boolean;
    label?: string;
    name?: string;
    projectId?: string;
    status?: string[];
    workspaceId?: string;
  }): Promise<MotionListResponse<MotionTask>> {
    const response = await this.request<{ meta: any; tasks: MotionTask[] }>(
      'GET',
      '/tasks',
      undefined,
      params
    );
    return {
      meta: response.meta,
      tasks: response.tasks,
    };
  }

  async getTask(taskId: string): Promise<MotionTask> {
    return this.request<MotionTask>('GET', `/tasks/${taskId}`);
  }

  async createTask(params: MotionTaskCreateParams): Promise<MotionTask> {
    return this.request<MotionTask>('POST', '/tasks', params);
  }

  async updateTask(taskId: string, params: MotionTaskUpdateParams): Promise<MotionTask> {
    return this.request<MotionTask>('PATCH', `/tasks/${taskId}`, params);
  }

  async deleteTask(taskId: string): Promise<void> {
    return this.request<void>('DELETE', `/tasks/${taskId}`);
  }

  async moveTask(taskId: string, projectId: string): Promise<MotionTask> {
    return this.request<MotionTask>('PATCH', `/tasks/${taskId}/move`, { projectId });
  }

  // Project methods
  async listProjects(workspaceId?: string): Promise<MotionProject[]> {
    const params = workspaceId ? { workspaceId } : undefined;
    const res = await this.request<MotionProject[] | { projects: MotionProject[] }>(
      'GET',
      '/projects',
      undefined,
      params
    );
    return Array.isArray(res) ? res : (res?.projects ?? []);
  }

  async getProject(projectId: string): Promise<MotionProject> {
    return this.request<MotionProject>('GET', `/projects/${projectId}`);
  }

  async createProject(params: MotionProjectCreateParams): Promise<MotionProject> {
    return this.request<MotionProject>('POST', '/projects', params);
  }

  async updateProject(
    projectId: string,
    params: Partial<MotionProjectCreateParams>
  ): Promise<MotionProject> {
    return this.request<MotionProject>('PATCH', `/projects/${projectId}`, params);
  }

  async deleteProject(projectId: string): Promise<void> {
    return this.request<void>('DELETE', `/projects/${projectId}`);
  }

  // User methods
  async getCurrentUser(): Promise<MotionUser> {
    return this.request<MotionUser>('GET', '/users/me');
  }

  async getUser(userId: string): Promise<MotionUser> {
    return this.request<MotionUser>('GET', `/users/${userId}`);
  }

  async listUsers(workspaceId?: string): Promise<MotionUser[]> {
    const params = workspaceId ? { workspaceId } : undefined;
    const res = await this.request<MotionUser[] | { users: MotionUser[] }>(
      'GET',
      '/users',
      undefined,
      params
    );
    return Array.isArray(res) ? res : (res?.users ?? []);
  }

  // Schedule methods
  async getSchedule(params: {
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<MotionSchedule[]> {
    return this.request<MotionSchedule[]>('GET', '/schedules', undefined, params);
  }

  // Comment methods
  async listComments(taskId: string): Promise<MotionComment[]> {
    return this.request<MotionComment[]>('GET', '/comments', undefined, { taskId });
  }

  async createComment(params: MotionCommentCreateParams): Promise<MotionComment> {
    return this.request<MotionComment>('POST', '/comments', params);
  }

  async getComment(commentId: string): Promise<MotionComment> {
    return this.request<MotionComment>('GET', `/comments/${commentId}`);
  }

  async updateComment(commentId: string, content: string): Promise<MotionComment> {
    return this.request<MotionComment>('PATCH', `/comments/${commentId}`, { content });
  }

  async deleteComment(commentId: string): Promise<void> {
    return this.request<void>('DELETE', `/comments/${commentId}`);
  }

  // Custom field methods (Motion beta API)
  // Endpoints documented at:
  //   https://docs.usemotion.com/api-reference/custom-fields
  // Field definitions are workspace-scoped; values are scoped to a task or project.

  async listCustomFields(workspaceId: string): Promise<MotionCustomField[]> {
    return this.requestBeta<MotionCustomField[]>(
      'GET',
      `/workspaces/${workspaceId}/custom-fields`
    );
  }

  async createCustomField(params: {
    name: string;
    type: string;
    workspaceId: string;
    options?: Array<string | { value: string; color?: string }>;
    metadata?: Record<string, any>;
  }): Promise<MotionCustomField> {
    const { workspaceId, options, metadata, ...rest } = params;
    const body: Record<string, any> = { ...rest };
    if (metadata) body.metadata = { ...metadata };
    if (options && options.length > 0) {
      const palette = ['blue', 'green', 'orange', 'purple', 'pink', 'red', 'yellow', 'gray'];
      body.metadata = {
        ...body.metadata,
        options: options.map((opt, i) => {
          const fallbackColor = palette[i % palette.length];
          if (typeof opt === 'string') return { value: opt, color: fallbackColor };
          return { value: opt.value, color: opt.color ?? fallbackColor };
        }),
      };
    }
    return this.requestBeta<MotionCustomField>(
      'POST',
      `/workspaces/${workspaceId}/custom-fields`,
      body
    );
  }

  async deleteCustomField(workspaceId: string, customFieldId: string): Promise<void> {
    return this.requestBeta<void>(
      'DELETE',
      `/workspaces/${workspaceId}/custom-fields/${customFieldId}`
    );
  }

  async addCustomFieldToTask(
    taskId: string,
    customFieldInstanceId: string,
    value: { type: string; value: any }
  ): Promise<unknown> {
    return this.requestBeta<unknown>('POST', `/custom-field-values/task/${taskId}`, {
      customFieldInstanceId,
      value,
    });
  }

  async addCustomFieldToProject(
    projectId: string,
    customFieldInstanceId: string,
    value: { type: string; value: any }
  ): Promise<unknown> {
    return this.requestBeta<unknown>('POST', `/custom-field-values/project/${projectId}`, {
      customFieldInstanceId,
      value,
    });
  }

  async removeCustomFieldFromTask(taskId: string, valueId: string): Promise<void> {
    return this.requestBeta<void>(
      'DELETE',
      `/custom-field-values/task/${taskId}/custom-fields/${valueId}`
    );
  }

  async removeCustomFieldFromProject(projectId: string, valueId: string): Promise<void> {
    return this.requestBeta<void>(
      'DELETE',
      `/custom-field-values/project/${projectId}/custom-fields/${valueId}`
    );
  }

  // Recurring task methods
  async listRecurringTasks(workspaceId?: string): Promise<MotionRecurringTask[]> {
    const params = workspaceId ? { workspaceId } : undefined;
    return this.request<MotionRecurringTask[]>('GET', '/recurring-tasks', undefined, params);
  }

  async createRecurringTask(params: {
    name: string;
    workspaceId: string;
    frequency: string;
    recurrenceRule?: string;
    duration?: string | number;
    description?: string;
    projectId?: string;
    assigneeId?: string;
  }): Promise<MotionRecurringTask> {
    return this.request<MotionRecurringTask>('POST', '/recurring-tasks', params);
  }

  async getRecurringTask(recurringTaskId: string): Promise<MotionRecurringTask> {
    return this.request<MotionRecurringTask>('GET', `/recurring-tasks/${recurringTaskId}`);
  }

  async updateRecurringTask(
    recurringTaskId: string,
    params: Partial<MotionRecurringTask>
  ): Promise<MotionRecurringTask> {
    return this.request<MotionRecurringTask>(
      'PATCH',
      `/recurring-tasks/${recurringTaskId}`,
      params
    );
  }

  async deleteRecurringTask(recurringTaskId: string): Promise<void> {
    return this.request<void>('DELETE', `/recurring-tasks/${recurringTaskId}`);
  }

  // Status methods
  async getStatus(statusId: string): Promise<any> {
    return this.request<any>('GET', `/statuses/${statusId}`);
  }
}
