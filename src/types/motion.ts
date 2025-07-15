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
  teamId: string | null;
  type: 'TEAM' | 'INDIVIDUAL';
  labels: Array<{ name: string }>;
  taskStatuses: MotionStatus[];
  users?: MotionUser[];
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

export interface MotionWorkSchedule {
  name: string;
  isDefaultTimezone: boolean;
  timezone: string;
  schedule: {
    monday: Array<{ start: string; end: string }>;
    tuesday: Array<{ start: string; end: string }>;
    wednesday: Array<{ start: string; end: string }>;
    thursday: Array<{ start: string; end: string }>;
    friday: Array<{ start: string; end: string }>;
    saturday: Array<{ start: string; end: string }>;
    sunday: Array<{ start: string; end: string }>;
  };
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
  workspaceId: string;
  metadata?: {
    format?: 'plain' | 'formatted' | 'percent';
    options?: Array<{
      id: string;
      value: string;
      color?: string;
    }>;
    toggle?: boolean;
  };
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
  frequency: string; // e.g., 'DAILY', 'WEEKLY_MONDAY', 'MONTHLY_1', 'MONTHLY_LAST'
  recurrenceRule?: string;
  workspaceId: string;
  projectId?: string;
  assigneeId?: string;
  creator?: MotionUser;
  assignee?: MotionUser;
  project?: MotionProject;
  workspace?: MotionWorkspace;
  status?: MotionStatus;
  priority?: 'HIGH' | 'MEDIUM';
  labels?: Array<{ name: string }>;
  deadlineType?: 'HARD' | 'SOFT';
  startingOn?: string;
  idealTime?: string;
  schedule?: string;
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
  customFieldValues?: Record<string, MotionCustomFieldValue>;
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
  workspaceId?: string;
  autoScheduled?: {
    startDate: string;
    deadlineType?: 'HARD' | 'SOFT' | 'NONE';
    schedule?: string;
  } | null;
  projectId?: string;
  customFieldValues?: Record<string, MotionCustomFieldValue>;
}

export interface MotionProjectCreateParams {
  name: string;
  workspaceId: string;
  description?: string;
  status?: string;
  customFieldValues?: Record<string, MotionCustomFieldValue>;
}

export interface MotionCommentCreateParams {
  taskId: string;
  content: string;
}
