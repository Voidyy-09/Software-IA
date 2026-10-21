import { useEffect, useRef, useCallback } from 'react';
import { useEmergencyStore } from '../store/useEmergencyStore';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const {
    setConnected,
    updateTelemetry,
    updateRoadSegmentStatus,
    addNotification,
  } = useEmergencyStore();

  const connect = useCallback(() => {
    // Determine WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('📡 WebSocket connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('📡 WebSocket disconnected');
      setConnected(false);
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [setConnected]);

  const handleMessage = useCallback(
    (message: { type: string; payload: any }) => {
      switch (message.type) {
        case 'CONNECTION_ESTABLISHED':
          addNotification({
            id: `conn-${Date.now()}`,
            type: 'success',
            title: 'Command Link Established',
            message: 'Connected to Disaster Response Command Server',
            timestamp: new Date().toISOString(),
          });
          break;

        case 'TELEMETRY_UPDATE':
          updateTelemetry(message.payload.vehicles);
          break;

        case 'ROAD_STATUS_CHANGED':
          updateRoadSegmentStatus(
            message.payload.segmentId,
            message.payload.newStatus,
            message.payload.floodDepthMm
          );
          addNotification({
            id: `road-${Date.now()}`,
            type: 'warning',
            title: 'Road Status Changed',
            message: `Segment ${message.payload.segmentId} → ${message.payload.newStatus}`,
            timestamp: message.payload.timestamp,
          });
          break;

        case 'ROUTE_INVALIDATED_REROUTING':
          addNotification({
            id: `reroute-${Date.now()}`,
            type: 'critical',
            title: '⚠️ Route Invalidated — Rerouting',
            message: `${message.payload.vehicleCallSign}: ${message.payload.reason}`,
            timestamp: message.payload.timestamp,
          });
          break;

        case 'VEHICLE_DISPATCHED':
          addNotification({
            id: `dispatch-${Date.now()}`,
            type: 'info',
            title: 'Vehicle Dispatched',
            message: `${message.payload.vehicleCallSign} → Incident #${message.payload.incidentId}`,
            timestamp: message.payload.timestamp,
          });
          // Refresh vehicle list to load newly attached mission route
          fetch('/api/vehicles')
            .then((r) => r.json())
            .then((vList) => {
              if (Array.isArray(vList)) useEmergencyStore.getState().setVehicles(vList);
            })
            .catch(() => {});
          break;

        case 'HAZARD_DETECTED':
          addNotification({
            id: `hazard-${Date.now()}`,
            type: 'critical',
            title: '🛰️ Satellite Hazard Detected',
            message: `${message.payload.detectionCount} new hazard(s) identified`,
            timestamp: message.payload.timestamp,
          });
          break;
      }
    },
    [updateTelemetry, updateRoadSegmentStatus, addNotification]
  );

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return { ws: wsRef.current };
}
