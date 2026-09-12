package com.example.cursorsync.controller;

import com.example.cursorsync.model.CursorUpdate;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * Stateless by design: we don't keep a server-side list of "who is in the
 * room". Every client just re-broadcasts its own position to everyone else
 * currently subscribed to that room's topic. The frontend is responsible
 * for expiring cursors it hasn't heard from in a few seconds (see
 * cursor.service.ts) -- that's what makes a silent disconnect (closed tab,
 * dropped wifi) resolve itself without any extra "who's online" bookkeeping.
 */
@Controller
public class CursorController {

    private final SimpMessagingTemplate messagingTemplate;

    public CursorController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/cursor/{room}")
    public void broadcastCursor(@DestinationVariable String room, CursorUpdate update) {
        messagingTemplate.convertAndSend("/topic/cursor/" + room, update);
    }
}
