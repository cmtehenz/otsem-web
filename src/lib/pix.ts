import http from "./http";
import type { AxiosResponse } from "axios";

/**
 * Make a POST request to the generic /pix/ endpoint.
 *
 * The backend's BankingGatewayService reads the active bank provider from the
 * database and routes to Inter or FDBank accordingly — no client-side bank
 * resolution needed.
 *
 * Example: pixPost("cobrancas", data)  →  POST /pix/cobrancas
 */
export async function pixPost<T = unknown>(
  path: string,
  data?: unknown,
): Promise<AxiosResponse<T>> {
  return http.post<T>(`/pix/${path}`, data);
}
