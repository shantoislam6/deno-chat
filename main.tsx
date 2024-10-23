import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic, upgradeWebSocket } from "hono/deno";

import "jsr:@std/dotenv/load";

import ChatBox from "./ChatBox.tsx";
import type { WSContext } from "hono/ws";

import dayjs from "dayjs";

const app = new Hono();

if (Deno.env.get("MODE") === "development") {
  app.use(logger());
}

app.use(
  "/static/*",
  serveStatic({
    root: "./",
  }),
);

let id = 0;

const connectedClients = new Map<string, {
  clientId: string;
  ws: WSContext<WebSocket>;
  username: string;
}>();

const sendClientMessage = (payload: {
  type: string;
  data: object;
}, clientId: string) => {
  const client = connectedClients.get(clientId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(payload));
  }
};

const sendBroadCastMessage = (payload: object, clientId: string) => {
  for (const [key, client] of connectedClients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      if (key !== clientId) {
        client.ws.send(JSON.stringify({
          type: "broadCastMessage",
          data: { clientId: clientId, ...payload },
        }));
      }
    }
  }
};

const sendJoinMessageToOtherClients = (user: {
  username: string;
  join_at: string;
}, clientId: string) => {
  for (const [key, client] of connectedClients) {
    if (key !== clientId) {
      client.ws.send(JSON.stringify({
        type: "join",
        data: {
          clientId,
          ...user,
        },
      }));
    }
  }
};

const sendLeaveMessageToOtherClients = (clientId: string) => {
  console.log(clientId);
  for (const [key, client] of connectedClients) {
    if (key !== clientId) {
      client.ws.send(JSON.stringify({
        type: "leave",
        data: {
          clientId,
        },
      }));
    }
  }
};

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    const url = new URL(c.req.url);

    const clientId = `C${id}_${crypto.randomUUID()}`;

    id++;
    const username = url.searchParams.get("name") || "Anonymous";
    return {
      onMessage(event) {
        const message = JSON.parse(event.data as string);
        switch (message.type) {
          case "join": {
            sendJoinMessageToOtherClients({
              username,
              join_at: dayjs().format("YYYY MMM DD HH:mm A"),
            }, clientId);
            break;
          }
          case "message": {
            console.log(
              `Message from ${clientId} | ${username}: ${message.data.message}`,
            );
            sendClientMessage({
              data: {
                username,
                message: message.data.message,
                sent_at: dayjs().format("YYYY MMM DD HH:mm A"),
              },
              type: "sendMessagge",
            }, clientId);

            sendBroadCastMessage({
              username,
              message: message.data.message,
              sent_at: dayjs().format("YYYY MMM DD HH:mm A"),
            }, clientId);

            break;
          }
        }
      },

      onOpen(_event, ws) {
        connectedClients.set(clientId, {
          clientId,
          ws,
          username: url.searchParams.get("name") || "Anonymous",
        });
        sendClientMessage({
          data: {
            clientId,
            username,
            join_at: dayjs().format("YYYY MMM DD HH:mm A"),
          },
          type: "welcome",
        }, clientId);
      },
      onClose: () => {
        sendLeaveMessageToOtherClients(clientId);
        connectedClients.delete(clientId);
      },
      onError: (e) => {
        console.error(e);
      },
    };
  }),
);

app.get("/", (c) => {
  return c.html(
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div className="flex justify-end items-center min-h-screen">
          <ChatBox />
        </div>
        <script type="module" src="/static/main.js"></script>
      </body>
    </html>,
  );
});

const PORT = Deno.env.get("PORT") ? parseInt(Deno.env.get("PORT")!) : 8000;

Deno.serve({ port: PORT }, app.fetch);
