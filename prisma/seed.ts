import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding disaster response database...');

  // --- Agency ---
  const ndrf = await prisma.agency.create({
    data: {
      name: 'NDRF Battalion 5 - Mumbai',
      contactInfo: '+91-22-2694-0000',
      jurisdictionBoundary: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[72.85, 19.05], [72.95, 19.05], [72.95, 19.10], [72.85, 19.10], [72.85, 19.05]]],
      }),
    },
  });

  const bmc = await prisma.agency.create({
    data: {
      name: 'BMC Disaster Management Cell',
      contactInfo: '+91-22-2266-0000',
      jurisdictionBoundary: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[72.84, 19.04], [72.96, 19.04], [72.96, 19.11], [72.84, 19.11], [72.84, 19.04]]],
      }),
    },
  });

  // --- Users ---
  await prisma.user.createMany({
    data: [
      { agencyId: ndrf.id, username: 'ndrf_cmd_01', passwordHash: '$2b$10$placeholder_hash_ndrf', role: 'ADMIN' },
      { agencyId: ndrf.id, username: 'ndrf_dispatch_01', passwordHash: '$2b$10$placeholder_hash_dispatch', role: 'DISPATCHER' },
      { agencyId: bmc.id, username: 'bmc_manager_01', passwordHash: '$2b$10$placeholder_hash_bmc', role: 'MANAGER' },
    ],
  });

  // --- Equipment Types ---
  const winch = await prisma.equipmentType.create({ data: { name: 'WINCH', description: 'Heavy-duty rescue winch (5-ton capacity)' } });
  const raft = await prisma.equipmentType.create({ data: { name: 'INFLATABLE_RAFT', description: 'Rapid-deploy inflatable rescue raft (8 person)' } });
  const medKit = await prisma.equipmentType.create({ data: { name: 'MEDICAL_KIT', description: 'Advanced trauma medical kit with AED' } });
  const pump = await prisma.equipmentType.create({ data: { name: 'WATER_PUMP', description: 'Portable high-flow dewatering pump' } });

  // --- Road Segments (Mumbai Vidyavihar/Kurla region) ---
  const roads = await Promise.all([
    prisma.roadSegment.create({
      data: {
        name: 'LBS Marg - Kurla Segment',
        classification: 'ARTERIAL',
        geometry: JSON.stringify({
          type: 'LineString',
          coordinates: [[72.8796, 19.0726], [72.8830, 19.0740], [72.8870, 19.0760], [72.8910, 19.0785], [72.8950, 19.0800]],
        }),
        defaultSpeedKmh: 40,
        maxWeightKg: 15000,
        maxHeightM: 4.5,
      },
    }),
    prisma.roadSegment.create({
      data: {
        name: 'Eastern Express Highway - North',
        classification: 'HIGHWAY',
        geometry: JSON.stringify({
          type: 'LineString',
          coordinates: [[72.8580, 19.0650], [72.8600, 19.0700], [72.8620, 19.0750], [72.8640, 19.0800], [72.8660, 19.0850]],
        }),
        defaultSpeedKmh: 80,
        maxWeightKg: 25000,
        maxHeightM: 5.0,
      },
    }),
    prisma.roadSegment.create({
      data: {
        name: 'CST Road - Kurla West',
        classification: 'ARTERIAL',
        geometry: JSON.stringify({
          type: 'LineString',
          coordinates: [[72.8700, 19.0700], [72.8730, 19.0710], [72.8760, 19.0720], [72.8800, 19.0730]],
        }),
        defaultSpeedKmh: 35,
        maxWeightKg: 12000,
        maxHeightM: 4.0,
      },
    }),
    prisma.roadSegment.create({
      data: {
        name: 'Somaiya Vidyavihar Road',
        classification: 'LOCAL',
        geometry: JSON.stringify({
          type: 'LineString',
          coordinates: [[72.8980, 19.0730], [72.8990, 19.0740], [72.9000, 19.0755], [72.9010, 19.0770]],
        }),
        defaultSpeedKmh: 25,
        maxWeightKg: 8000,
        maxHeightM: 3.5,
      },
    }),
    prisma.roadSegment.create({
      data: {
        name: 'Andheri-Kurla Road',
        classification: 'ARTERIAL',
        geometry: JSON.stringify({
          type: 'LineString',
          coordinates: [[72.8500, 19.0800], [72.8550, 19.0790], [72.8600, 19.0780], [72.8650, 19.0770], [72.8700, 19.0760]],
        }),
        defaultSpeedKmh: 35,
        maxWeightKg: 12000,
        maxHeightM: 4.0,
      },
    }),
    prisma.roadSegment.create({
      data: {
        name: 'Mithi River Bridge Connector',
        classification: 'LOCAL',
        geometry: JSON.stringify({
          type: 'LineString',
          coordinates: [[72.8640, 19.0720], [72.8660, 19.0730], [72.8680, 19.0740]],
        }),
        defaultSpeedKmh: 20,
        maxWeightKg: 10000,
        maxHeightM: 3.5,
      },
    }),
    prisma.roadSegment.create({
      data: {
        name: 'Ghatkopar Link Road',
        classification: 'ARTERIAL',
        geometry: JSON.stringify({
          type: 'LineString',
          coordinates: [[72.9100, 19.0770], [72.9080, 19.0760], [72.9060, 19.0750], [72.9040, 19.0740], [72.9020, 19.0730]],
        }),
        defaultSpeedKmh: 30,
        maxWeightKg: 10000,
        maxHeightM: 4.0,
      },
    }),
    prisma.roadSegment.create({
      data: {
        name: 'Sion-Panvel Highway Ramp',
        classification: 'HIGHWAY',
        geometry: JSON.stringify({
          type: 'LineString',
          coordinates: [[72.8700, 19.0600], [72.8750, 19.0620], [72.8800, 19.0640], [72.8850, 19.0660], [72.8900, 19.0680]],
        }),
        defaultSpeedKmh: 60,
        maxWeightKg: 20000,
        maxHeightM: 5.0,
      },
    }),
  ]);

  // --- Road States ---
  await Promise.all([
    // LBS Marg - currently FLOODED
    prisma.roadState.create({
      data: { segmentId: roads[0].id, status: 'CLOSED_FLOODING', currentSpeedKmh: 0, floodDepthMm: 850, updatedBySource: 'SATELLITE_AI', restrictionNotes: 'Severe monsoon flooding - Mithi River overflow' },
    }),
    // Eastern Express Highway - OPEN
    prisma.roadState.create({
      data: { segmentId: roads[1].id, status: 'OPEN', currentSpeedKmh: 60, floodDepthMm: 0, updatedBySource: 'TELEMETRY' },
    }),
    // CST Road - RESTRICTED
    prisma.roadState.create({
      data: { segmentId: roads[2].id, status: 'RESTRICTED', currentSpeedKmh: 15, floodDepthMm: 200, updatedBySource: 'DISPATCHER_MANUAL', restrictionNotes: 'Partial waterlogging - passable for heavy vehicles only' },
    }),
    // Somaiya Road - OPEN
    prisma.roadState.create({
      data: { segmentId: roads[3].id, status: 'OPEN', currentSpeedKmh: 20, floodDepthMm: 50, updatedBySource: 'TELEMETRY' },
    }),
    // Andheri-Kurla - RESTRICTED
    prisma.roadState.create({
      data: { segmentId: roads[4].id, status: 'RESTRICTED', currentSpeedKmh: 10, floodDepthMm: 350, updatedBySource: 'SATELLITE_AI', restrictionNotes: 'Low-lying section waterlogged' },
    }),
    // Mithi River Bridge - CLOSED DAMAGE
    prisma.roadState.create({
      data: { segmentId: roads[5].id, status: 'CLOSED_DAMAGE', currentSpeedKmh: 0, floodDepthMm: 1200, updatedBySource: 'SATELLITE_AI', restrictionNotes: 'Bridge structural integrity compromised - DO NOT USE' },
    }),
    // Ghatkopar Link - OPEN
    prisma.roadState.create({
      data: { segmentId: roads[6].id, status: 'OPEN', currentSpeedKmh: 25, floodDepthMm: 0, updatedBySource: 'TELEMETRY' },
    }),
    // Sion-Panvel - OPEN
    prisma.roadState.create({
      data: { segmentId: roads[7].id, status: 'OPEN', currentSpeedKmh: 50, floodDepthMm: 0, updatedBySource: 'TELEMETRY' },
    }),
  ]);

  // --- Vehicles ---
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        agencyId: ndrf.id,
        callSign: 'NDRF-AMPHIB-01',
        type: 'AMPHIBIOUS_TRUCK',
        status: 'AVAILABLE',
        defaultAssetLocation: JSON.stringify({ type: 'Point', coordinates: [72.8620, 19.0750] }),
        maxWeightKg: 8000,
        maxWaterDepthMm: 1200,
        clearanceM: 1.8,
      },
    }),
    prisma.vehicle.create({
      data: {
        agencyId: ndrf.id,
        callSign: 'NDRF-BOAT-01',
        type: 'BOAT',
        status: 'AVAILABLE',
        defaultAssetLocation: JSON.stringify({ type: 'Point', coordinates: [72.8580, 19.0680] }),
        maxWeightKg: 2000,
        maxWaterDepthMm: 5000,
        clearanceM: 0.5,
      },
    }),
    prisma.vehicle.create({
      data: {
        agencyId: bmc.id,
        callSign: 'BMC-4X4-AMB-01',
        type: '4X4_AMBULANCE',
        status: 'AVAILABLE',
        defaultAssetLocation: JSON.stringify({ type: 'Point', coordinates: [72.9000, 19.0740] }),
        maxWeightKg: 5000,
        maxWaterDepthMm: 450,
        clearanceM: 0.9,
      },
    }),
    prisma.vehicle.create({
      data: {
        agencyId: bmc.id,
        callSign: 'BMC-STD-01',
        type: 'STANDARD',
        status: 'AVAILABLE',
        defaultAssetLocation: JSON.stringify({ type: 'Point', coordinates: [72.8900, 19.0700] }),
        maxWeightKg: 3500,
        maxWaterDepthMm: 300,
        clearanceM: 0.4,
      },
    }),
  ]);

  // --- Vehicle Equipment ---
  await Promise.all([
    prisma.vehicleEquipment.create({ data: { vehicleId: vehicles[0].id, equipmentId: winch.id, quantity: 1 } }),
    prisma.vehicleEquipment.create({ data: { vehicleId: vehicles[0].id, equipmentId: pump.id, quantity: 2 } }),
    prisma.vehicleEquipment.create({ data: { vehicleId: vehicles[0].id, equipmentId: medKit.id, quantity: 1 } }),
    prisma.vehicleEquipment.create({ data: { vehicleId: vehicles[1].id, equipmentId: raft.id, quantity: 3 } }),
    prisma.vehicleEquipment.create({ data: { vehicleId: vehicles[1].id, equipmentId: medKit.id, quantity: 2 } }),
    prisma.vehicleEquipment.create({ data: { vehicleId: vehicles[2].id, equipmentId: medKit.id, quantity: 3 } }),
    prisma.vehicleEquipment.create({ data: { vehicleId: vehicles[2].id, equipmentId: winch.id, quantity: 1 } }),
    prisma.vehicleEquipment.create({ data: { vehicleId: vehicles[3].id, equipmentId: medKit.id, quantity: 1 } }),
  ]);

  // --- Vehicle Telemetry ---
  await Promise.all([
    prisma.vehicleTelemetry.create({
      data: {
        vehicleId: vehicles[0].id,
        location: JSON.stringify({ type: 'Point', coordinates: [72.8620, 19.0750] }),
        currentSpeedKmh: 0,
        heading: 45,
        fuelLevelPercent: 87,
      },
    }),
    prisma.vehicleTelemetry.create({
      data: {
        vehicleId: vehicles[1].id,
        location: JSON.stringify({ type: 'Point', coordinates: [72.8580, 19.0680] }),
        currentSpeedKmh: 0,
        heading: 120,
        fuelLevelPercent: 92,
      },
    }),
    prisma.vehicleTelemetry.create({
      data: {
        vehicleId: vehicles[2].id,
        location: JSON.stringify({ type: 'Point', coordinates: [72.9000, 19.0740] }),
        currentSpeedKmh: 0,
        heading: 270,
        fuelLevelPercent: 65,
      },
    }),
    prisma.vehicleTelemetry.create({
      data: {
        vehicleId: vehicles[3].id,
        location: JSON.stringify({ type: 'Point', coordinates: [72.8900, 19.0700] }),
        currentSpeedKmh: 0,
        heading: 180,
        fuelLevelPercent: 43,
      },
    }),
  ]);

  // --- Hazard Areas ---
  await Promise.all([
    prisma.hazardArea.create({
      data: {
        type: 'FLOOD',
        severityIndex: 8.5,
        geometry: JSON.stringify({
          type: 'Polygon',
          coordinates: [[[72.8750, 19.0700], [72.8900, 19.0700], [72.8900, 19.0780], [72.8750, 19.0780], [72.8750, 19.0700]]],
        }),
      },
    }),
    prisma.hazardArea.create({
      data: {
        type: 'COLLAPSE',
        severityIndex: 7.2,
        geometry: JSON.stringify({
          type: 'Point',
          coordinates: [72.9080, 19.0760],
        }),
      },
    }),
    prisma.hazardArea.create({
      data: {
        type: 'FLOOD',
        severityIndex: 6.0,
        geometry: JSON.stringify({
          type: 'Polygon',
          coordinates: [[[72.8500, 19.0680], [72.8660, 19.0680], [72.8660, 19.0740], [72.8500, 19.0740], [72.8500, 19.0680]]],
        }),
      },
    }),
  ]);

  // --- Incidents ---
  await Promise.all([
    prisma.incidentReport.create({
      data: {
        reportedLocation: JSON.stringify({ type: 'Point', coordinates: [72.8830, 19.0745] }),
        type: 'TRAPPED',
        description: 'Mithi River overflow — 14 civilians trapped on rooftop of 3-story building. Water level rising rapidly. Flood depth estimated at 850mm and increasing.',
        priority: 'CRITICAL',
        status: 'VERIFIED',
      },
    }),
    prisma.incidentReport.create({
      data: {
        reportedLocation: JSON.stringify({ type: 'Point', coordinates: [72.9080, 19.0760] }),
        type: 'EVACUATION',
        description: 'Compound wall collapse at Ghatkopar residential complex. 3 people reported trapped under debris. Structural assessment needed before rescue.',
        priority: 'HIGH',
        status: 'NEW',
      },
    }),
    prisma.incidentReport.create({
      data: {
        reportedLocation: JSON.stringify({ type: 'Point', coordinates: [72.9000, 19.0748] }),
        type: 'MEDICAL',
        description: 'Medical emergency at K. J. Somaiya Campus — student injured during evacuation. Requires 4x4 ambulance access due to waterlogged campus road.',
        priority: 'MEDIUM',
        status: 'NEW',
      },
    }),
  ]);

  console.log('✅ Seed complete! Database populated with Mumbai Vidyavihar/Kurla disaster scenario data.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
