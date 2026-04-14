import { MongoClient } from "mongodb";

let client: MongoClient | null = null;

export type MongoConnectionOptions = {
  uri: string;
};

export function getMongoClient({ uri }: MongoConnectionOptions) {
  if (!client) {
    client = new MongoClient(uri);
  }

  return client;
}

export async function pingMongo({ uri }: MongoConnectionOptions) {
  const mongo = getMongoClient({ uri });
  await mongo.connect();
  await mongo.db("admin").command({ ping: 1 });

  return { ok: true } as const;
}

export async function closeMongo() {
  if (!client) return;
  await client.close();
  client = null;
}
