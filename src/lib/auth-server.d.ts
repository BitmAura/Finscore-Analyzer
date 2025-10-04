export interface ServerAuth {
  user: {
    id: string;
  };
}

export function getServerAuth(request: any): Promise<ServerAuth>;
export function getUserId(session: ServerAuth): string | null;
