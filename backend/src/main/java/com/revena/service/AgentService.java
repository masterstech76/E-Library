package com.revena.service;

import com.revena.dto.ChatRequest;
import com.revena.dto.ChatResponse;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

/**
 * A live-internet AI agent service.
 *
 * <p>The agent fetches <em>real, current information</em> directly from the open
 * web (Wikipedia REST API and DuckDuckGo Instant Answer API) and presents the
 * content directly to students — it does NOT merely link out to Google/Gemini or
 * other agents. It always refuses to answer live exam questions.</p>
 */
@Service
public class AgentService {

  private static final Pattern EXAM_PATTERN = Pattern.compile(
    "(?i)\\b(answer[s]?|solve|give me the answer|what is the answer|which option|correct option|"
    + "answer key|solution|exam answer|live exam|mock exam answer)\\b" +
    ".*\\b(question|mcq|numerical|this|q\\d+)\\b|\\b(question (\\d+)|q\\d+)[^?]*\\?\\s*$");

  private static final Pattern GREETING_PATTERN = Pattern.compile(
    "(?i)\\b(hi|hello|hey|namaste|namaskar|good morning|good afternoon|good evening)\\b");

  private static final Pattern THANKS_PATTERN = Pattern.compile(
    "(?i)\\b(thanks|thank you|thankyou|thx|dhanyavad)\\b");

  private static final Pattern WHO_PATTERN = Pattern.compile(
    "(?i)\\b(who are you|what are you|about you|your name|introduce yourself)\\b");

  private static final Pattern FEATURE_PATTERN = Pattern.compile(
    "(?i)\\b(jee|neet|mock exam|objective trainer|adaptive quiz|flashcard|prev\\s?ious year|"
    + "textbook|video lecture|sticky notes|summar|past paper)\\b");

  // Typical exam-answer keywords that should always be refused
  private static final String[] REFUSAL_KEYWORDS = {
    "answer key", "give answer", "correct answer", "which option", "solve this",
    "solve the question", "what is the answer", "answer please", "exam answer",
    "live exam", "mock answer", "tell me the answer", "solution to q"
  };

  /**
   * Processes a chat message. Returns live web info when applicable, otherwise a
   * helpful study-oriented response. Refuses to answer live exam questions.
   */
  public ChatResponse respond(ChatRequest request) {
    String message = request == null || request.getMessage() == null
        ? "" : request.getMessage().trim();

    if (message.isEmpty()) {
      return new ChatResponse(
          "Please type a study question or topic and I'll fetch real information from the web for you.",
          "system", false, false);
    }

    // 1) Refuse live exam answers
    if (isExamQuestion(message)) {
      return new ChatResponse(
          "I'm not allowed to answer live exam questions or provide answers to exam question papers. "
          + "I can, however, help you understand concepts, formulas, and study topics legitimately. "
          + "What concept would you like to learn about?",
          "guardrail", false, true);
    }

    // 2) Handle greetings / identity / thanks locally
    if (GREETING_PATTERN.matcher(message).find()) {
      return new ChatResponse(
          "Hello! 👋 I'm your ReVena AI study assistant. I have live internet access and can bring you "
          + "real, up-to-date information on any topic. Ask me about a concept, formula, subject topic, "
          + "or ask about the E-Library features. For exam help, I'll always guide you to learn rather "
          + "than give away answers.",
          "ReVena", false, false);
    }
    if (WHO_PATTERN.matcher(message).find()) {
      return new ChatResponse(
          "I'm the ReVena AI Agent 🤖 — a live, internet-connected study assistant built into the "
          + "E-Library. I fetch real information from the open web and present it directly to you, "
          + "helping with concepts, formulas, definitions, and study planning. I won't answer live "
          + "exam questions, but I'll help you understand anything you're studying.",
          "ReVena", false, false);
    }
    if (THANKS_PATTERN.matcher(message).find()) {
      return new ChatResponse(
          "You're welcome! 😊 Happy studying. Ask me anytime for real, up-to-date information on any topic.",
          "ReVena", false, false);
    }

    // 3) Try live web fetch (Wikipedia + DuckDuckGo)
    ChatResponse live = fetchLiveInfo(message);
    if (live != null) {
      return live;
    }

    // 4) Fallback: feature / study guidance
    if (FEATURE_PATTERN.matcher(message).find()) {
      return new ChatResponse(
          "That's one of the E-Library study features! 📚 I can explain how to use it, or I can fetch "
          + "real study content on that topic from the web. Try asking me to fetch a specific concept "
          + "or formula. (Tip: type a concrete topic like \"Newton's second law\" for live info.)",
          "ReVena", false, false);
    }

    return new ChatResponse(
        "I couldn't find a definite live answer for that yet. Try asking about a specific concept, "
        + "formula, definition, or subject topic (for example: \"What is Newton's second law?\" or "
        + "\"Explain photosynthesis\"). I'll fetch real information from the web for you.",
        "ReVena", false, false);
  }

  /**
   * Detects whether the message is trying to get a live exam question answered.
   */
  private boolean isExamQuestion(String message) {
    String lower = message.toLowerCase();
    for (String kw : REFUSAL_KEYWORDS) {
      if (lower.contains(kw)) {
        return true;
      }
    }
    return EXAM_PATTERN.matcher(message).find();
  }

  /**
   * Attempts to fetch real information from the live web.
   *
   * @return a ChatResponse with live data, or null if nothing meaningful found.
   */
  private ChatResponse fetchLiveInfo(String message) {
    try {
      // Extract a clean topic first so both APIs receive a searchable query.
      String searchTopic = extractTopic(message);
      // 1) DuckDuckGo Instant Answer API — good for definitions, formulas, quick facts.
      String ddg = fetchUrl(
          "https://api.duckduckgo.com/?q=" + encode(searchTopic) + "&format=json&no_html=1&skip_disambig=1");
      if (ddg != null) {
        JSONObject root = new JSONObject(ddg);
        String abstractText = root.optString("AbstractText", "");
        JSONArray related = root.optJSONArray("RelatedTopics");

        if (!abstractText.isEmpty() && abstractText.length() > 40) {
          String source = "DuckDuckGo Instant Answer";
          return new ChatResponse(abstractText, source, true, false);
        }

        // Try first related topic that has a text
        if (related != null) {
          for (int i = 0; i < related.length(); i++) {
            JSONObject topic = related.optJSONObject(i);
            if (topic != null) {
              String text = topic.optString("Text", "");
              if (!text.isEmpty() && text.length() > 40) {
                return new ChatResponse(text, "DuckDuckGo Related Topic", true, false);
              }
              // Nested topics
              JSONArray nested = topic.optJSONArray("Topics");
              if (nested != null) {
                for (int j = 0; j < nested.length(); j++) {
                  JSONObject n = nested.optJSONObject(j);
                  if (n != null) {
                    String nText = n.optString("Text", "");
                    if (!nText.isEmpty() && nText.length() > 40) {
                      return new ChatResponse(nText, "DuckDuckGo Related Topic", true, false);
                    }
                  }
                }
              }
            }
          }
        }
      }

      // 2) Wikipedia REST API — good for concepts, definitions, explanations.
      String wiki = fetchUrl(
          "https://en.wikipedia.org/api/rest_v1/page/summary/" + encode(searchTopic));
      if (wiki != null) {
        JSONObject w = new JSONObject(wiki);
        String extract = w.optString("extract", "");
        String title = w.optString("title", "");
        String desc = w.optString("description", "");
        if (!extract.isEmpty() && !title.isEmpty()) {
          StringBuilder sb = new StringBuilder();
          if (!desc.isEmpty()) {
            sb.append(desc).append(". ");
          }
          sb.append(extract);
          return new ChatResponse(sb.toString(), "Wikipedia — " + title, true, false);
        }
      }
    } catch (Exception e) {
      // Fall through to default response
    }
    return null;
  }

  /**
   * Performs a GET request and returns the response body as a String, or null on failure.
   */
  private String fetchUrl(String urlString) {
    HttpURLConnection conn = null;
    try {
      // Use a 5-second timeout so the agent never hangs the UI.
      conn = (HttpURLConnection) URI.create(urlString).toURL().openConnection();
      conn.setRequestMethod("GET");
      conn.setConnectTimeout(5000);
      conn.setReadTimeout(8000);
      conn.setRequestProperty("User-Agent", "ReVena-E-Library/1.0 (educational study assistant)");
      conn.setRequestProperty("Accept", "application/json");

      int code = conn.getResponseCode();
      // DuckDuckGo's Instant Answer API sometimes returns 202 Accepted; treat
      // 2xx responses as success so we can parse the body.
      if (code < 200 || code >= 300) {
        return null;
      }

      StringBuilder sb = new StringBuilder();
      try (BufferedReader in = new BufferedReader(
          new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
        String line;
        while ((line = in.readLine()) != null) {
          sb.append(line);
        }
      }
      return sb.toString();
    } catch (Exception e) {
      return null;
    } finally {
      if (conn != null) {
        conn.disconnect();
      }
    }
  }

  private String encode(String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8);
  }

  /**
   * Extracts a clean Wikipedia-style topic from a natural-language query.
   * Removes leading verbs/questions and trailing question marks so the API
   * receives a proper page title (e.g. "Explain Newton's second law" →
   * "Newton's second law").
   */
  private String extractTopic(String message) {
    String t = message.trim().replaceAll("\\s+", " ");
    // Strip leading polite/instruction words
    t = t.replaceAll("(?i)^\\s*(please|can you|could you|would you|tell me|explain|what is|what are|define|describe|about|whats|what's)\\s+", "");
    // Handle common possessive forms
    t = t.replaceAll("(?i)\\bnewtons\\b", "newton's");
    t = t.replaceAll("(?i)\\bmendeleevs\\b", "mendeleev's");
    // Remove trailing punctuation / question words
    t = t.replaceAll("[?]+\\s*$", "");
    t = t.replaceAll("\\s+$", "");
    return t;
  }
}
