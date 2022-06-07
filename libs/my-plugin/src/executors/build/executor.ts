import { BuildExecutorSchema } from './schema';

export default async function (options: BuildExecutorSchema) {
  console.log('Executor ran for Build', options);
  return {
    success: true,
  };
}
