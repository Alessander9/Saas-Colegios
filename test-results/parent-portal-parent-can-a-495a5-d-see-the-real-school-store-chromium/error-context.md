# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: parent-portal.spec.ts >> parent can authenticate and see the real school store
- Location: e2e\browser\parent-portal.spec.ts:3:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3003/
Call log:
  - navigating to "http://127.0.0.1:3003/", waiting until "load"

```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test('parent can authenticate and see the real school store', async ({ page }) => {
> 4  |   await page.goto('/');
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3003/
  5  |   await page.getByLabel('Correo').fill('padre.garcia@email.com');
  6  |   await page.getByLabel('Contraseña').fill('Cole2026!');
  7  |   await page.getByRole('button', { name: 'Ingresar' }).click();
  8  | 
  9  |   await expect(page.getByRole('heading', { name: 'Portal de Padres' })).toBeVisible();
  10 |   await page.getByRole('button', { name: /Tienda Escolar/ }).click();
  11 |   await expect(page.getByText('Tienda Virtual del Colegio San José')).toBeVisible();
  12 |   await expect(page.getByText('Mis pedidos')).toBeVisible();
  13 | });
  14 | 
```