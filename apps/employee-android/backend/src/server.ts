import { app } from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[WorkLedger API] Centralized Shared Backend listening on port ${PORT}`);
  console.log(`[WorkLedger API] Health endpoint available at http://localhost:${PORT}/api/v1/health`);
});
