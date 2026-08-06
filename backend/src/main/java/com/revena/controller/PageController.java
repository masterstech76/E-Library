package com.revena.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves the E-Library static pages (HTML/CSS/JS) from the repository root.
 *
 * <p>The frontend files live outside the backend, at:
 * <ul>
 *   <li>$ROOT/html/index.html            → home</li>
 *   <li>$ROOT/html/pages/features/*.html → feature pages</li>
 *   <li>$ROOT/css/*.css                  → stylesheets</li>
 *   <li>$ROOT/js/*.js                    → scripts</li>
 * </ul>
 * This controller resolves those paths and returns them with the correct MIME type.</p>
 */
@RestController
public class PageController {

  /** Repository root. When running from backend/, CWD is <repo>/backend, so parent is <repo>. */
  private static final Path ROOT = Paths.get("").toAbsolutePath().getParent();

  private static final MediaType HTML = MediaType.parseMediaType("text/html;charset=UTF-8");
  private static final MediaType CSS = MediaType.parseMediaType("text/css;charset=UTF-8");
  private static final MediaType JS = MediaType.parseMediaType("application/javascript;charset=UTF-8");
  private static final MediaType WEBP = MediaType.parseMediaType("image/webp");
  private static final MediaType SVG = MediaType.parseMediaType("image/svg+xml");
  private static final MediaType OCTET = MediaType.parseMediaType("application/octet-stream");

  @GetMapping(value = {"/", "/index.html"})
  public ResponseEntity<byte[]> home() throws IOException {
    return serve(ROOT.resolve("html/index.html"), HTML);
  }

  @GetMapping("/pages/{type}/{name}.html")
  public ResponseEntity<byte[]> featurePage(
      @PathVariable String type, @PathVariable String name) throws IOException {
    Path file = ROOT.resolve("html/pages").resolve(type).resolve(name + ".html");
    return serve(file, HTML);
  }

  @GetMapping("/css/{name}.css")
  public ResponseEntity<byte[]> css(@PathVariable String name) throws IOException {
    return serve(ROOT.resolve("css").resolve(name + ".css"), CSS);
  }

  @GetMapping("/js/{name}.js")
  public ResponseEntity<byte[]> js(@PathVariable String name) throws IOException {
    return serve(ROOT.resolve("js").resolve(name + ".js"), JS);
  }

  @GetMapping("/assets/{folder}/{name}")
  public ResponseEntity<byte[]> asset(@PathVariable String folder, @PathVariable String name)
      throws IOException {
    String ext = name.contains(".") ? name.substring(name.lastIndexOf('.') + 1) : "";
    MediaType type = mediaTypeFor(ext);
    return serve(ROOT.resolve("assets").resolve(folder).resolve(name), type);
  }

  @SuppressWarnings("null")
  private ResponseEntity<byte[]> serve(Path path, MediaType type) throws IOException {
    if (!Files.exists(path) || !Files.isRegularFile(path)) {
      return ResponseEntity.notFound().build();
    }
    byte[] body = Files.readAllBytes(path);
    return ResponseEntity.ok().contentType(type).body(body);
  }

  private MediaType mediaTypeFor(String ext) {
    switch (ext.toLowerCase()) {
      case "png": return MediaType.IMAGE_PNG;
      case "jpg": return MediaType.IMAGE_JPEG;
      case "jpeg": return MediaType.IMAGE_JPEG;
      case "gif": return MediaType.IMAGE_GIF;
      case "webp": return WEBP;
      case "svg": return SVG;
      case "css": return CSS;
      case "js": return JS;
      default: return OCTET;
    }
  }
}
