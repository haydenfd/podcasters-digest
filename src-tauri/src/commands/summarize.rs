use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Serialize)]
struct AnthropicRequest {
    model: String,
    max_tokens: u32,
    messages: Vec<Message>,
}

#[derive(Serialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct AnthropicResponse {
    content: Vec<ContentBlock>,
}

#[derive(Deserialize)]
struct ContentBlock {
    #[serde(rename = "type")]
    content_type: String,
    text: String,
}

#[command]
pub async fn summarize(content: String, api_key: String) -> Result<String, String> {
    let client = reqwest::Client::new();

    let prompt = format!(
        r#"Please create a concise summary of this content in markdown format. Focus on the main points and key takeaways:

{}

Provide a well-structured summary with:
1. A brief overview (2-3 sentences)
2. Key points (bullet points)
3. Main takeaways or conclusions

Keep it concise but informative."#,
        content
    );

    let request_body = AnthropicRequest {
        model: "claude-sonnet-4-5-20251001".to_string(),
        max_tokens: 4096,
        messages: vec![Message {
            role: "user".to_string(),
            content: prompt,
        }],
    };

    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Failed to call Anthropic API: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Anthropic API failed ({}): {}", status, error_text));
    }

    let api_response: AnthropicResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Anthropic response: {}", e))?;

    if let Some(first_block) = api_response.content.first() {
        Ok(first_block.text.clone())
    } else {
        Err("Anthropic API returned empty content".to_string())
    }
}
