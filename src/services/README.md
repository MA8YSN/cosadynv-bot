# services/

Business logic lives here — the layer between commands/buttons and the
database. Example future files: `verificationService.ts`,
`giveawayService.ts`, `citizenIdService.ts`, `contributionService.ts`.

Commands/buttons/modals should stay thin (parse input, call a service,
reply). Services should stay Discord-agnostic where possible (avoid
passing raw `interaction` objects in) so the logic is testable and
reusable across multiple entry points — e.g. a slash command AND a future
dashboard API route calling the same service function.
