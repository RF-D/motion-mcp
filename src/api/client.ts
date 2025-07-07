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

  // Workspace methods
  async listWorkspaces(): Promise<MotionWorkspace[]> {
    return this.request<MotionWorkspace[]>('GET', '/workspaces');
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
    return this.request<MotionProject[]>('GET', '/projects', undefined, params);
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
    return this.request<MotionUser[]>('GET', '/users', undefined, params);
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

  // Custom field methods
  async listCustomFields(workspaceId?: string): Promise<MotionCustomField[]> {
    const params = workspaceId ? { workspaceId } : undefined;
    return this.request<MotionCustomField[]>('GET', '/custom-fields', undefined, params);
  }

  async createCustomField(params: {
    name: string;
    type: string;
    workspaceId: string;
    options?: string[];
  }): Promise<MotionCustomField> {
    return this.request<MotionCustomField>('POST', '/custom-fields', params);
  }

  async addCustomFieldToTask(taskId: string, customFieldId: string, value: any): Promise<void> {
    return this.request<void>('POST', '/custom-fields/add-to-task', {
      taskId,
      customFieldId,
      value,
    });
  }

  async addCustomFieldToProject(
    projectId: string,
    customFieldId: string,
    value: any
  ): Promise<void> {
    return this.request<void>('POST', '/custom-fields/add-to-project', {
      projectId,
      customFieldId,
      value,
    });
  }

  async removeCustomFieldFromTask(taskId: string, customFieldId: string): Promise<void> {
    return this.request<void>('DELETE', '/custom-fields/delete-from-task', {
      taskId,
      customFieldId,
    });
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
