import { Route } from "@playwright/test";

export const API_BASE_URL = "http://localhost:3333";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type,authorization",
  "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
};

export async function allowCors(route: Route) {
  await route.fulfill({
    status: 204,
    headers: corsHeaders,
  });
}

export async function fulfillJson(
  route: Route,
  body: unknown,
  status = 200
) {
  await route.fulfill({
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
