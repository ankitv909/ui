import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import {
  getApplication,
  listApplications,
  listEnvironments,
  listWorkspaces,
} from "@/lib/services/platform";
import type {
  Application,
  ApplicationListResponse,
  EnvironmentListResponse,
  WorkspaceListResponse,
} from "@/lib/types/platform";

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);

describe("platform read client", () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it("lists workspaces with cursor pagination", async () => {
    const data: WorkspaceListResponse = {
      items: [
        {
          id: "workspace-1",
          name: "Platform",
          description: "Production workspace",
          role: "owner",
          createdAt: "2026-09-01T10:00:00Z",
          updatedAt: "2026-09-02T10:00:00Z",
        },
      ],
      pageInfo: {
        nextCursor: "workspace-cursor-2",
        hasMore: true,
      },
    };
    mockedGet.mockResolvedValueOnce({ data } as never);

    await expect(
      listWorkspaces({ cursor: "workspace-cursor-1", limit: 25 })
    ).resolves.toEqual(data);

    expect(mockedGet).toHaveBeenCalledWith("/workspaces", {
      params: {
        cursor: "workspace-cursor-1",
        limit: 25,
      },
    });
  });

  it("omits pagination query parameters that are not supplied", async () => {
    const data: WorkspaceListResponse = {
      items: [],
      pageInfo: {
        nextCursor: null,
        hasMore: false,
      },
    };
    mockedGet.mockResolvedValueOnce({ data } as never);

    await listWorkspaces();

    expect(mockedGet).toHaveBeenCalledWith("/workspaces", {
      params: {},
    });
  });

  it("lists workspace environments using the supplied workspace id", async () => {
    const data: EnvironmentListResponse = {
      items: [
        {
          id: "environment-1",
          workspaceId: "workspace-1",
          name: "Production",
          createdAt: "2026-09-01T10:00:00Z",
          updatedAt: "2026-09-02T10:00:00Z",
        },
      ],
      pageInfo: {
        nextCursor: null,
        hasMore: false,
      },
    };
    mockedGet.mockResolvedValueOnce({ data } as never);

    await expect(
      listEnvironments("workspace-1", { limit: 10 })
    ).resolves.toEqual(data);

    expect(mockedGet).toHaveBeenCalledWith(
      "/workspaces/workspace-1/environments",
      {
        params: {
          limit: 10,
        },
      }
    );
  });

  it("serializes application filters only when they are supplied", async () => {
    const data: ApplicationListResponse = {
      items: [],
      pageInfo: {
        nextCursor: null,
        hasMore: false,
      },
    };
    mockedGet.mockResolvedValueOnce({ data } as never);

    await listApplications("workspace-1", {
      cursor: "application-cursor",
      limit: 50,
      environmentId: "environment-1",
      includeArchived: false,
    });

    expect(mockedGet).toHaveBeenCalledWith(
      "/workspaces/workspace-1/applications",
      {
        params: {
          cursor: "application-cursor",
          limit: 50,
          environmentId: "environment-1",
          includeArchived: false,
        },
      }
    );

    mockedGet.mockResolvedValueOnce({ data } as never);

    await listApplications("workspace-1");

    expect(mockedGet).toHaveBeenLastCalledWith(
      "/workspaces/workspace-1/applications",
      {
        params: {},
      }
    );
  });

  it("gets one application and returns the Core response shape unchanged", async () => {
    const data: Application = {
      id: "application-1",
      workspaceId: "workspace-1",
      environmentId: "environment-1",
      name: "checkout-api",
      description: "Checkout service",
      desiredState: {
        image: "example/checkout:v1",
        replicas: 3,
      },
      status: "draft",
      createdAt: "2026-09-01T10:00:00Z",
      updatedAt: "2026-09-02T10:00:00Z",
    };
    mockedGet.mockResolvedValueOnce({ data } as never);

    await expect(
      getApplication("workspace-1", "application-1")
    ).resolves.toEqual(data);

    expect(mockedGet).toHaveBeenCalledWith(
      "/workspaces/workspace-1/applications/application-1"
    );
  });

  it("lets shared-client request failures reject to the caller", async () => {
    const error = new Error("request failed");
    mockedGet.mockRejectedValueOnce(error);

    await expect(listWorkspaces()).rejects.toBe(error);
  });
});
