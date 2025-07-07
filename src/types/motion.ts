export interface MotionConfig {
  apiKey: string;
  baseUrl: string;
  rateLimitPerMinute: number;
}

export interface MotionTask {
  id: string;
  name: string;
  description: string;
  duration: string | number;
  dueDate?: string;
  deadlineType: 'HARD' | 'SOFT' | 'NONE';
  parentRecurringTaskId?: string;
  completed: boolean;
  completedTime?: string;
  updatedTime?: string;
  startOn?: string;
  creator: {
    id?: string;
    name?: string;
    email?: string;
  };
  project?: MotionProject;
  workspace: MotionWorkspace;
  status: MotionStatus;
  priority: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
  labels: Array<{ name: string }>;
  assignees: Array<{
    id: string;
    name?: string;
    email: string;
  }>;
  scheduledStart?: string;
  createdTime: string;
  scheduledEnd?: string;
  schedulingIssue: boolean;
  lastInteractedTime?: string;
  customFieldValues?: Record<string, MotionCustomFieldValue>;
  chunks?: Array<{
    id: string;
    duration: number;
    scheduledStart: string;
    scheduledEnd: string;
    completedTime?: string;
    isFixed: boolean;
  }>;
}

export interface MotionProject {
  id: string;
  name: string;
  description: string;
  workspaceId: string;
  status?: MotionStatus;
  createdTime?: string;
  updatedTime?: string;
  customFieldValues?: Record<string, MotionCustomFieldValue>;
}

export interface MotionWorkspace {
  id: string;
  name: string;
  teamId: string;
  type: 'TEAM' | 'INDIVIDUAL';
  labels: Array<{ name: string }>;
  statuses: MotionStatus[];
}

export interface MotionStatus {
  name: string;
  isDefaultStatus?: boolean;
  isResolvedStatus?: boolean;
}

export interface MotionUser {
  id: string;
  name?: string;
  email: string;
}

export interface MotionComment {
  id: string;
  taskId: string;
  content: string;
  creator: MotionUser;
  createdTime: string;
  updatedTime?: string;
}

export interface MotionSchedule {
  userId: string;
  date: string;
  tasks: MotionTask[];
}

export interface MotionCustomField {
  id: string;
  name: string;
  type:
    | 'text'
    | 'number'
    | 'url'
    | 'date'
    | 'select'
    | 'multiSelect'
    | 'person'
    | 'multiPerson'
    | 'email'
    | 'phone'
    | 'checkbox'
    | 'relatedTo';
  options?: string[]; // For select/multiSelect types
  workspaceId: string;
}

export type MotionCustomFieldValue =
  | { type: 'text'; value: string | null }
  | { type: 'number'; value: number | null }
  | { type: 'url'; value: string | null }
  | { type: 'date'; value: string | null }
  | { type: 'select'; value: string | null }
  | { type: 'multiSelect'; value: string[] | null }
  | { type: 'person'; value: MotionUser | null }
  | { type: 'multiPerson'; value: MotionUser[] | null }
  | { type: 'email'; value: string | null }
  | { type: 'phone'; value: string | null }
  | { type: 'checkbox'; value: boolean | null }
  | { type: 'relatedTo'; value: string | null };

export interface MotionRecurringTask {
  id: string;
  name: string;
  description?: string;
  duration: string | number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  recurrenceRule: string;
  workspaceId: string;
  projectId?: string;
  assigneeId?: string;
}

export interface MotionListResponse<T> {
  meta: {
    nextCursor?: string;
    pageSize: number;
  };
  [key: string]: T[] | any;
}

export interface MotionTaskCreateParams {
  name: string;
  workspaceId: string;
  dueDate?: string;
  duration?: string | number;
  status?: string;
  autoScheduled?: {
    startDate: string;
    deadlineType?: 'HARD' | 'SOFT' | 'NONE';
    schedule?: string;
  } | null;
  projectId?: string;
  description?: string;
  priority?: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
  labels?: string[];
  assigneeId?: string;
}

export interface MotionTaskUpdateParams {
  name?: string;
  dueDate?: string;
  duration?: string | number;
  status?: string;
  priority?: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
  description?: string;
  completed?: boolean;
  assigneeId?: string;
  labels?: string[];
}

export interface MotionProjectCreateParams {
  name: string;
  workspaceId: string;
  description?: string;
  status?: string;
}

export interface MotionCommentCreateParams {
  taskId: string;
  content: string;
}
