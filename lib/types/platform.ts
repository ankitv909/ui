export type MembershipRole = "owner" | "admin" | "member";

export interface PageInfo {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  role: MembershipRole;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceListResponse {
  items: Workspace[];
  pageInfo: PageInfo;
}

export interface Environment {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentListResponse {
  items: Environment[];
  pageInfo: PageInfo;
}

export type ApplicationStatus = "draft" | "archived";

export interface Application {
  id: string;
  workspaceId: string;
  environmentId: string;
  name: string;
  description?: string;
  desiredState: Record<string, unknown>;
  status: ApplicationStatus;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationListResponse {
  items: Application[];
  pageInfo: PageInfo;
}

export interface PaginationQuery {
  cursor?: string;
  limit?: number;
}

export interface ApplicationListQuery extends PaginationQuery {
  environmentId?: string;
  includeArchived?: boolean;
}
