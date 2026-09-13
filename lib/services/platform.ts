import api from "@/lib/api";
import type {
  Application,
  ApplicationListQuery,
  ApplicationListResponse,
  EnvironmentListResponse,
  PaginationQuery,
  WorkspaceListResponse,
} from "@/lib/types/platform";

function paginationParams(query: PaginationQuery) {
  return {
    ...(query.cursor !== undefined ? { cursor: query.cursor } : {}),
    ...(query.limit !== undefined ? { limit: query.limit } : {}),
  };
}

export async function listWorkspaces(
  query: PaginationQuery = {}
): Promise<WorkspaceListResponse> {
  const response = await api.get<WorkspaceListResponse>("/workspaces", {
    params: paginationParams(query),
  });
  return response.data;
}

export async function listEnvironments(
  workspaceId: string,
  query: PaginationQuery = {}
): Promise<EnvironmentListResponse> {
  const response = await api.get<EnvironmentListResponse>(
    `/workspaces/${workspaceId}/environments`,
    { params: paginationParams(query) }
  );
  return response.data;
}

export async function listApplications(
  workspaceId: string,
  query: ApplicationListQuery = {}
): Promise<ApplicationListResponse> {
  const response = await api.get<ApplicationListResponse>(
    `/workspaces/${workspaceId}/applications`,
    {
      params: {
        ...paginationParams(query),
        ...(query.environmentId !== undefined
          ? { environmentId: query.environmentId }
          : {}),
        ...(query.includeArchived !== undefined
          ? { includeArchived: query.includeArchived }
          : {}),
      },
    }
  );
  return response.data;
}

export async function getApplication(
  workspaceId: string,
  applicationId: string
): Promise<Application> {
  const response = await api.get<Application>(
    `/workspaces/${workspaceId}/applications/${applicationId}`
  );
  return response.data;
}
