import mongoose from 'mongoose';
import dns from 'node:dns';
import { Resolver } from 'node:dns/promises';

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/bluewhale';
const DEFAULT_DATABASE_NAME = 'bluewhale';
const DEFAULT_MONGO_DNS_SERVERS = ['8.8.8.8', '1.1.1.1'];

const ensureMongoSrvResolvable = async (uri) => {
  if (!uri.startsWith('mongodb+srv://')) return;

  const hostname = new URL(uri).hostname;
  const srvRecord = `_mongodb._tcp.${hostname}`;

  try {
    await dns.promises.resolveSrv(srvRecord);
  } catch (systemDnsError) {
    const configuredServers = process.env.MONGO_DNS_SERVERS
      ?.split(',')
      .map((server) => server.trim())
      .filter(Boolean);
    const fallbackServers = configuredServers?.length
      ? configuredServers
      : DEFAULT_MONGO_DNS_SERVERS;
    const resolver = new Resolver();
    resolver.setServers(fallbackServers);

    try {
      await resolver.resolveSrv(srvRecord);
    } catch (fallbackDnsError) {
      throw new Error(
        `MongoDB SRV lookup failed with system DNS (${systemDnsError.code || systemDnsError.name}) and fallback DNS (${fallbackDnsError.code || fallbackDnsError.name}).`,
      );
    }

    dns.setServers(fallbackServers);
    console.warn(
      `System DNS could not resolve MongoDB Atlas; using fallback DNS servers ${fallbackServers.join(', ')}. Set MONGO_DNS_SERVERS to override.`,
    );
  }
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI?.trim() || DEFAULT_MONGO_URI;
  const databaseName =
    process.env.MONGO_DB_NAME?.trim() ||
    decodeURIComponent(new URL(uri).pathname.slice(1).split('/')[0] || DEFAULT_DATABASE_NAME);

  try {
    await ensureMongoSrvResolvable(uri);
    await mongoose.connect(uri, { dbName: databaseName });
    console.log(`MongoDB connected successfully to "${databaseName}"`);
  } catch (error) {
    const message = String(error?.message || error).replace(
      /mongodb(?:\+srv)?:\/\/\S+/gi,
      '[redacted MongoDB URI]',
    );
    console.error(`MongoDB connection failed for "${databaseName}":`, message);
    throw new Error(
      `MongoDB connection failed for "${databaseName}". Check the URI, database access, and network allowlist.`,
    );
  }
};

export default connectDB;
