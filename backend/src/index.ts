import { createApp } from './app';
import { waitForDatabase } from './infrastructure/database/mysql-connection';

async function bootstrap(): Promise<void> {
  await waitForDatabase();

  const app = createApp();
  const port = Number(process.env.PORT ?? 3000);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend executando na porta ${port}`);
  });
}

void bootstrap();