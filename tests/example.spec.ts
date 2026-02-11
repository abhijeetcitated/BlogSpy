import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
    await page.goto("/");
    console.log(`Current URL: ${page.url()}`);
    console.log(`Page Title: ${await page.title()}`);

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/BlogSpy/);
});

test("dashboard redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    await expect(page).toHaveURL(/redirect=\/dashboard|redirect=%2Fdashboard/);
});

test("auth callback does not trust external next targets", async ({ page }) => {
    await page.goto("/auth/callback?code=invalid&next=https://evil.example");
    await expect(page).toHaveURL(/\/error$/);
});
