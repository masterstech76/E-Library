package com.revena.controller;

import com.revena.dto.ChatRequest;
import com.revena.dto.ChatResponse;
import com.revena.service.AgentService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST endpoints for the ReVena AI agent and backend health.
 */
@RestController
@RequestMapping("/api")
public class AgentController {

  private final AgentService agentService;

  public AgentController(AgentService agentService) {
    this.agentService = agentService;
  }

  /** Simple health check the frontend uses to detect if the backend is live. */
  @GetMapping("/health")
  public ResponseEntity<Map<String, Object>> health() {
    return ResponseEntity.ok(Map.of(
        "status", "ok",
        "service", "ReVena E-Library Backend",
        "version", "1.0.0",
        "agent", true
    ));
  }

  /** Chat endpoint — the AI agent answers with live internet info. */
  @PostMapping("/agent/chat")
  public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
    ChatResponse response = agentService.respond(request);
    return ResponseEntity.ok(response);
  }
}
