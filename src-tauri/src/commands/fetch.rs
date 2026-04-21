use tauri::command;

#[command]
pub async fn fetch_url(url: String) -> Result<String, String> {
    let jina_url = format!("https://r.jina.ai/{}", url);

    let client = reqwest::Client::new();
    let response = client
        .get(&jina_url)
        .header("Accept", "text/markdown")
        .send()
        .await
        .map_err(|e| format!("Failed to fetch URL: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Jina Reader failed ({}): {}",
            response.status(),
            response.status().canonical_reason().unwrap_or("Unknown error")
        ));
    }

    let markdown = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    if markdown.trim().is_empty() {
        return Err("Jina Reader returned empty content".to_string());
    }

    Ok(markdown)
}
