import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger;
    server: Server;
    private readonly userSockets;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitToUser(userId: string, event: string, payload: Record<string, unknown>): void;
    broadcastMapUpdate(payload: Record<string, unknown>): void;
    handlePing(data: any, client: Socket): void;
}
