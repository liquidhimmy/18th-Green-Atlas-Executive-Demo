# Atlas FRM — Demo Access

No authentication. This is a functional reference demo with a **role/lens selector**, not login.

- Landing page `/` (Three-Lens Workflow): click a lens card to enter.
  - `data-testid="enter-fiduciary"` → Fiduciary lens (`/fiduciary`)
  - `data-testid="enter-beneficiary"` → Beneficiary lens (`/beneficiary`)
  - `data-testid="enter-oversight"` → Oversight lens (`/oversight`)
- Lens switcher available in the left sidebar of every lens.
- Demo can be reset any time via the "Reset" button in the top bar (`data-testid="reset-demo-btn"`) or `POST /api/reset`.

Demo personas (display only, no passwords):
- Fiduciary Officer: James Morgan
- Beneficiary: Sarah Harrington
- Oversight Supervisor: Patricia Vance
