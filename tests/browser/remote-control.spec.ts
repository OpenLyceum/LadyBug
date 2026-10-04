import { expect, test } from "@playwright/test";

test("keyboard control on the remote pad starts recording motion", async ({ page }) => {
  await page.goto("/?ea");
  await expect(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
  const pad = page.locator('div[tabindex="0"]').filter({ hasText: /^Remote Control$/ });
  await pad.focus();
  await expect(pad).toBeFocused();
  await pad.press("ArrowRight");
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
});
