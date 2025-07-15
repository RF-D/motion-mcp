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
  MotionWorkSchedule,
  MotionCustomField,
  MotionRecurringTask,
  MotionStatus,
  MotionListResponse,
  MotionTaskCreateParams,
  MotionTaskUpdateParams,
  MotionProjectCreateParams,
  MotionCommentCreateParams,
} from '../types/motion.js';

export class MotionApiClient {
  private axios: AxiosInstance;
  private queue: PQueue;
  private retryDelay = 5000; // 5 seconds initial retry delay
  private maxRetries = 3;

  constructor(config: MotionConfig) {
    this.axios = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'X-API-Key': config.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    // Set up rate limiting queue with more conservative settings
    this.queue = new PQueue({
      concurrency: 1,
      interval: 60000, // 1 minute
      intervalCap: Math.floor(config.rateLimitPerMinute * 0.8), // Use 80% of limit for safety
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
      let lastError: any;
      
      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          const response = await this.axios.request<T>({
            method,
            url: path,
            data,
            params,
          });
          return response.data;
        } catch (error: any) {
          lastError = error;
          
          // Don't retry on client errors (4xx) except rate limits
          if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
            throw error;
          }
          
          // Retry on rate limit, network errors, or 5xx errors
          if (attempt < this.maxRetries - 1) {
            const delay = error.response?.status === 429 
              ? this.retryDelay * 2 // Double delay for rate limits
              : this.retryDelay * (attempt + 1); // Exponential backoff
              
            console.log(`Retrying request to ${path} after ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      throw lastError;
    }) as Promise<T>;
  }

  // Workspace methods
  async listWorkspaces(params?: {
    cursor?: string;
    ids?: string[];
  }): Promise<MotionListResponse<MotionWorkspace>> {
    const queryParams: any = {};
    if (params?.cursor) queryParams.cursor = params.cursor;
    if (params?.ids && params.ids.length > 0) {
      // The API expects a comma-separated string, not an array
      queryParams.ids = params.ids.join(',');
    }
    
    const response = await this.request<{ meta: any; workspaces: MotionWorkspace[] }>(
      'GET',
      '/workspaces',
      undefined,
      queryParams
    );
    return {
      meta: response.meta,
      workspaces: response.workspaces,
    };
  }

  async getWorkspace(workspaceId: string): Promise<MotionWorkspace> {
    // The API doesn't have a GET /workspaces/{id} endpoint
    // and the ids parameter seems broken, so we fetch all and filter
    const response = await this.listWorkspaces();
    const workspace = response.workspaces.find((w: MotionWorkspace) => w.id === workspaceId);
    if (!workspace) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }
    return workspace;
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

  async moveTask(taskId: string, params: { workspaceId: string; assigneeId?: string }): Promise<MotionTask> {
    return this.request<MotionTask>('PATCH', `/tasks/${taskId}/move`, params);
  }

  async unassignTask(taskId: string): Promise<MotionTask> {
    return this.request<MotionTask>('DELETE', `/tasks/${taskId}/assignee`);
  }

  // Project methods
  async listProjects(workspaceId: string): Promise<MotionProject[]> {
    const response = await this.request<{ projects: MotionProject[] }>(
      'GET',
      '/projects',
      undefined,
      { workspaceId }
    );
    return response.projects || [];
  }

  async getProject(projectId: string): Promise<MotionProject> {
    return this.request<MotionProject>('GET', `/projects/${projectId}`);
  }

  async createProject(params: MotionProjectCreateParams): Promise<MotionProject> {
    return this.request<MotionProject>('POST', '/projects', params);
  }

  // Note: Motion API doesn't support project deletion
  // async deleteProject(projectId: string): Promise<void> {
  //   return this.request<void>('DELETE', `/projects/${projectId}`);
  // }

  // User methods
  async getCurrentUser(): Promise<MotionUser> {
    return this.request<MotionUser>('GET', '/users/me');
  }

  async getUser(userId: string): Promise<MotionUser> {
    return this.request<MotionUser>('GET', `/users/${userId}`);
  }

  async listUsers(workspaceId: string): Promise<MotionUser[]> {
    const response = await this.request<{ users: MotionUser[] }>(
      'GET',
      '/users',
      undefined,
      { workspaceId }
    );
    return response.users || [];
  }

  // Schedule methods
  async getSchedule(params: {
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<MotionSchedule[]> {
    return this.request<MotionSchedule[]>('GET', '/schedules', undefined, params);
  }

  async getWorkSchedules(): Promise<MotionWorkSchedule[]> {
    return this.request<MotionWorkSchedule[]>('GET', '/schedules');
  }

  // Comment methods
  async listComments(taskId: string, cursor?: string): Promise<MotionListResponse<MotionComment>> {
    const params: any = { taskId };
    if (cursor) params.cursor = cursor;
    const response = await this.request<{ meta: any; comments: MotionComment[] }>(
      'GET',
      '/comments',
      undefined,
      params
    );
    return {
      meta: response.meta,
      comments: response.comments,
    };
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
  async listCustomFields(workspaceId: string): Promise<MotionCustomField[]> {
    return this.request<MotionCustomField[]>('GET', `/beta/workspaces/${workspaceId}/custom-fields`);
  }

  async createCustomField(params: {
    name: string;
    type: string;
    workspaceId: string;
    metadata?: any;
  }): Promise<MotionCustomField> {
    const { workspaceId, ...body } = params;
    return this.request<MotionCustomField>('POST', `/beta/workspaces/${workspaceId}/custom-fields`, body);
  }

  async addCustomFieldToTask(taskId: string, customFieldInstanceId: string, value: any): Promise<void> {
    return this.request<void>('POST', `/beta/custom-field-values/task/${taskId}`, {
      customFieldInstanceId,
      value,
    });
  }

  async addCustomFieldToProject(
    projectId: string,
    customFieldInstanceId: string,
    value: any
  ): Promise<void> {
    return this.request<void>('POST', `/beta/custom-field-values/project/${projectId}`, {
      customFieldInstanceId,
      value,
    });
  }

  async removeCustomFieldFromTask(taskId: string, valueId: string): Promise<void> {
    return this.request<void>('DELETE', `/beta/custom-field-values/task/${taskId}/custom-fields/${valueId}`);
  }

  async deleteCustomField(workspaceId: string, customFieldId: string): Promise<void> {
    return this.request<void>('DELETE', `/beta/workspaces/${workspaceId}/custom-fields/${customFieldId}`);
  }

  async removeCustomFieldFromProject(projectId: string, valueId: string): Promise<void> {
    return this.request<void>('DELETE', `/beta/custom-field-values/project/${projectId}/custom-fields/${valueId}`);
  }

  // Recurring task methods
  async listRecurringTasks(params?: { 
    workspaceId?: string; 
    cursor?: string; 
  }): Promise<MotionListResponse<MotionRecurringTask>> {
    const response = await this.request<{ meta: any; recurringTasks: MotionRecurringTask[] }>(
      'GET',
      '/recurring-tasks',
      undefined,
      params
    );
    return {
      meta: response.meta,
      recurringTasks: response.recurringTasks,
    };
  }

  async createRecurringTask(params: {
    name: string;
    workspaceId: string;
    frequency: string;
    recurrenceRule?: string;
    duration?: string | number;
    description?: string;
    projectId?: string;
    assigneeId: string;
    deadlineType?: 'HARD' | 'SOFT';
    startingOn?: string;
    idealTime?: string;
    schedule?: string;
    priority?: 'HIGH' | 'MEDIUM';
    labels?: string[];
  }): Promise<MotionRecurringTask> {
    return this.request<MotionRecurringTask>('POST', '/recurring-tasks', params);
  }

  async getRecurringTask(recurringTaskId: string): Promise<MotionRecurringTask> {
    return this.request<MotionRecurringTask>('GET', `/recurring-tasks/${recurringTaskId}`);
  }


  async deleteRecurringTask(recurringTaskId: string): Promise<void> {
    return this.request<void>('DELETE', `/recurring-tasks/${recurringTaskId}`);
  }

  // Status methods
  async listStatuses(workspaceId?: string): Promise<MotionStatus[]> {
    const params = workspaceId ? { workspaceId } : undefined;
    return this.request<MotionStatus[]>('GET', '/statuses', undefined, params);
  }
}
