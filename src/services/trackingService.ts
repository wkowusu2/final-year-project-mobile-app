import { GPS_BATCH_SIZE } from '@/src/constants/api';
import { api } from '@/src/services/api';
import { storageService } from '@/src/services/storageService';
import { DriverProfile } from '@/src/types/driver';
import { GpsPoint } from '@/src/types/tracking';

export async function syncPendingPoints(driver: DriverProfile, online: boolean) {
  if (!online) {
    return { synced: 0, remaining: (await storageService.getPendingPoints()).length };
  }

  const pending = await storageService.getPendingPoints();
  let synced = 0;
  let remaining = pending;

  for (let index = 0; index < pending.length; index += GPS_BATCH_SIZE) {
    const batch = pending.slice(index, index + GPS_BATCH_SIZE);
    const sessionId = batch[0]?.sessionId;

    if (!sessionId) {
      continue;
    }

    await api.sendGpsBatch(driver.driverId, sessionId, batch);
    const ids = batch.map((point) => point.id);
    remaining = remaining.filter((point) => !ids.includes(point.id));
    await storageService.savePendingPoints(remaining);
    synced += batch.length;
    await storageService.saveLastSyncAt(new Date().toISOString());
  }

  return { synced, remaining: remaining.length };
}

export async function storeOrSyncBatch(driver: DriverProfile, online: boolean, points: GpsPoint[]) {
  if (!online) {
    await storageService.appendPendingPoints(points);
    return { synced: 0 };
  }

  try {
    await api.sendGpsBatch(driver.driverId, points[0].sessionId, points);
    await storageService.saveLastSyncAt(new Date().toISOString());
    return { synced: points.length };
  } catch {
    await storageService.appendPendingPoints(points);
    return { synced: 0 };
  }
}
