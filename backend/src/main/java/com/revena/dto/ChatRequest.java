package com.revena.dto;

/**
 * Incoming chat message from the AI agent frontend container.
 */
public class ChatRequest {

  private String message;
  private String subject;

  public ChatRequest() {
  }

  public ChatRequest(String message, String subject) {
    this.message = message;
    this.subject = subject;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public String getSubject() {
    return subject;
  }

  public void setSubject(String subject) {
    this.subject = subject;
  }
}
