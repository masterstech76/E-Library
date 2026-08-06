package com.revena.dto;

/**
 * Response payload returned to the AI agent chat container.
 */
public class ChatResponse {

  private String reply;
  private String source;
  private boolean live;
  private boolean refused;

  public ChatResponse() {
  }

  public ChatResponse(String reply, String source, boolean live, boolean refused) {
    this.reply = reply;
    this.source = source;
    this.live = live;
    this.refused = refused;
  }

  public String getReply() {
    return reply;
  }

  public void setReply(String reply) {
    this.reply = reply;
  }

  public String getSource() {
    return source;
  }

  public void setSource(String source) {
    this.source = source;
  }

  public boolean isLive() {
    return live;
  }

  public void setLive(boolean live) {
    this.live = live;
  }

  public boolean isRefused() {
    return refused;
  }

  public void setRefused(boolean refused) {
    this.refused = refused;
  }
}
