package com.revena;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * ReVena E-Library Backend.
 *
 * <p>Serves all static E-Library pages (HTML/CSS/JS) from the classpath and
 * exposes REST API endpoints for the live-internet AI agent.</p>
 */
@SpringBootApplication
public class RevenaBackendApplication {

  public static void main(String[] args) {
    SpringApplication.run(RevenaBackendApplication.class, args);
  }

  /**
   * Global CORS configuration so the frontend (on any origin) can call the
   * backend APIs during development and when served from a different host.
   */
  @Configuration
  public static class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
      registry.addMapping("/api/**")
              .allowedOriginPatterns("*")
              .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
              .allowedHeaders("*")
              .allowCredentials(true);
    }
  }
}
