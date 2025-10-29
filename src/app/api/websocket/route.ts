/**
 * WebSocket API for Real-Time Updates
 * Handles live risk monitoring and alerts
 */

import { NextRequest } from 'next/server';
import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  jobId?: string;
}

let wss: WebSocketServer | null = null;

function initializeWebSocketServer() {
  if (wss) return wss;

  wss = new WebSocketServer({
    port: 8080,
    perMessageDeflate: false,
  });

  wss.on('connection', async (ws: ExtendedWebSocket, request: IncomingMessage) => {
    console.log('WebSocket connection established');

    // Authenticate user
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        ws.close(1008, 'Unauthorized');
        return;
      }

      ws.userId = user.id;

      // Handle messages
      ws.on('message', async (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());

          if (data.type === 'subscribe' && data.jobId) {
            ws.jobId = data.jobId;
            console.log(`User ${ws.userId} subscribed to job ${ws.jobId}`);

            // Send initial risk data if available
            await sendInitialRiskData(ws, data.jobId);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

    } catch (error) {
      console.error('WebSocket authentication error:', error);
      ws.close(1008, 'Authentication failed');
    }
  });

  return wss;
}

async function sendInitialRiskData(ws: ExtendedWebSocket, jobId: string) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Fetch current risk data
    const { data: job } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', ws.userId)
      .single();

    if (job && job.metadata) {
      const riskData = {
        type: 'risk_update',
        data: {
          overallRiskScore: job.metadata.riskAssessment?.overallRiskScore || 0,
          fraudScore: job.metadata.advancedFraud?.fraudScore || 0,
          bankingBehaviorScore: job.metadata.bankingBehavior?.behaviorScore || 0,
          foir: job.metadata.foirAnalysis?.foir || 0,
          alerts: job.metadata.fraudAlerts || [],
          timestamp: new Date().toISOString()
        }
      };

      ws.send(JSON.stringify(riskData));
    }
  } catch (error) {
    console.error('Failed to send initial risk data:', error);
  }
}

export async function GET(request: NextRequest) {
  // Initialize WebSocket server if not already done
  initializeWebSocketServer();

  return new Response('WebSocket server initialized', { status: 200 });
}

// Function to broadcast risk updates to connected clients
// Note: This function is internal to the WebSocket route
// TODO: Move to a separate service if needed by other modules
async function broadcastRiskUpdate(jobId: string, riskData: any) {
  if (!wss) return;

  wss.clients.forEach((client: ExtendedWebSocket) => {
    if (client.readyState === WebSocket.OPEN && client.jobId === jobId) {
      const update = {
        type: 'risk_update',
        data: {
          ...riskData,
          timestamp: new Date().toISOString()
        }
      };

      client.send(JSON.stringify(update));
    }
  });
}