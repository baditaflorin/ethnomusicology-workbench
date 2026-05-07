import { expect, test } from "@playwright/test";

test("loads the workbench and generates a demo corpus", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Ethnomusicology Workbench" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Star on GitHub/ })).toHaveAttribute(
    "href",
    "https://github.com/baditaflorin/ethnomusicology-workbench"
  );
  await expect(page.getByText(/v0\.1\.0/)).toBeVisible();

  await page.getByTestId("demo-corpus").click();
  await expect(page.getByRole("heading", { name: "Demo - mountain flute mode" })).toBeVisible({
    timeout: 15000
  });
  await expect(page.getByTestId("corpus-panel")).toContainText("3 recordings");

  await page.getByRole("tab", { name: "Map" }).click();
  await expect(page.getByTestId("corpus-map")).toBeVisible();

  await page.getByRole("tab", { name: "Score" }).click();
  await expect(page.getByText(/MusicXML and LilyPond-ready/)).toBeVisible();
});
